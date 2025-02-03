import time
import json
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
    """ 여러 번 스크롤을 내려 추가 제품 로딩 """
    for i in range(count):
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(2)
        print(f"[-] 스크롤 {i + 1}회 완료")


def parse_products(driver):
    """
    현재 페이지의 상품 정보를 파싱하여 리스트 형태로 반환
    """
    results = []
    products = driver.find_elements(By.CLASS_NAME, "prdList__item")
    for product in products:
        try:
            item = {}

            # 제품명
            try:
                name_elements = product.find_elements(By.TAG_NAME, "span")
                for elem in name_elements:
                    text = elem.text.strip()
                    if text and "상품명" not in text:
                        item['name'] = text
                        break
                if not item.get("name"):
                    item['name'] = "제품명 없음"
            except:
                item['name'] = "제품명 없음"

            # 가격
            try:
                price_elements = product.find_elements(By.TAG_NAME, "span")
                for elem in price_elements:
                    text = elem.text.strip()
                    if text and "원" in text:
                        item['sale_price'] = text
                        break
                if not item.get("sale_price"):
                    item['sale_price'] = "가격 없음"
            except:
                item['sale_price'] = "가격 없음"

            # 링크
            try:
                ahref = product.find_element(By.TAG_NAME, "a")
                item['link'] = ahref.get_attribute('href')
            except:
                item['link'] = "링크 없음"

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


def crawl_category_by_link(category_name, category_url):
    """
    주어진 URL로 직접 이동하여 여러 페이지를 순회하며 상품 정보를 가져오는 함수
    """
    driver = setup_driver()

    try:
        driver.get(category_url)
        time.sleep(3)
        print(f"[✓] '{category_name}' 페이지 진입 완료: {category_url}")
    except Exception as e:
        print(f"[X] '{category_name}' 페이지 이동 실패:", str(e).encode("utf-8", errors="ignore").decode())
        driver.quit()
        return []

    all_results = []
    page_num = 1

    while True:
        print(f"\n[-] '{category_name}' - 페이지 {page_num} 크롤링 중...")
        scroll_down(driver, count=3)

        try:
            WebDriverWait(driver, 15).until(
                EC.presence_of_element_located((By.CLASS_NAME, "prdList__item"))
            )
            print("[✓] 상품 리스트 로딩 완료")
        except Exception as e:
            print("[X] 상품 리스트 로딩 실패:", str(e).encode("utf-8", errors="ignore").decode())
            break

        page_results = parse_products(driver)
        print(f"[*] 현재 페이지에서 {len(page_results)}개의 상품을 수집했습니다.")
        all_results.extend(page_results)

        try:
            next_btn = driver.find_element(
                By.XPATH,
                f"//a[@class='other' and text()='{page_num + 1}']"
            )
            driver.execute_script("arguments[0].click();", next_btn)
            page_num += 1
            time.sleep(2)
        except Exception:
            print("[✓] 다음 페이지 버튼이 없어서 크롤링 종료")
            break

    driver.quit()
    return all_results


def save_to_json(data, filename):
    """ 결과 리스트를 JSON 파일로 저장 """
    save_path = "C:/alpha_frontend/frontend/coochi/"  # 저장 경로 변경
    os.makedirs(save_path, exist_ok=True)  # 폴더가 없으면 생성

    full_path = os.path.join(save_path, filename)
    try:
        with open(full_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
        print(f"[*] 데이터가 '{full_path}' 파일로 저장되었습니다.")
    except Exception as e:
        print("[X] JSON 파일 저장 실패:", str(e).encode("utf-8", errors="ignore").decode())


def main():
    """
    카테고리별 크롤링 및 JSON 저장
    """

    single_categories = [
        ("출산/외출용품", "coochi_생활_위생용품.json", "https://coochi.co.kr/category/출산외출용품/210/"),
        ("기저귀/위생용품", "coochi_기저귀_물티슈.json", "https://coochi.co.kr/category/기저귀위생용품/211/"),
        ("패션잡화/펫", "coochi_패션의류_잡화.json", "https://coochi.co.kr/category/가방패션잡화/212/")
    ]

    for cat_name, filename, url in single_categories:
        print(f"\n=== '{cat_name}' 카테고리 크롤링 시작 ===")
        data = crawl_category_by_link(cat_name, url)
        save_to_json(data, filename)

    print("\n=== '이유용품' + '수유용품' 카테고리 크롤링 시작 ===")

    reason_url = "https://coochi.co.kr/category/이유용품/3082/"
    feed_url = "https://coochi.co.kr/category/수유용품/196/"

    reason_data = crawl_category_by_link("이유용품", reason_url)
    feed_data = crawl_category_by_link("수유용품", feed_url)

    combined_data = reason_data + feed_data
    save_to_json(combined_data, "coochi_수유_이유용품.json")

    print("\n[✓] 모든 크롤링 작업이 완료되었습니다!")


if __name__ == "__main__":
    main()
