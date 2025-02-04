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

SAVE_PATH = "C:/alpha_frontend/frontend/kidkid/"                                                                                                                                                                                                                                                                      

CATEGORY_LIST = [
    {"name": "기저귀_물티슈",    "xpath": "//p[contains(text(), '기저귀/물티슈')]"},
    {"name": "식품",           "xpath": "//p[contains(text(), '분유/이유식/간식')]"},
    {"name": "생활_위생용품",   "xpath": "//p[contains(text(), '출산/육아용품')]"},
    {"name": "스킨케어_화장품", "xpath": "//p[contains(text(), '욕실용품/스킨')]"},
    {"name": "완구용품", "xpath": "//p[contains(text(), '베이비 토이/장난감')]"},
    {"name": "완구용품", "xpath": "//p[contains(text(), '교구/도서')]"},
]

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

def load_existing_data(filename):
    """ 기존 JSON 데이터 로드 (link 기준 uid 매핑) """
    full_path = os.path.join(SAVE_PATH, filename)
    if os.path.exists(full_path):
        with open(full_path, "r", encoding="utf-8") as f:
            try:
                data = json.load(f)
                return {item["link"]: item for item in data}  # link 기준 딕셔너리 생성
            except json.JSONDecodeError:
                return {}
    return {}

def save_to_json(data, filename):
    """ 데이터를 JSON 파일로 저장 """
    os.makedirs(SAVE_PATH, exist_ok=True)
    full_path = os.path.join(SAVE_PATH, filename)
    with open(full_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=4)
    print(f"[*] 데이터가 '{full_path}' 파일로 저장되었습니다.")

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

def parse_products(driver, category_name, existing_data):
    """
    현재 페이지에서 상품 정보를 파싱 (기존 UID 유지)
    """
    results = []
    products = driver.find_elements(By.CSS_SELECTOR, "ul#kidiSearchItemList_400002 li")

    for product in products:
        try:
            item = {"category": category_name}

            # 링크
            try:
                link_elem = product.find_element(By.CSS_SELECTOR, "a")
                item['link'] = link_elem.get_attribute("href")
            except:
                item['link'] = "링크 없음"

            # 기존 데이터에서 UID 유지, 없으면 새로 생성
            if item["link"] in existing_data:
                item["uid"] = existing_data[item["link"]]["uid"]
            else:
                item["uid"] = str(uuid.uuid4())  # 새로운 UID 생성

            # 브랜드
            try:
                brand_elem = product.find_element(By.CSS_SELECTOR, "strong.brand")
                item['brand'] = brand_elem.text.strip()
            except:
                item['brand'] = "브랜드 없음"

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

            # 이미지
            try:
                img_elem = product.find_element(By.CSS_SELECTOR, "div.js-picture.inner_img img")
                img_src = img_elem.get_attribute("src")
                if not img_src:
                    img_src = img_elem.get_attribute("data-src")
                item['img'] = img_src if img_src else "이미지 없음"
            except:
                item['img'] = "이미지 없음"

            results.append(item)

        except Exception as e:
            print("[X] 상품 정보 파싱 중 오류:", str(e))
            continue

    return results

def crawl_subcategory(driver, category_name, category_xpath, existing_data):
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
        except:
            break

        page_results = parse_products(driver, category_name, existing_data)
        print(f"[*] '{category_name}' 현재 페이지에서 {len(page_results)}개 상품을 수집했습니다.")
        all_results.extend(page_results)

        # 다음 페이지 이동
        try:
            next_btn = driver.find_element(
                By.XPATH, f"//a[@data-paging-btn][@data-value='{page_num + 1}']"
            )
            driver.execute_script("arguments[0].click();", next_btn)
            page_num += 1
            time.sleep(1)
        except:
            break

    return all_results

def crawl_kidikidi():
    driver = setup_driver()

    driver.get("https://kidikidi.elandmall.co.kr")
    time.sleep(1)
    print("[✓] 메인 페이지 접속 완료")

    if not click_category(driver, "유아용품", "//a[contains(text(), '유아용품')]"):
        driver.quit()
        return

    for cat in CATEGORY_LIST:
        cat_name  = cat["name"]
        cat_xpath = cat["xpath"]
        filename = f"kidi_{re.sub(r'[\\/:*?\"<>|]', '_', cat_name)}.json"

        existing_data = load_existing_data(filename)
        cat_results = crawl_subcategory(driver, cat_name, cat_xpath, existing_data)

        save_to_json(cat_results, filename)

    driver.quit()
    print("\n[✓] 모든 카테고리 크롤링 및 저장 완료!")

if __name__ == "__main__":
    crawl_kidikidi()
