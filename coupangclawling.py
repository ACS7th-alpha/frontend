import time
import json
import sys
import os
import uuid
import re
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.common.exceptions import NoSuchElementException, TimeoutException

sys.stdout.reconfigure(encoding='utf-8')

BASE_PATH = "C:/alpha_frontend/frontend/coupang"
CATEGORIES = {
    "기저귀_물티슈": ["https://www.coupang.com/np/categories/485952", "https://www.coupang.com/np/categories/485979"],
    "생활_위생용품": ["https://www.coupang.com/np/categories/221945"],
    "수유_이유용품": ["https://www.coupang.com/np/categories/334841", "https://www.coupang.com/np/categories/221943"],
    "스킨케어_화장품": ["https://www.coupang.com/np/categories/221944"],
    "식품": ["https://www.coupang.com/np/categories/221939"],
    "완구용품": ["https://www.coupang.com/np/categories/349657"],
    "침구류": ["https://www.coupang.com/np/categories/221942"],
    "패션의류_잡화": ["https://www.coupang.com/np/categories/508565"]
}

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
    """ 페이지 하단까지 스크롤하여 추가 제품 로딩 """
    for i in range(count):
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(2)
        print(f"[-] 스크롤 {i + 1}회 완료")

def clean_text(text):
    """특수문자 및 줄바꿈 제거"""
    return re.sub(r'[^0-9a-zA-Z가-힣\s]', '', text).strip()

def load_existing_data(file_path):
    """ 기존 JSON 파일에서 제품명과 UID 매핑 """
    existing_data = {}
    if os.path.exists(file_path):
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                for item in data:
                    existing_data[item["name"]] = item["uid"]  # 제품명 → UID 매핑
        except Exception as e:
            print(f"[X] 기존 데이터 로드 실패: {e}")
    return existing_data

def generate_uid(name, existing_uids):
    """ 기존 제품이면 기존 UID 유지, 새로운 제품이면 새 UID 생성 """
    return existing_uids.get(name, str(uuid.uuid4()))

def click_next_page(driver, page, category_name):
    """ 특정 카테고리별 페이지 이동 처리 """
    try:
        if category_name == "완구용품":
            if page == 3:  # 4페이지 이동
                next_page_xpath = "/html/body/div[3]/section/form/div/div/div[1]/div[5]/div[4]/div/a[5]"
            elif page == 4:  # 5페이지 이동
                next_page_xpath = "/html/body/div[3]/section/form/div/div/div[1]/div[5]/div[4]/div/a[6]"
            else:
                next_page_xpath = f"//*[@id='product-list-paging']/div/a[{page + 2}]"  # 기본 이동

        elif category_name in ["생활_위생용품", "침구류"]:
            next_page_xpath = f"//*[@id='product-list-paging']/div/a[{min(page + 2, 6)}]"  # 6페이지로 안 넘어가도록 제한

        else:
            next_page_xpath = f"/html/body/div[3]/section/form/div/div/div[1]/div[2]/div[4]/div/a[{min(page + 2, 6)}]"  # 6페이지 제한 적용

        next_button = driver.find_element(By.XPATH, next_page_xpath)
        if next_button.is_displayed():
            driver.execute_script("arguments[0].click();", next_button)
            print(f"[→] 다음 페이지 버튼 클릭 (페이지 {page} → {page + 1})")
            time.sleep(3)
            return True
        print("[✓] 마지막 페이지 도달 (더 이상 다음 페이지 버튼 없음)")
        return False

    except NoSuchElementException:
        print("[X] 다음 페이지 버튼 없음")
        return False
    except TimeoutException:
        print("[X] 다음 페이지 버튼 로딩 시간 초과")
        return False
    except Exception as e:
        print(f"[X] 다음 페이지 버튼 클릭 오류: {e}")
        return False

def crawl_coupang_category(category_name, category_urls, existing_uids):
    """ 쿠팡 카테고리 크롤링 """
    driver = setup_driver()
    results = []
    max_pages = 5

    for url in category_urls:
        driver.get(url)
        time.sleep(3)

        page = 1
        while page <= max_pages:
            print(f"\n[*] 쿠팡 {category_name} - 페이지 {page} 크롤링 중...")
            scroll_down(driver, count=3)

            try:
                WebDriverWait(driver, 15).until(
                    EC.presence_of_element_located((By.XPATH, "//ul[@id='productList']/li"))
                )
                print("[✓] 제품 리스트 로딩 완료")
            except Exception as e:
                print("[X] 제품 리스트 로딩 실패:", e)
                break

            try:
                products = driver.find_elements(By.XPATH, "//ul[@id='productList']/li")
                print(f"[*] 현재 페이지에 {len(products)}개의 상품 발견")
            except Exception as e:
                print("[X] 제품 리스트를 찾을 수 없음:", e)
                break

            if not products:
                print("[X] 제품 정보가 없습니다.")
                break

            for product in products:
                try:
                    item = {}
                    item['category'] = category_name

                    try:
                        name_elem = product.find_element(By.XPATH, ".//a/dl/dd/div[2]")
                        name_text = name_elem.text.strip()
                        item['name'] = clean_text(name_text)
                        brand_text = clean_text(name_text.split()[0])
                        item['brand'] = brand_text if brand_text else "브랜드 없음"
                    except:
                        item['name'] = "제품명 없음"
                        item['brand'] = "브랜드 없음"

                    item['uid'] = generate_uid(item['name'], existing_uids)  # UID 유지

                    try:
                        sale_price_text = product.find_element(By.XPATH, ".//a/dl/dd/div[3]/div[1]/div[1]/em/strong").text.strip()
                        item['sale_price'] = sale_price_text + "원"
                    except:
                        item['sale_price'] = "할인가 없음"

                    try:
                        link = product.find_element(By.TAG_NAME, "a").get_attribute("href")
                        item['link'] = link
                    except:
                        item['link'] = "링크 없음"

                    try:
                        img_url = product.find_element(By.XPATH, ".//a/dl/dt/img").get_attribute("src")
                        item['img'] = img_url
                    except:
                        item['img'] = "이미지 정보 없음"

                    results.append(item)
                except Exception as e:
                    print("[X] 제품 정보 추출 중 오류:", e)
                    continue

            if page == max_pages:
                print("[✓] 지정된 최대 페이지 도달")
                break
            else:
                if click_next_page(driver, page, category_name):
                    page += 1
                    WebDriverWait(driver, 10).until(
                        EC.presence_of_element_located((By.XPATH, "//ul[@id='productList']/li"))
                    )
                else:
                    print("[X] 다음 페이지로 이동 실패")
                    break

    driver.quit()
    return results

def main():
    for category_name, category_urls in CATEGORIES.items():
        file_path = os.path.join(BASE_PATH, f"coupang_{category_name}.json")
        existing_uids = load_existing_data(file_path)
        data = crawl_coupang_category(category_name, category_urls, existing_uids)
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
        print(f"[*] 데이터가 '{file_path}' 파일로 저장되었습니다.")

    print("\n[✓] 쿠팡 전체 카테고리 크롤링 완료!")

if __name__ == "__main__":
    main()
