import time
import json
import re
import sys
import os
import uuid  # UID로 사용할 무작위 UUID 생성용
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

sys.stdout.reconfigure(encoding='utf-8')

CATEGORY_LIST = [
    {"name": "기저귀_물티슈",    "xpath": "//p[contains(text(), '기저귀/물티슈')]"},
    {"name": "식품",           "xpath": "//p[contains(text(), '분유/이유식/간식')]"},
    {"name": "생활_위생용품",   "xpath": "//p[contains(text(), '출산/육아용품')]"},
    {"name": "스킨케어_화장품", "xpath": "//p[contains(text(), '욕실용품/스킨')]"},
    # 완구용품(2개 버튼 → 같은 name)
    {"name": "완구용품", "xpath": "//p[contains(text(), '베이비 토이/장난감')]"},
    {"name": "완구용품", "xpath": "//p[contains(text(), '교구/도서')]"},
]

def setup_driver():
    """Chrome WebDriver 설정: 이미지 로딩 허용 + (필요하면 Headless는 유지 가능)"""
    options = webdriver.ChromeOptions()

    # 필요하다면 headless 모드 사용
    # options.add_argument('--headless')

    # 이미지 로딩 허용(prefs=1)
    prefs = {
        "profile.managed_default_content_settings.images": 1,  # 이미지를 로딩
        "profile.default_content_setting_values.notifications": 2
    }
    options.add_experimental_option('prefs', prefs)

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

def scroll_down(driver, count=2):
    """스크롤을 여러 번 내려서 Lazy Loading 이미지가 로드될 기회를 줌"""
    for i in range(count):
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(1)
        print(f"[-] 스크롤 {i+1}회 완료")

def click_category(driver, category_name, xpath):
    """주어진 XPath의 카테고리(또는 탭)를 클릭"""
    try:
        element = WebDriverWait(driver, 5).until(
            EC.element_to_be_clickable((By.XPATH, xpath))
        )
        driver.execute_script("arguments[0].click();", element)
        time.sleep(1)
        print(f"[✓] '{category_name}' 클릭 성공")
    except Exception as e:
        print(f"[X] '{category_name}' 클릭 실패:", str(e))
        return False
    return True

def parse_products(driver, category_name):
    """
    현재 페이지에서 상품 정보를 파싱
    - 이미지 로딩 허용 + 스크롤 후 잠시 대기로 Lazy Loading 처리
    """
    results = []
    products = driver.find_elements(By.CSS_SELECTOR, "ul#kidiSearchItemList_400002 li")

    for product in products:
        try:
            item = {
                "category": category_name,
                "uid": str(uuid.uuid4())
            }

            # BRAND
            try:
                brand_elem = product.find_element(By.CSS_SELECTOR, "strong.brand")
                item['brand'] = brand_elem.text.strip()
            except:
                item['brand'] = "브랜드 없음"

            # NAME
            try:
                name_elem = product.find_element(By.CSS_SELECTOR, "p.prd")
                item['name'] = name_elem.text.strip()
            except:
                item['name'] = "제품명 없음"

            # PRICE
            try:
                price_elem = product.find_element(By.CSS_SELECTOR, "span.price em")
                item['sale_price'] = price_elem.text.strip() + "원"
            except:
                item['sale_price'] = "가격 없음"

            # LINK
            try:
                link_elem = product.find_element(By.CSS_SELECTOR, "a")
                item['link'] = link_elem.get_attribute("href")
            except:
                item['link'] = "링크 없음"

            # IMAGE
            # Lazy Loading → scrollIntoView & 잠시 대기
            try:
                img_elem = product.find_element(By.CSS_SELECTOR, "div.js-picture.inner_img img")
                driver.execute_script("arguments[0].scrollIntoView(true);", img_elem)
                time.sleep(1)  # 스크롤 후 1초 대기 (이미지 로드 시간)

                # 1) 우선 src
                img_src = img_elem.get_attribute("src")
                # 2) src가 blank거나 비어 있으면 data-src 확인
                if (not img_src) or ("blank" in img_src.lower()):
                    img_src = img_elem.get_attribute("data-src")

                # 그래도 없으면 background-image 가능성 체크
                if (not img_src) or (img_src.strip() == ""):
                    # CSS background-image로 들어있을 수도 있음
                    try:
                        img_div = product.find_element(By.CSS_SELECTOR, "div.js-picture.inner_img")
                        style = img_div.get_attribute("style")
                        match = re.search(r'url\((.*?)\)', style)
                        if match:
                            raw_url = match.group(1).strip('"').strip("'")
                            img_src = raw_url
                    except:
                        pass

                item['img'] = img_src if img_src else "이미지 없음"

            except Exception:
                item['img'] = "이미지 없음"

            results.append(item)

        except Exception as e:
            print("[X] 상품 정보 파싱 중 오류:", str(e))
            continue

    return results

def crawl_subcategory(driver, category_name, category_xpath):
    """하위 카테고리를 클릭 후 여러 페이지 순회하며 상품 정보를 수집"""
    if not click_category(driver, category_name, category_xpath):
        return []

    all_results = []
    page_num = 1

    while True:
        print(f"\n[-] '{category_name}' - 페이지 {page_num} 크롤링 중...")
        scroll_down(driver, count=2)

        try:
            WebDriverWait(driver, 5).until(
                EC.presence_of_all_elements_located((By.CSS_SELECTOR, "ul#kidiSearchItemList_400002 li"))
            )
            print("[✓] 상품 리스트 로딩 완료")
        except Exception as e:
            print("[X] 상품 리스트 로딩 실패:", str(e))
            break

        page_results = parse_products(driver, category_name)
        print(f"[*] '{category_name}' 현재 페이지에서 {len(page_results)}개 상품을 수집했습니다.")
        all_results.extend(page_results)

        # 다음 페이지 이동
        try:
            next_btn = driver.find_element(
                By.XPATH,
                f"//a[@data-paging-btn][@data-value='{page_num + 1}']"
            )
            driver.execute_script("arguments[0].click();", next_btn)
            page_num += 1
            time.sleep(1)
        except Exception:
            print(f"[✓] '{category_name}' 다음 페이지 없음, 크롤링 종료")
            break

    return all_results

def save_to_json(data, filename):
    """결과 리스트 JSON 저장"""
    save_path = "C:/alpha_frontend/frontend/kidkid/"
    os.makedirs(save_path, exist_ok=True)

    full_path = os.path.join(save_path, filename)
    try:
        with open(full_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
        print(f"[*] '{full_path}' 파일 저장 완료.")
    except Exception as e:
        print("[X] JSON 파일 저장 실패:", str(e))

def crawl_kidikidi():
    driver = setup_driver()

    driver.get("https://kidikidi.elandmall.co.kr")
    time.sleep(1)
    print("[✓] 메인 페이지 접속 완료")

    # 유아용품 탭 클릭
    if not click_category(driver, "유아용품", "//a[contains(text(), '유아용품')]"):
        driver.quit()
        return

    # 카테고리별로 즉시 저장
    for cat in CATEGORY_LIST:
        cat_name  = cat["name"]
        cat_xpath = cat["xpath"]

        cat_results = crawl_subcategory(driver, cat_name, cat_xpath)
        print(f"[#] '{cat_name}' 카테고리 수집 결과: {len(cat_results)} 개")

        # 파일 저장
        safe_cat_name = re.sub(r'[\\/:*?"<>|]', '_', cat_name)
        filename = f"kidi_{safe_cat_name}.json"
        save_to_json(cat_results, filename)

        # 필요 시 유아용품 탭으로 복귀
        # driver.back()
        # time.sleep(1)

    driver.quit()
    print("\n[✓] 모든 카테고리 크롤링 및 저장 완료!")

if __name__ == "__main__":
    crawl_kidikidi()
