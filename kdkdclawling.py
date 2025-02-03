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


def setup_driver():
    """Chrome WebDriver 설정"""
    options = webdriver.ChromeOptions()
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
        time.sleep(2)
        print(f"[-] 스크롤 {i + 1}회 완료")


def click_category(driver, category_name, xpath):
    """주어진 XPath의 카테고리(또는 탭)를 클릭"""
    try:
        element = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, xpath))
        )
        driver.execute_script("arguments[0].click();", element)
        time.sleep(3)
        print(f"[✓] '{category_name}' 클릭 성공")
    except Exception as e:
        print(f"[X] '{category_name}' 클릭 실패:", str(e).encode("utf-8", errors="ignore").decode())
        return False
    return True


def parse_products(driver):
    """현재 페이지의 상품 정보를 수집하여 리스트로 반환"""
    results = []
    products = driver.find_elements(By.CSS_SELECTOR, "ul#kidiSearchItemList_400002 li")

    for product in products:
        try:
            item = {}

            # 제품명
            try:
                name_elem = product.find_element(By.CSS_SELECTOR, "p.prd")
                item['name'] = name_elem.text.strip()
            except:
                item['name'] = "제품명 없음"

            # 가격
            try:
                price_elem = product.find_element(By.CSS_SELECTOR, "span.price em")
                item['sale_price'] = price_elem.text.strip() + "원"
            except:
                item['sale_price'] = "가격 없음"

            # 상품 링크
            try:
                link_elem = product.find_element(By.CSS_SELECTOR, "a")
                item['link'] = link_elem.get_attribute("href")
            except:
                item['link'] = "링크 없음"

            # 이미지 가져오기
            try:
                img_elem = product.find_element(By.CSS_SELECTOR, "div.js-picture.inner_img img")
                driver.execute_script("arguments[0].scrollIntoView(true);", img_elem)
                time.sleep(0.5)

                img_src = img_elem.get_attribute("src")
                if not img_src or "blank" in img_src.lower():
                    img_src = img_elem.get_attribute("data-src")

                if not img_src:
                    img_src = "이미지 없음"

                item['img'] = img_src
            except:
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


def crawl_kidikidi():
    """키디키디 사이트에서 유아용품 → 기저귀/물티슈 탭 크롤링"""
    driver = setup_driver()
    driver.get("https://kidikidi.elandmall.co.kr")
    time.sleep(3)
    print("[✓] 메인 페이지 접속 완료")

    # 1. '유아용품' 카테고리 클릭
    if not click_category(driver, "유아용품", "//a[contains(text(), '유아용품')]"):
        driver.quit()
        return

    # 2. '기저귀/물티슈' 탭 클릭
    if not click_category(driver, "기저귀/물티슈", "//p[contains(text(), '기저귀/물티슈')]"):
        driver.quit()
        return

    all_results = []
    page_num = 1

    while True:
        print(f"\n[-] '기저귀/물티슈' - 페이지 {page_num} 크롤링 중...")

        scroll_down(driver, count=3)

        try:
            WebDriverWait(driver, 15).until(
                EC.presence_of_all_elements_located((By.CSS_SELECTOR, "ul#kidiSearchItemList_400002 li"))
            )
            print("[✓] 상품 리스트 로딩 완료")
        except Exception as e:
            print("[X] 상품 리스트 로딩 실패:", str(e).encode("utf-8", errors="ignore").decode())
            break

        page_results = parse_products(driver)
        print(f"[*] 현재 페이지에서 {len(page_results)}개의 상품을 수집했습니다.")
        all_results.extend(page_results)

        try:
            next_page_btn = driver.find_element(By.XPATH, f"//a[@data-paging-btn][@data-value='{page_num + 1}']")
            driver.execute_script("arguments[0].click();", next_page_btn)
            page_num += 1
            time.sleep(2)
        except Exception:
            print("[✓] 다음 페이지 없음, 크롤링 종료")
            break

    driver.quit()
    save_to_json(all_results, "kidikidi_diapers.json")


def save_to_json(data, filename):
    """ 크롤링 결과를 JSON 파일로 저장 """
    save_path = "C:/alpha_frontend/frontend/kidkid/"  # 저장 경로 설정
    os.makedirs(save_path, exist_ok=True)  # 폴더가 없으면 생성

    full_path = os.path.join(save_path, filename)
    try:
        with open(full_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
        print(f"[*] 데이터가 '{full_path}' 파일로 저장되었습니다.")
    except Exception as e:
        print("[X] JSON 파일 저장 실패:", str(e).encode("utf-8", errors="ignore").decode())


if __name__ == "__main__":
    crawl_kidikidi()
