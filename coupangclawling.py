import time
import json
from selenium import webdriver
from selenium.common.exceptions import NoSuchElementException, TimeoutException
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from webdriver_manager.chrome import ChromeDriverManager


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


def search_coupang(keyword):
    driver = setup_driver()
    driver.get("https://www.coupang.com/")

    try:
        # 팝업 닫기 (존재하는 경우)
        try:
            close_button = WebDriverWait(driver, 5).until(
                EC.element_to_be_clickable((By.CLASS_NAME, "close"))
            )
            close_button.click()
        except Exception:
            pass

        # 검색어 입력
        search_box = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.NAME, "q"))
        )
        search_box.send_keys(keyword)
        search_box.send_keys(Keys.RETURN)

        # 검색 결과 로딩 대기
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "search-product"))
        )

        # 초기 로드된 상품 요소들 수집
        products = driver.find_elements(By.CLASS_NAME, "search-product")
        scroll_count = 0

        # 60개 미만이면 스크롤을 통해 추가 로딩 시도 (최대 5회)
        while len(products) < 60 and scroll_count < 5:
            driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(2)  # 로딩 대기
            products = driver.find_elements(By.CLASS_NAME, "search-product")
            scroll_count += 1

        results = []
        # 상위 60개 제품 정보 추출
        for product in products[:60]:
            try:
                item = {}

                # 제품명 추출
                try:
                    product_name = product.find_element(By.CLASS_NAME, "name").text.strip()
                except Exception:
                    product_name = ""
                if not product_name:
                    try:
                        img_tag = product.find_element(By.TAG_NAME, "img")
                        alt_text = img_tag.get_attribute("alt")
                        product_name = alt_text.strip() if alt_text else ""
                    except Exception:
                        product_name = ""
                item['name'] = product_name if product_name else "제품명 정보 없음"

                # 가격 추출 → "sale_price"로 저장
                try:
                    item['sale_price'] = product.find_element(By.CLASS_NAME, "price-value").text.strip()
                except NoSuchElementException:
                    item['sale_price'] = "가격 정보 없음"

                # 제품 상세 링크 추출
                try:
                    ahref = product.find_element(By.TAG_NAME, 'a')
                    item['link'] = ahref.get_attribute('href')
                except Exception:
                    item['link'] = "링크 정보 없음"

                # 이미지 URL 추출
                try:
                    img_tag = product.find_element(By.TAG_NAME, "img")
                    img_url = img_tag.get_attribute("src")
                    if not img_url:
                        img_url = img_tag.get_attribute("data-src")
                    item['img'] = img_url if img_url else "이미지 정보 없음"
                except Exception:
                    item['img'] = "이미지 정보 없음"

                results.append(item)
            except Exception as e:
                print("제품 정보 추출 중 오류:", e)
                continue

        return results

    except TimeoutException:
        print("페이지 로딩 시간이 초과되었습니다. 네트워크 연결을 확인하거나 나중에 다시 시도해주세요.")
        return []
    except Exception as e:
        print(f"크롤링 중 오류가 발생했습니다: {str(e)}")
        return []
    finally:
        driver.quit()


def save_to_json(data, filename):
    with open(filename, mode='w', encoding='utf-8-sig') as file:
        json.dump(data, file, ensure_ascii=False, indent=4)
    print(f"데이터가 '{filename}' 파일로 저장되었습니다.")


def main():
    keywords = [
        "올곧은 기저귀", "르프레시 기저귀", "네추럴블라썸 기저귀", "밤보네이처 기저귀", "비앤비 기저귀", "닥터아토 기저귀", "아토마일드 기저귀",
        "올곧은 물티슈", "르프레시 물티슈", "네추럴블라썸 물티슈", "밤보네이처 물티슈", "비앤비 물티슈", "닥터아토 물티슈", "아토마일드 물티슈"
    ]
    all_results = []

    for keyword in keywords:
        print(f"'{keyword}' 검색 중...")
        results = search_coupang(keyword)
        all_results.extend(results)

    if all_results:
        save_to_json(all_results, "쿠팡_기저귀_물티슈.json")
    else:
        print("검색 결과를 가져오는 데 실패했습니다.")


if __name__ == "__main__":
    main()
