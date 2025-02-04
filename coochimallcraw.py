import time
import json
import os
import uuid
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

# 저장 경로
SAVE_PATH = "C:/alpha_frontend/frontend/coochi/"

def setup_driver():
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
    return webdriver.Chrome(service=service, options=options)

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

def parse_products(driver, category_name, existing_data):
    """ 현재 페이지의 상품 정보를 파싱 (기존 uid 유지) """
    results = []
    products = driver.find_elements(By.CLASS_NAME, "prdList__item")

    for product in products:
        try:
            item = {"category": category_name}

            # 링크
            try:
                ahref = product.find_element(By.TAG_NAME, "a")
                item['link'] = ahref.get_attribute('href')
            except:
                item['link'] = "링크 없음"

            # 기존 데이터에서 UID 유지, 없으면 새로 생성
            if item["link"] in existing_data:
                item["uid"] = existing_data[item["link"]]["uid"]
            else:
                item["uid"] = str(uuid.uuid4())  # 새로운 UID 생성

            # 제품명
            try:
                name_element = product.find_element(By.CLASS_NAME, "name")
                item['name'] = name_element.text.strip()
            except:
                item['name'] = "제품명 없음"

            # 브랜드
            try:
                brand_element = product.find_element(By.CLASS_NAME, "prd_brand")
                item['brand'] = brand_element.text.strip()
            except:
                item['brand'] = "브랜드 없음"

            # 가격
            try:
                price_elements = product.find_elements(By.TAG_NAME, "span")
                item['sale_price'] = "가격 없음"
                for elem in price_elements:
                    text = elem.text.strip()
                    if text and "원" in text:
                        item['sale_price'] = text
                        break
            except:
                item['sale_price'] = "가격 없음"

            # 이미지
            try:
                img_tag = product.find_element(By.TAG_NAME, "img")
                item['img'] = img_tag.get_attribute("src")
            except:
                item['img'] = "이미지 정보 없음"

            results.append(item)

        except Exception as e:
            print("[X] 제품 정보 추출 중 오류:", str(e).encode("utf-8", errors="ignore").decode())
            continue

    return results

def crawl_category_by_link(category_name, category_url, existing_data):
    """ 카테고리 크롤링 (기존 uid 유지) """
    driver = setup_driver()
    try:
        driver.get(category_url)
        time.sleep(3)
    except:
        driver.quit()
        return []

    all_results = []
    page_num = 1

    while True:
        print(f"\n[-] '{category_name}' - 페이지 {page_num} 크롤링 중...")
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(2)

        try:
            WebDriverWait(driver, 15).until(
                EC.presence_of_element_located((By.CLASS_NAME, "prdList__item"))
            )
        except:
            break

        page_results = parse_products(driver, category_name, existing_data)
        all_results.extend(page_results)

        # 다음 페이지 버튼 클릭
        try:
            next_btn = driver.find_element(
                By.XPATH, f"//a[@class='other' and text()='{page_num + 1}']"
            )
            driver.execute_script("arguments[0].click();", next_btn)
            page_num += 1
            time.sleep(2)
        except:
            break

    driver.quit()
    return all_results

def run_scraper():
    """ 크롤링 실행 (기존 UID 유지) """
    categories = [
        ("생활_위생용품", "coochi_생활_위생용품.json", "https://coochi.co.kr/category/출산외출용품/210/"),
        ("기저귀_물티슈", "coochi_기저귀_물티슈.json", "https://coochi.co.kr/category/기저귀위생용품/211/"),
        ("패션의류_잡화", "coochi_패션의류_잡화.json", "https://coochi.co.kr/category/가방패션잡화/212/")
    ]

    for cat_name, filename, url in categories:
        print(f"\n=== '{cat_name}' 크롤링 시작 ===")
        existing_data = load_existing_data(filename)
        new_data = crawl_category_by_link(cat_name, url, existing_data)
        save_to_json(new_data, filename)

    print("\n=== '수유_이유용품' 크롤링 시작 ===")

    # 이유용품 + 수유용품을 합쳐서 저장
    reason_url = "https://coochi.co.kr/category/이유용품/3082/"
    feed_url = "https://coochi.co.kr/category/수유용품/196/"
    
    existing_data_reason = load_existing_data("coochi_수유_이유용품.json")
    reason_data = crawl_category_by_link("수유_이유용품", reason_url, existing_data_reason)
    feed_data = crawl_category_by_link("수유_이유용품", feed_url, existing_data_reason)

    combined_data = reason_data + feed_data
    save_to_json(combined_data, "coochi_수유_이유용품.json")

    print("\n[✓] 모든 크롤링 완료!")

if __name__ == "__main__":
    run_scraper()
