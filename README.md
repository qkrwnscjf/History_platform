# History Map Engine: 교육용 역사 시각화 플랫폼

> **역사를 시간(Timeline)과 공간(Map)의 축으로 직관적으로 이해해보자.**
> 
> 'History Map Engine'은 전 세계의 방대한 역사적 사건을 위키피디아에서 자동으로 수집하여 인터랙티브한 지도 위에 시각화하여 학생들이 직관적으로 역사를 이해하기 쉽게 제공하는 교육 플랫폼입니다.
> 
> **해당 프로젝트는 AI 에이전트를 활용하여 도메인 분석 능력 향상과, 구현하고자 하는 프로젝트의 기획 및 전략적인 아키텍쳐 설계 능력을 향상하고자 진행중입니다.

---

## 1. 프로젝트 설명
본 프로젝트는 학습자가 역사적 사건의 발생 지점과 시기를 직관적으로 파악할 수 있도록 돕는 도구입니다. 복잡한 텍스트 위주의 역사 정보를 공간 데이터(GeoJSON)로 변환하여, 사용자가 지도를 탐색하며 역사의 흐름을 입체적으로 이해할 수 있는 사용자 경험을 제공합니다.

## 2. 프로젝트 기획안
### 핵심 목표
- **데이터 자동화:** 위키피디아 API를 통한 대규모 역사 데이터 수집 파이프라인 구축.
- **학습 도구화:** 연관 검색과 상세 정보 사이드바를 통한 교육적 의의 전달.
- **접근성 최적화:** Docker Compose를 활용한 즉각적인 서비스 배포 및 구동.

### 주요 기능
- **Real-time Geo-Search:** 실시간 연관 검색어를 통한 사건 탐색 및 위치 이동(`flyTo`).
- **Educational Sidebar:** 사건의 배경, 요약, 교육적 가치를 제공하는 상세 정보 패널.
- **Dynamic Timeline:** 기원전 3000년부터 현재까지의 시계열 필터링 기능.
- **Marker Clustering:** 대용량 데이터 전송 및 렌더링 최적화.

## 3. 구현 전략 (Tech Stack)

### Infrastructure
- **Docker & Docker Compose:** 서비스 컨테이너화 및 원클릭 오케스트레이션.

### Backend (Data & API)
- **FastAPI:** 고성능 비동기 Python 웹 프레임워크.
- **MongoDB:** GeoJSON 공간 쿼리 및 Full-text Search를 위한 NoSQL DB.
- **Motor:** MongoDB 비동기 인터랙션 드라이버.
- **Python Scraper:** 위키피디아 검색 및 카테고리 기반 데이터 크롤링 엔진.

### Frontend (UI/UX)
- **React (Vite):** 빠르고 현대적인 프론트엔드 빌드 도구.
- **Tailwind CSS:** 유틸리티 우선의 세련된 UI 스타일링.
- **Leaflet & React-Leaflet:** 오픈 소스 지도 라이브러리 및 커스텀 마커 클러스터링.
- **Lucide Icons:** 직관적인 교육용 벡터 아이콘 시스템.

## 4. 실행 방법 (Quick Start)

본 프로젝트는 Docker가 설치된 환경에서 명령어 한 줄로 즉시 실행 가능합니다.

```bash
# 저장소 복제 및 이동
git clone https://github.com/your-username/history-map-engine.git
cd history-map-engine

# 서비스 빌드 및 실행 (백그라운드 모드)
docker-compose up -d --build
```

- **Frontend:** `http://localhost:5173`
- **Backend API:** `http://localhost:8000`

---

**최종 업데이트 날짜:** 2026년 4월 3일 금요일
