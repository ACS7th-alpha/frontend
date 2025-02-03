import time
import json
import re
import sys
import os
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

# Windows에서 UTF-8 인코딩 강제 설정
sys.stdout.reconfigure(encoding='utf-8')

# -----------------------------
# 1) 여러 카테고리 정의
# -----------------------------
CATEGORY_LIST = [
    {
        "name": "기저귀/물티슈",
        "xpath": "//p[contains(text(), '기저귀/물티슈')]"
    },
    {
        "name": "유모차/카시트",
        "xpath": "//p[contains(text(), '유모차/카시트')]"
    },
    {
        "name": "욕실용품/스킨",
        "xpath": "//p[contains(text(), '욕실용품/스킨')]"
    },
    # 필요하면 계속 추가...
]

def setup_driver():
    """Chrome WebDriver 설정"""
    options = webdriver.ChromeOptions()
    # 필요 시 Headless 모드 사용 (이미지 로딩 잘 되는지 확인해보세요)
    # options.add_argument('--headless')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_argument(
        'user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
        'AppleWebKit/537.36 (KHTML, like Gecko) '
        'Chrome/91.0.4472.124 Safari/537.36'
    )
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    return driver


def scroll_down(driver, count=3):
    """여러 번 스크롤을 내려 추가 상품을 로딩"""
    for i in range(count):
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(2)  # 사이트 속도에 따라 조정
        print(f"[-] 스크롤 {i + 1}회 완료")


def click_category(driver, category_name, xpath):
    """주어진 XPath의 카테고리(또는 탭)를 클릭"""
    try:
        element = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, xpath))
        )
        driver.execute_script("arguments[0].click();", element)
        time.sleep(3)  # 클릭 후 페이지 전환까지 대기
        print(f"[✓] '{category_name}' 클릭 성공")
    except Exception as e:
        print(f"[X] '{category_name}' 클릭 실패:", str(e).encode("utf-8", errors="ignore").decode())
        return False
    return True


def parse_products(driver, category_name):
    """
    '기저귀/물티슈' 단일 크롤링 시 이미지가 잘 나왔던 함수 그대로 사용.
    - scrollIntoView + time.sleep(0.5) 적용
    - 카테고리명도 함께 저장 (item['category']).
    """
    results = []
    products = driver.find_elements(By.CSS_SELECTOR, "ul#kidiSearchItemList_400002 li")

    for product in products:
        try:
            # 기존 코드: item = {}
            # 여러 카테고리라 구분할 수 있도록 category 필드 추가
            item = {"category": category_name}

            # 1) 제품명
            try:
                name_elem = product.find_element(By.CSS_SELECTOR, "p.prd")
                item['name'] = name_elem.text.strip()
            except:
                item['name'] = "제품명 없음"

            # 2) 가격
            try:
                price_elem = product.find_element(By.CSS_SELECTOR, "span.price em")
                item['sale_price'] = price_elem.text.strip() + "원"
            except:
                item['sale_price'] = "가격 없음"

            # 3) 상품 링크
            try:
                link_elem = product.find_element(By.CSS_SELECTOR, "a")
                item['link'] = link_elem.get_attribute("href")
            except:
                item['link'] = "링크 없음"

            # 4) 이미지 가져오기 (Lazy Loading)
            try:
                img_elem = product.find_element(By.CSS_SELECTOR, "div.js-picture.inner_img img")
                # 기저귀/물티슈 때 쓰던 scrollIntoView 유지
                driver.execute_script("arguments[0].scrollIntoView(true);", img_elem)
                time.sleep(0.5)  # 로딩할 시간을 잠시 줌

                img_src = img_elem.get_attribute("src")
                if not img_src or "blank" in img_src.lower():
                    img_src = img_elem.get_attribute("data-src")
                if not img_src:
                    img_src = "이미지 없음"

                item['img'] = img_src
            except:
                # 배경이미지 방식
                try:
                    img_div = product.find_element(By.CSS_SELECTOR, "div.js-picture.inner_img")
                    style = img_div.get_attribute("style")
                    match = re.search(r'url\("?(.*?)"?\)', style)
                    if match:
                        item['img'] = match.group(1)
                    else:
                        item['img'] = "이미지 없음"
                except:
                    item['img'] = "이미지 없음"

            results.append(item)
        except Exception as e:
            print("[X] 상품 정보 파싱 중 오류:", str(e).encode("utf-8", errors="ignore").decode())
            continue

    return results


def crawl_subcategory(driver, category_name, category_xpath):
    """
    특정 하위 카테고리를 클릭 후,
    여러 페이지에 걸쳐 상품 정보를 크롤링하여 리스트로 반환
    (기존 기저귀/물티슈 크롤링 로직 그대로 + 카테고리명만 추가)
    """
    # 1) 해당 카테고리 클릭
    if not click_category(driver, category_name, category_xpath):
        return []

    all_results = []
    page_num = 1

    while True:
        print(f"\n[-] '{category_name}' - 페이지 {page_num} 크롤링 중...")

        scroll_down(driver, count=3)

        try:
            WebDriverWait(driver, 15).until(
                EC.presence_of_all_elements_located((By.CSS_SELECTOR, "ul#kidiSearchItemList_400002 li"))
            )
            print("[✓] 상품 리스트 로딩 완료")
        except Exception as e:
            print("[X] 상품 리스트 로딩 실패:", str(e).encode("utf-8", errors="ignore").decode())
            break

        page_results = parse_products(driver, category_name)
        print(f"[*] '{category_name}' 현재 페이지에서 {len(page_results)}개 상품을 수집했습니다.")
        all_results.extend(page_results)

        # 다음 페이지 이동
        try:
            next_page_btn = driver.find_element(By.XPATH, f"//a[@data-paging-btn][@data-value='{page_num + 1}']")
            driver.execute_script("arguments[0].click();", next_page_btn)
            page_num += 1
            time.sleep(2)
        except Exception:
            print(f"[✓] '{category_name}' 다음 페이지 없음, 크롤링 종료")
            break

    return all_results


def crawl_kidikidi():
    """
    1. 메인 페이지 접근
    2. '유아용품' 클릭
    3. CATEGORY_LIST에 있는 모든 하위 카테고리를 순회:
       - crawl_subcategory로 크롤링
       - 결과를 카테고리명별로 저장
    """
    driver = setup_driver()
    driver.get("https://kidikidi.elandmall.co.kr")
    time.sleep(3)
    print("[✓] 메인 페이지 접속 완료")

    # '유아용품' 클릭
    if not click_category(driver, "유아용품", "//a[contains(text(), '유아용품')]"):
        driver.quit()
        return

    # 여러 카테고리 반복
    for cat in CATEGORY_LIST:
        cat_name = cat["name"]
        cat_xpath = cat["xpath"]

        # 1) 카테고리 크롤링
        cat_results = crawl_subcategory(driver, cat_name, cat_xpath)

        # 2) 카테고리명 파일명에 들어가면 문제될 수 있는 문자 치환 (예: /)
        safe_cat_name = cat_name.replace('/', '_')

        # 3) 카테고리별 JSON 파일로 저장
        filename = f"kidikidi_{safe_cat_name}.json"
        save_to_json(cat_results, filename)

        # 필요하면 '유아용품' 탭으로 복귀
        # driver.back() or driver.refresh() 등 사이트 구조에 맞게
        # driver.execute_script("window.scrollTo(0,0);")
        # time.sleep(2)

    # 모든 카테고리 끝
    driver.quit()


def save_to_json(data, filename):
    """ 크롤링 결과를 JSON 파일로 저장 """
    save_path = "C:/alpha_frontend/frontend/kidkid/"  # 저장 경로
    os.makedirs(save_path, exist_ok=True)

    full_path = os.path.join(save_path, filename)
    try:
        with open(full_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
        print(f"[*] 데이터가 '{full_path}' 파일로 저장되었습니다.")
    except Exception as e:
        print("[X] JSON 파일 저장 실패:", str(e).encode("utf-8", errors="ignore").decode())


if __name__ == "__main__":
    crawl_kidikidi()
