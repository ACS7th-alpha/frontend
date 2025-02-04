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

# 기존 제품 JSON 파일 경로
INPUT_JSON_PATH = r"C:\alpha_frontend\frontend\coupang\coupang_기저귀_물티슈.json"
OUTPUT_JSON_PATH = r"C:\alpha_frontend\frontend\coupang_review\coupang_기저귀_물티슈_review.json"


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


def extract_reviews(driver, product_uid, max_pages=10):
    """한 개의 상품 페이지에서 최대 50개의 리뷰를 크롤링"""
    reviews_data = []
    page = 1
    review_count = 0

    while page <= max_pages and review_count < 50:
        print(f"[*] {product_uid} - 페이지 {page} 리뷰 크롤링 중...")

        try:
            # 첫 페이지일 경우, '상품평' 탭 클릭
            if page == 1:
                WebDriverWait(driver, 10).until(
                    EC.element_to_be_clickable((By.XPATH, "//*[@id='btfTab']/ul[1]/li[2]"))
                ).click()
                time.sleep(2)

            # 스크롤 다운 추가 (리뷰가 숨겨져 있을 가능성 대비)
            scroll_down(driver, count=3)

            # 리뷰 리스트 가져오기
            reviews = driver.find_elements(By.XPATH, "//*[@id='btfTab']/ul[2]/li[2]/div/div[6]/section[4]/article/div[4]/div")
            for review in reviews:
                if review_count >= 50:
                    break
                review_text = review.text.strip()
                if review_text:
                    reviews_data.append({
                        "reviewuid": str(uuid.uuid4()),  # 새로운 reviewuid 생성
                        "review": review_text
                    })
                    review_count += 1

            print(f"[✓] 현재 페이지에서 {len(reviews)}개의 리뷰 추가 (누적: {review_count})")

            # 다음 페이지 버튼 클릭
            if page < max_pages and review_count < 50:
                try:
                    next_page_btn_xpath = "/html/body/div[2]/section/div[2]/div[2]/div[7]/ul[2]/li[2]/div/div[6]/section[4]/div[3]/button[3]"
                    next_page_btn = WebDriverWait(driver, 5).until(
                        EC.element_to_be_clickable((By.XPATH, next_page_btn_xpath))
                    )
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
            break

    return reviews_data


def main():
    """메인 실행 함수"""
    if not os.path.exists(INPUT_JSON_PATH):
        print("[X] 기존 제품 데이터 JSON 파일이 없습니다.")
        return

    # 기존 제품 데이터 로드
    with open(INPUT_JSON_PATH, "r", encoding="utf-8") as f:
        products = json.load(f)

    driver = setup_driver()
    review_results = []

    # **🔹 테스트용: 첫 번째 제품만 실행** (모든 제품 테스트할 때는 `for product in products:`)
    test_product = [products[0]]  # 첫 번째 제품만 테스트

    for product in test_product:
        product_uid = product["uid"]
        product_name = product["name"]
        product_link = product["link"]

        print(f"\n[→] {product_name} 리뷰 크롤링 시작...")
        driver.get(product_link)
        time.sleep(3)

        reviews = extract_reviews(driver, product_uid, max_pages=10)

        review_results.append({
            "category": product["category"],
            "name": product_name,
            "brand": product["brand"],
            "uid": product_uid,
            "reviews": reviews
        })

    driver.quit()

    # JSON 저장
    os.makedirs(os.path.dirname(OUTPUT_JSON_PATH), exist_ok=True)
    with open(OUTPUT_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(review_results, f, ensure_ascii=False, indent=4)

    print(f"\n[✓] 리뷰 데이터가 '{OUTPUT_JSON_PATH}' 파일로 저장되었습니다.")


if __name__ == "__main__":
    main()
