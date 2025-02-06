import time
import json
import sys
import os
import uuid
import re
import multiprocessing
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

# ✅ Windows 환경에서 Unicode 출력을 정상화
sys.stdout.reconfigure(encoding='utf-8')

# ✅ 제품 JSON 파일 경로
BASE_PATH = "C:/alpha_frontend/frontend/coupang"
REVIEW_PATH = "C:/alpha_frontend/frontend/coupang_review"

CATEGORIES = [
    "기저귀_물티슈",
    "생활_위생용품",
    "수유_이유용품",
    "스킨케어_화장품",
    "식품",
    "완구용품",
    "침구류",
    "패션의류_잡화"
]

def setup_driver():
    """Selenium WebDriver 설정"""
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
    """ 페이지 하단까지 스크롤하여 추가 리뷰 로딩 """
    for i in range(count):
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(2)
        print(f"[-] 리뷰 페이지 스크롤 {i + 1}회 완료")

def clean_text(text):
    """특수문자 및 줄바꿈 제거"""
    return re.sub(r'[^0-9a-zA-Z가-힣\s]', '', text).strip()

def extract_reviews(driver, product_uid, category_name, max_pages=5):
    """ 한 개의 상품 페이지에서 최대 50개의 리뷰를 크롤링 (최대 5페이지) """
    reviews_data = []
    page = 1
    review_count = 0

    try:
        # ✅ 상품평 탭 클릭
        WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, "//*[@id='btfTab']/ul[1]/li[2]"))
        ).click()
        time.sleep(2)

        while page <= max_pages and review_count < 50:
            print(f"[*] {product_uid} - {category_name} - 페이지 {page} 리뷰 크롤링 중...")

            # 스크롤 다운 추가 (리뷰가 숨겨져 있을 가능성 대비)
            scroll_down(driver, count=3)

            # 리뷰 리스트 가져오기
            reviews = driver.find_elements(By.XPATH, "//*[@id='btfTab']/ul[2]/li[2]/div/div[6]/section[4]/article/div[4]/div")
            for review in reviews:
                if review_count >= 50:
                    break
                review_text = clean_text(review.text.strip())

                # ✅ 리뷰가 비어있다면 저장하지 않음 (MongoDB import 오류 방지)
                if review_text:
                    reviews_data.append({
                        "reviewuid": str(uuid.uuid4()),
                        "review": review_text
                    })
                    review_count += 1

            print(f"[✓] 현재 페이지에서 {len(reviews)}개의 리뷰 추가 (누적: {review_count})")

            # ✅ 다음 페이지 버튼 클릭 (기저귀와 나머지 카테고리 분리)
            if page < max_pages and review_count < 50:
                try:
                    if category_name == "기저귀_물티슈":
                        # 기저귀_물티슈 페이지 이동 XPath 적용
                        next_page_btn_xpath = f"//*[@id='btfTab']/ul[2]/li[2]/div/div[6]/section[4]/div[3]/button[{page + 2}]"
                    else:
                        # 다른 카테고리는 일반적인 페이지 이동 버튼 적용
                        next_page_btn_xpath = f"//div[contains(@class, 'sdp-review__article__page')]//button[contains(text(), '{page + 1}')]"

                    next_page_btn = WebDriverWait(driver, 5).until(
                        EC.element_to_be_clickable((By.XPATH, next_page_btn_xpath))
                    )
                    driver.execute_script("arguments[0].scrollIntoView();", next_page_btn)
                    time.sleep(2)
                    driver.execute_script("arguments[0].click();", next_page_btn)
                    time.sleep(3)
                    page += 1
                except Exception:
                    print("[X] 다음 페이지 버튼이 없음 (마지막 페이지 도달)")
                    break
            else:
                break

    except Exception as e:
        print(f"[X] 리뷰 크롤링 중 오류 발생: {e}")

    return reviews_data

def process_category_reviews(category_name):
    """ 특정 카테고리의 모든 제품 리뷰를 크롤링하여 개별 JSON 저장 """
    input_json_path = os.path.join(BASE_PATH, f"coupang_{category_name}.json")
    category_review_path = os.path.join(REVIEW_PATH, f"coupang_{category_name}_review.json")

    if not os.path.exists(input_json_path):
        print(f"[X] {category_name} 제품 데이터 JSON 파일이 없습니다. 건너뜁니다.")
        return

    # 기존 제품 데이터 로드
    with open(input_json_path, "r", encoding="utf-8") as f:
        products = json.load(f)

    driver = setup_driver()
    category_reviews = []

    for product in products:
        product_uid = product["uid"]
        product_name = product["name"]
        product_link = product["link"]

        print(f"\n[→] {product_name} 리뷰 크롤링 시작...")
        driver.get(product_link)
        time.sleep(3)

        reviews = extract_reviews(driver, product_uid, category_name, max_pages=5)

        # ✅ 빈 리뷰 리스트가 있으면 "[]"로 저장
        category_reviews.append({
            "category": product["category"],
            "name": product_name,
            "brand": product["brand"],
            "uid": product_uid,
            "reviews": reviews if reviews else []
        })

    driver.quit()

    # ✅ JSON 저장 시 None 값 변환
    os.makedirs(REVIEW_PATH, exist_ok=True)
    with open(category_review_path, "w", encoding="utf-8") as f:
        json.dump(category_reviews, f, ensure_ascii=False, indent=4)

    print(f"\n[✓] {category_name} 리뷰 데이터가 '{category_review_path}' 파일로 저장되었습니다.")

def main():
    """ ✅ 모든 카테고리의 리뷰 크롤링 실행 (멀티프로세싱) """
    num_processes = min(8, os.cpu_count())
    with multiprocessing.Pool(processes=num_processes) as pool:
        pool.map(process_category_reviews, CATEGORIES)

    print("\n[✓] 모든 카테고리의 리뷰 크롤링 완료!")

if __name__ == "__main__":
    main()
