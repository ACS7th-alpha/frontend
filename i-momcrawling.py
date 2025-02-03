import time
import json
import sys
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


def crawl_category(category_name, category_xpath):
    driver = setup_driver()
    driver.get("https://i-mom.co.kr")

    try:
        # 1. 햄버거 버튼 클릭 (카테고리 메뉴 열기)
        menu_button = WebDriverWait(driver, 15).until(
            EC.element_to_be_clickable((By.XPATH, "//a[@href='#category']"))
        )
        driver.execute_script("arguments[0].click();", menu_button)
        time.sleep(2)
        print(f"[✓] 햄버거 버튼 클릭 성공 ({category_name})")
    except Exception as e:
        print(f"[X] 햄버거 버튼 클릭 실패 ({category_name}):", str(e).encode("utf-8", errors="ignore").decode())
        driver.quit()
        return []

    try:
        # 2. 카테고리 클릭
        category_element = WebDriverWait(driver, 15).until(
            EC.element_to_be_clickable((By.XPATH, category_xpath))
        )
        driver.execute_script("arguments[0].click();", category_element)
        time.sleep(3)
        print(f"[✓] {category_name} 카테고리 클릭 성공")
    except Exception as e:
        print(f"[X] {category_name} 카테고리 클릭 실패:", str(e).encode("utf-8", errors="ignore").decode())
        driver.quit()
        return []

    results = []
    page = 1
    last_page = None  # 마지막 페이지 번호 저장 변수

    while True:
        print(f"\n[-] {category_name} - 페이지 {page} 크롤링 중...")
        scroll_down(driver, count=3)

        try:
            WebDriverWait(driver, 15).until(
                EC.presence_of_element_located((By.XPATH, "//li[contains(@class, 'goods_list_style3')]"))
            )
            print("[✓] 상품 리스트 로딩 완료")
        except Exception as e:
            print("[X] 상품 리스트 로딩 실패:", str(e).encode("utf-8", errors="ignore").decode())
            break

        try:
            products = driver.find_elements(By.XPATH, "//li[contains(@class, 'goods_list_style3')]")
            print(f"[*] 현재 페이지에 {len(products)}개의 상품 발견")
        except Exception as e:
            print("[X] 제품 리스트를 찾을 수 없음:", str(e).encode("utf-8", errors="ignore").decode())
            break

        if not products:
            print("[X] 제품 정보를 가져오지 못함")
            break

        for product in products:
            try:
                item = {}
                try:
                    item['name'] = product.find_element(By.XPATH, ".//span[contains(@class, 'name')]").text.strip()
                except Exception:
                    item['name'] = "제품명 없음"

                try:
                    item['sale_price'] = product.find_element(By.XPATH, ".//span[contains(@class, 'sale_price')]").text.strip()
                except Exception:
                    item['sale_price'] = "할인가 없음"

                try:
                    ahref = product.find_element(By.TAG_NAME, "a")
                    item['link'] = ahref.get_attribute('href')
                except Exception:
                    item['link'] = "링크 없음"

                try:
                    img_tag = product.find_element(By.TAG_NAME, "img")
                    item['img'] = img_tag.get_attribute("src")
                except Exception:
                    item['img'] = "이미지 정보 없음"

                results.append(item)
            except Exception as e:
                print("[X] 제품 정보 추출 중 오류:", str(e).encode("utf-8", errors="ignore").decode())
                continue

        # 마지막 페이지 확인
        if last_page is None:
            try:
                last_page_element = driver.find_element(By.XPATH, "//a[@class='last']")
                last_page = int(last_page_element.get_attribute("href").split("goodsSearchPage(")[1].split(")")[0])
                print(f"[-] 마지막 페이지 확인됨: {last_page}")
            except Exception:
                print("[!] 마지막 페이지 정보를 찾을 수 없음")
                break

        # 다음 페이지 이동 (JavaScript 실행)
        if page >= last_page:
            print("[✓] 마지막 페이지 도달, 크롤링 종료")
            break

        try:
            next_page_num = page + 1
            driver.execute_script(f"goodsSearchPage({next_page_num})")
            print(f"[→] JavaScript 실행: goodsSearchPage({next_page_num})")

            WebDriverWait(driver, 10).until(EC.staleness_of(products[0]))  # 상품이 변경될 때까지 대기
            time.sleep(3)
            page += 1

        except Exception:
            print("[✓] 마지막 페이지 도달 또는 다음 버튼 없음")
            break

    driver.quit()
    return results


def save_to_json(data, filename):
    try:
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
        print(f"[*] 데이터가 {filename} 파일로 저장되었습니다.")
    except Exception as e:
        print("[X] JSON 파일 저장 실패:", str(e).encode("utf-8", errors="ignore").decode())


def main():
    categories = {
        "기저귀_물티슈": "//a[contains(text(), '기저귀/물티슈')]",
        "생활_위생용품": "//a[contains(text(), '생활/위생용품')]",
        "스킨케어_화장품": "//a[contains(text(), '스킨케어/화장품')]",
        "수유_이유용품": "//a[contains(text(), '수유/이유용품')]",
        "패션의류_잡화": "//a[contains(text(), '패션의류/잡화')]",
        "침구류": "//a[contains(text(), '침구류')]",
        "완구용품": "//a[contains(text(), '발육/외출/완구용품')]",
        "식품": "//a[contains(text(), '식품')]"
    }

    for category_name, category_xpath in categories.items():
        data = crawl_category(category_name, category_xpath)
        save_to_json(data, f"아이맘_{category_name}.json")

    print("\n[✓] 모든 카테고리 크롤링 완료!")


if __name__ == "__main__":
    main()
