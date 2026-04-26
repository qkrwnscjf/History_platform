import requests
from pymongo import MongoClient
import os
import time
import random

MONGO_DETAILS = os.getenv("MONGO_DETAILS", "mongodb://mongodb:27017")
client = MongoClient(MONGO_DETAILS)
db = client["history_map"]
collection = db.events

# 검색할 핵심 키워드 목록
KEYWORDS = [
    {"lang": "ko", "q": "한국사"}, {"lang": "ko", "q": "조선왕조"}, {"lang": "ko", "q": "고려"},
    {"lang": "ko", "q": "삼국시대"}, {"lang": "ko", "q": "일제강점기"}, {"lang": "ko", "q": "대한민국 현대사"},
    {"lang": "en", "q": "Roman Empire"}, {"lang": "en", "q": "Ancient Egypt"}, {"lang": "en", "q": "World War II"},
    {"lang": "en", "q": "Industrial Revolution"}, {"lang": "en", "q": "French Revolution"}, {"lang": "en", "q": "Renaissance"}
]

def search_wikipedia(lang, query):
    url = f"https://{lang}.wikipedia.org/w/api.php"
    params = {
        "action": "query",
        "list": "search",
        "srsearch": query,
        "srlimit": "50",
        "format": "json"
    }
    try:
        res = requests.get(url, params=params).json()
        return res.get("query", {}).get("search", [])
    except: return []

def get_page_details(lang, page_id):
    url = f"https://{lang}.wikipedia.org/w/api.php"
    params = {
        "action": "query",
        "pageids": page_id,
        "prop": "extracts|coordinates",
        "exintro": True,
        "explaintext": True,
        "format": "json"
    }
    try:
        res = requests.get(url, params=params).json()
        page = res.get("query", {}).get("pages", {}).get(str(page_id), {})
        summary = page.get("extracts", "")
        if not summary: return None
        
        # 좌표 미발견 시 지역별 기본값 근처 랜덤 배치
        if "coordinates" in page:
            coords = page["coordinates"][0]
            location = [coords["lon"], coords["lat"]]
        else:
            location = [127.0 + random.uniform(-1.5, 1.5), 37.0 + random.uniform(-1.5, 1.5)] if lang == "ko" \
                  else [random.uniform(-10, 40), random.uniform(30, 60)]

        return {
            "title": page.get("title"),
            "summary": summary[:2000] + "...",
            "location": {"type": "Point", "coordinates": location},
            "year": 1900, # 연도는 검색 결과에서 추후 추출 가능
            "category": f"{lang.upper()} History"
        }
    except: return None

def seed_data():
    print("🚀 [Search-Based Update] 검색 기반 고품질 역사 데이터 수집 시작...")
    total = 0
    for item in KEYWORDS:
        print(f"🔍 '{item['q']}' ({item['lang']}) 검색 중...")
        results = search_wikipedia(item['lang'], item['q'])
        print(f"💡 발견된 관련 문서: {len(results)}개")
        
        for res in results:
            details = get_page_details(item['lang'], res["pageid"])
            if details:
                collection.update_one({"title": details["title"]}, {"$set": details}, upsert=True)
                total += 1
                if total % 10 == 0: print(f"✅ {total}개 데이터 적재 완료!")
            time.sleep(0.05)
    print(f"🏁 수집 완료. 총 {total}개의 역사적 설명 데이터가 준비되었습니다.")

if __name__ == "__main__":
    seed_data()
