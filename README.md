# 🐍 AI Snake Game - TypeScript Edition

HTML5 Canvas와 TypeScript로 구현한 AI 기반 뱀 게임입니다. 플레이어와 AI 뱀이 함께 경쟁하며, LLM을 활용한 동적 혼잣말 시스템이 특징입니다.

## ✨ 주요 특징

- 🤖 **AI 뱀**: 지능적인 경로 찾기 및 자동 리스폰 시스템
- 💬 **LLM 혼잣말**: OpenAI API를 활용한 상황별 동적 텍스트 생성
- 🎯 **TypeScript**: 타입 안전성과 개발 생산성 향상
- ⚡ **Vite**: 빠른 개발 서버와 핫 리로드
- 🎨 **부드러운 애니메이션**: 선형 보간법을 통한 자연스러운 움직임
- 🎮 **다양한 게임 모드**: 경쟁, 협력, 생존 모드
- 📱 **반응형 디자인**: 다양한 화면 크기 지원

## 🎮 게임 방법

### 기본 조작
- **방향키**: 뱀 이동 (↑↓←→)
- **스페이스바**: 게임 시작/일시정지
- **API 키 설정**: OpenAI API 키로 AI 혼잣말 활성화 (선택사항)

### 게임 목표
1. 🍎 음식을 먹어 점수 획득 및 성장
2. 🤖 AI 뱀과 경쟁하여 더 많은 음식 차지
3. 💥 벽이나 몸체 충돌 회피
4. 🏆 최고 점수 달성

## 🚀 빠른 시작

### 개발 환경 설정

```bash
# 저장소 클론
git clone https://github.com/your-username/ai-snake-game-typescript.git
cd ai-snake-game-typescript

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 `http://localhost:8000` 접속

### 프로덕션 빌드

```bash
# 빌드 생성
npm run build

# 빌드 미리보기
npm run preview
```

## 🏗️ 프로젝트 구조

```
ai-snake-game-typescript/
├── index.html              # 메인 HTML 파일
├── style.css              # 게임 UI 스타일
├── package.json           # 프로젝트 설정
├── tsconfig.json          # TypeScript 설정
├── vite.config.ts         # Vite 번들러 설정
└── js/                    # TypeScript 소스 코드
    ├── game.ts            # 메인 게임 루프 및 관리자
    ├── snake.ts           # 플레이어 뱀 클래스
    ├── aiSnake.ts         # AI 뱀 클래스
    ├── food.ts            # 음식 시스템
    ├── particles.ts       # 파티클 효과
    ├── chatter.ts         # LLM 혼잣말 시스템
    ├── speechBubble.ts    # 말풍선 UI
    ├── apiKeyManager.ts   # API 키 관리
    ├── gameConstants.ts   # 게임 상수
    ├── types.ts           # TypeScript 타입 정의
    └── [기타 모듈들...]
```

## 🛠️ 기술 스택

### 프론트엔드
- **TypeScript** - 타입 안전한 JavaScript
- **HTML5 Canvas** - 고성능 2D 그래픽
- **CSS3** - 모던 스타일링
- **Vite** - 빠른 빌드 도구

### AI & API
- **OpenAI GPT-4** - 동적 혼잣말 생성
- **로컬 스토리지** - API 키 및 설정 저장
- **Fetch API** - 비동기 API 통신

### 게임 엔진
- **Canvas 2D Context** - 그래픽 렌더링
- **requestAnimationFrame** - 부드러운 애니메이션
- **이벤트 시스템** - 키보드 입력 처리

## 🎯 핵심 시스템

### AI 뱀 시스템
```typescript
// 지능적인 경로 찾기
decideDirection(foods, playerSnake) {
    // 맨하탄 거리 기반 최적 경로 계산
    // 충돌 회피 알고리즘
    // 5% 확률의 실수 요소
}
```

### LLM 혼잣말 시스템
```typescript
// 상황별 동적 텍스트 생성
generateChatter(situation: GameSituation) {
    // 캐싱 시스템으로 API 호출 최적화
    // 중복 방지 및 상황 분석
    // 폴백 시스템으로 안정성 보장
}
```

### 파티클 시스템
```typescript
// 시각적 효과 및 피드백
createParticles(x, y, color, count) {
    // 음식 섭취 시 폭발 효과
    // 물리 기반 파티클 움직임
    // 생명주기 관리
}
```

## 🔧 개발 명령어

```bash
# 개발 서버 실행
npm run dev

# TypeScript 타입 체크
npm run type-check

# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview
```

## 🎨 게임 특징

### 다양한 시각 효과
- 🌈 **그라데이션 뱀**: 머리부터 꼬리까지 색상 변화
- ✨ **파티클 폭발**: 음식 섭취 시 시각적 피드백
- 💭 **말풍선**: AI와 플레이어의 혼잣말 표시
- 🔥 **글로우 효과**: 네온 스타일 그래픽

### 지능적인 AI
- 🧠 **경로 최적화**: A* 알고리즘 기반 이동
- 🎯 **목표 우선순위**: 거리와 경쟁 상황 고려
- 🔄 **자동 리스폰**: 사망 후 5초 뒤 안전한 위치에 재생성
- 🎲 **랜덤 실수**: 인간적 요소로 게임 밸런스 조정

### 혁신적인 혼잣말 시스템
- 🤖 **상황 인식**: 현재 게임 상태 분석
- 💬 **동적 생성**: OpenAI API로 실시간 텍스트 생성
- 🔄 **캐싱 최적화**: API 사용량 절약
- 📝 **폴백 시스템**: API 실패 시 사전 정의된 텍스트 사용

## 📱 API 키 설정

### OpenAI API 키 (선택사항)
1. [OpenAI Platform](https://platform.openai.com/)에서 API 키 발급
2. 게임 내 "AI 혼잣말 설정" 섹션에서 키 입력
3. "저장" 버튼 클릭
4. AI 뱀과 플레이어가 더 다양한 혼잣말 사용

**참고**: API 키 없이도 게임을 완전히 즐길 수 있습니다!

## 🌟 향후 계획

- [ ] 🎵 배경음악 및 효과음 추가
- [ ] 🏆 순위표 및 업적 시스템
- [ ] 🌐 멀티플레이어 온라인 모드
- [ ] 📊 상세한 게임 통계
- [ ] 🎨 커스터마이징 가능한 스킨
- [ ] 📱 모바일 터치 컨트롤

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

MIT License - 자유롭게 사용 및 수정 가능합니다.

## 👨‍💻 개발자

TypeScript 리팩토링 및 AI 시스템 구현

---

🎮 **즐거운 게임 되세요!** 질문이나 피드백이 있으시면 언제든 이슈를 올려주세요.