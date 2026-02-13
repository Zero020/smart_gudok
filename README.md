# ![Group 1](https://github.com/user-attachments/assets/80922f40-7142-407d-be27-988a2fe92403)

**"똑똑한 구독관리, 구똑"**

구독 경제의 확산으로 인해 발생하는 '고정 지출 관리 실패' 문제를 해결하기 위해 제작된 스마트 구독 관리 대시보드입니다. 사용하지 않는 '고스트 구독'을 탐지하고, 실제 지출 금액을 시각화하여 합리적인 재무 의사결정을 돕습니다.

<br>

## 🚀 Project Overview
**개발 기간:** 2026.02.12 ~ 2026.02.13

**주요 타겟:** OTT, 쇼핑, 생산성 툴 등 3개 이상의 다중 구독 서비스를 이용하는 2030 세대

<br>

## 📈 문제 정의 및 기대 효과
**현황:** 글로벌 기준 약 85%의 사용자가 미사용 구독 서비스를 보유하고 있으며, **연간 약 17만 원**의 불필요한 지출이 발생

**효과:** '구똑' 사용 시 중복 구독 정리만으로도 연간 약 11만 원 이상의 고정비를 절감할 수 있을 것으로 기대 -> 지출 투명성 확보, 합리적 소비 유도, 고정비 절감

<br>

## ✨ Key Features
<img width="500" height="370" alt="gudok_dashboard" src="https://github.com/user-attachments/assets/86bc86e5-40e4-4ba2-8f91-2045bfe1aff7" /><img width="500" height="370" alt="gudok_management" src="https://github.com/user-attachments/assets/b24bf915-cc40-4a3c-bb85-7f753720e224" />

### 1. 메인 대시보드
- **월간/연간 지출 시각화:** 월 총결제 금액과 연간 환산 금액을 상단에 배치하여 지출 규모를 직관적으로 인지하게 합니다.

- **카테고리별 분석:** Recharts를 이용한 원형 차트로 [쇼핑, 콘텐츠, 생활, 교육, 렌탈, 기타] 지출 비중을 분석합니다.

- **결제 타임라인:** 오늘 날짜 기준 가장 가까운 결제 예정일을 D-Day 형식으로 정렬하여 보여줍니다.

### 2. 구독 관리 및 공유 최적화
- **실질 부담금 계산:** 전체 결제 금액과 공유 인원을 입력하면 '인당 1/n 가격'을 자동 계산하여 실제 체감 비용을 보여줍니다.

- **스마트 필터:** 카테고리별 필터링 기능을 통해 관리 효율을 높였습니다.

### 3. 예외 상황 및 과소비 방지 (Edge Case Handling)
- **중복 구독 경고:** 동일 카테고리(예: 콘텐츠)에 2개 이상의 서비스가 등록될 경우, 연간 절약 가능 금액을 계산하여 경고 배너를 띄웁니다.

- **가성비 탐지:** 사용자가 입력한 '이용률(가성비)'이 40퍼센트 이하인 서비스를 별도로 분류하여 해지를 권고합니다.

<br>

## 🛠 Tech Stack
- **Frontend:** React, TypeScript, Tailwind CSS

- **State Management:** React Hooks (Custom Hook: useSubscriptions)

- **Visualization:** Recharts

- **Storage:** Browser LocalStorage (별도 서버 없이 개인정보를 사용자 기기에 안전하게 보관)

- **Deployment:** Vercel

<br> 

## 📂 Project Structure
```
src/
├── assets/             # 로고 및 아이콘 (mainLogo, menu_list, icon_alert 등)
├── components/         # 공통 컴포넌트 (SubscriptionModal)
├── hooks/              # 커스텀 훅 (useSubscriptions: LocalStorage 로직)
├── pages/              # 페이지 컴포넌트 (Dashboard, Manage)
├── types/              # TypeScript 타입 정의 (Subscription, Category)
├── App.tsx             # 라우팅 및 레이아웃 설정
├── main.tsx            # 진입점 및 스타일 임포트
└── index.css           # Tailwind CSS 및 글로벌 스타일
```

<br>

## 🛠 Installation & Setup
**1. 저장소 복제**
```
git clone https://github.com/your-username/gudok-smart.git
cd gudok-smart
```

**2. 패키지 설치**

`npm install`

**3. Tailwind CSS 설정**

패키지 설치: `npm install -D tailwindcss postcss autoprefixer`

초기화: `npx tailwindcss init -p`

**4. 로컬 서버 실행**
`npm run dev`

<br>

## 🧠 Technical Challenges & Solutions
### Cascading Renders 에러 해결
**문제:** 모달이 열릴 때 useEffect를 통해 상태를 초기화하는 과정에서 이중 렌더링 경고 발생

**해결:** useEffect를 제거하고, 부모 컴포넌트에서 모달의 key 속성을 변경하는 전략을 택했습니다. 리액트가 key 변화를 감지해 컴포넌트를 완전히 재마운트하게 함으로써 단 한 번의 렌더링으로 초기 데이터를 주입하여 성능을 최적화

### 2. 데이터 무결성 및 사용자 경험 개선
- 서비스명과 월 요금 필수 입력 체크, 결제일 범위(1~31) 제한 로직을 적용하여 데이터 오류 방지

- 실수로 데이터를 지우는 일을 방지하기 위해 window.confirm을 통한 사용자 재확인 절차를 도입
