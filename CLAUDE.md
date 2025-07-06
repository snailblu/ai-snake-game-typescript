# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Standard Workflow

언어는 한국어로 대답해줘.

1. First think through the problem, read the codebase for relevant files, and write a plan to todo.md.
2. The plan should have a list of todo items that you can check off as you complete them
3. Before you begin working, check in with me and I will verify the plan.
4. Then, begin working on the todo items, marking them as complete as you go.
5. Please every step of the way just give me a high level explanation of what changes you made
6. Make every task and code change you do as simple as possible. We want to avoid making any massive or complex changes. Every change should impact as little code as possible. Everything is about simplicity.
7. Finally, add a review section to the todo.md file with a summary of the changes you made and any other relevant information.

## Security prompt:

Please check through all the code you just wrote and make sure it follows security best practices. make sure there are no sensitive information in the front and and there are no vulnerabilities that can be exploited

## Learning from Claude prompt:

Please explain the functionality and code you just built out in detail. Walk me through wehat you changed and how it works. Act like you're a senior engineer teaching me code

## Be productive while Claude cooks:

When I am coding with AI there are long breaks into between me giving me commands to the AI. Typically I spend that time doom scrolling which distracts me and pu†s me in a bad mental state. I'd like to use that time now to chat with you and generate new ideas, and also reflect on my other ideas and businesses and content. I'm not sure how I'd like to use this chat or what role I'd like you to play, but I think ti could be much more useful than me doom scrolling. What do you think? What could be the best way for us to use this chat?

## Project Structure

이 프로젝트는 HTML5 Canvas와 JavaScript ES6 모듈을 사용한 AI 기반 뱀 게임입니다.

```
snake-game/
├── index.html          # 메인 HTML 파일 (게임 인터페이스)
├── style.css           # 게임 UI 스타일시트
├── js/
│   ├── game.js         # 메인 게임 로직 및 루프 관리
│   ├── snake.js        # 플레이어 뱀 클래스
│   ├── aiSnake.js      # AI 뱀 클래스 (자동 이동 및 AI 로직)
│   ├── food.js         # 음식 시스템 (Food, FoodManager)
│   ├── particles.js    # 파티클 시스템 (시각 효과)
│   ├── chatter.js      # LLM 통합 혼잣말 시스템
│   └── speechBubble.js # 말풍선 UI 시스템
├── README.md           # 프로젝트 설명서
├── CLAUDE.md           # Claude Code 가이드라인
└── .gitignore          # Git 제외 파일 목록
```

### 주요 컴포넌트:
- **Game**: 게임 루프, 입력 처리, 충돌 검사 통합 관리
- **Snake**: 플레이어 뱀의 이동, 성장, 그리기 로직
- **AISnake**: AI 뱀의 자동 이동 및 경로 찾기 알고리즘
- **FoodManager**: 다중 음식 생성 및 관리
- **ParticleSystem**: 음식 섭취 시 시각 효과
- **Chatter**: OpenAI API를 통한 동적 텍스트 생성
- **SpeechBubbleManager**: 뱀들의 말풍선 표시 시스템

## Development Commands

이 프로젝트는 ES6 모듈을 사용하므로 로컬 서버에서 실행해야 합니다.

### 로컬 서버 실행 방법

#### Python 사용 (권장)
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```
브라우저에서 `http://localhost:8000` 접속

#### Node.js 사용
```bash
# npx를 사용한 간단한 서버
npx http-server

# 또는 serve 패키지 사용
npx serve
```

#### VS Code Live Server 확장 프로그램
1. VS Code에서 Live Server 확장 프로그램 설치
2. `index.html` 파일 우클릭 → "Open with Live Server"

### 개발 도구 사용법
- **브라우저 개발자 도구**: F12 키로 열어 콘솔 로그 확인
- **네트워크 탭**: LLM API 호출 상태 모니터링
- **Console 탭**: 게임 오브젝트 디버깅 (`window.game`으로 접근 가능)

### 파일 수정 시 주의사항
- ES6 모듈 파일 수정 후 브라우저 새로고침 필요
- `chatter.js`의 API 키 설정 확인
- CORS 정책으로 인해 `file://` 프로토콜로는 실행 불가

## Architecture Notes

### ES6 모듈 구조
- **모듈 시스템**: 각 클래스가 독립적인 모듈로 분리
- **의존성 관리**: import/export를 통한 명확한 의존성 선언
- **전역 접근**: `window.game` 객체를 통한 디버깅 지원

### 게임 루프 아키텍처
```
게임 루프 (150ms 간격)     렌더링 루프 (60fps)
      │                         │
      ├─ 뱀 이동                 ├─ 애니메이션 업데이트
      ├─ 충돌 검사               ├─ 파티클 시스템
      ├─ 음식 섭취 처리          ├─ AI 뱀 업데이트
      └─ 게임 상태 업데이트      └─ 화면 렌더링
```

### AI 시스템 설계
- **경로 찾기**: 맨하탄 거리 기반 최단 경로 계산
- **충돌 회피**: 벽, 자기 몸체, 플레이어 뱀 고려
- **행동 결정**: 5% 확률의 랜덤 실수로 인간적 요소 추가
- **리스폰 시스템**: 사망 후 5초 뒤 안전한 위치에 재생성

### LLM 통합 구조
- **API 통합**: OpenAI GPT-3.5-turbo 사용
- **캐싱 시스템**: 1분 단위로 응답 캐싱하여 API 호출 최적화
- **폴백 시스템**: API 실패 시 사전 정의된 텍스트 사용
- **상황 분석**: 게임 상태에 따른 적절한 혼잣말 생성

### 렌더링 시스템
- **이중 루프**: 게임 로직과 렌더링의 분리
- **부드러운 애니메이션**: 선형 보간법(lerp)을 통한 부드러운 이동
- **시각 효과**: 파티클 시스템, 그라데이션, 글로우 효과
- **UI 계층**: 말풍선, 점수 표시, 게임 오버 화면

### 성능 최적화
- **requestAnimationFrame**: 브라우저 최적화된 렌더링
- **객체 풀링**: 파티클 재사용으로 메모리 사용량 최적화
- **조건부 렌더링**: 필요한 경우에만 복잡한 효과 적용

## Security Notes

### 🚨 보안 문제 해결됨 (2025-07-06)

#### API 키 하드코딩 문제 해결
이전에 `chatter.js:4`에 OpenAI API 키가 하드코딩되어 있던 심각한 보안 취약점이 해결되었습니다.

**해결된 문제:**
- ✅ API 키가 클라이언트 코드에서 제거됨
- ✅ 로컬 스토리지 기반 동적 API 키 설정 구현
- ✅ 사용자 친화적인 API 키 관리 UI 추가
- ✅ 폴백 시스템으로 API 키 없이도 게임 진행 가능

**구현된 보안 조치:**
1. **동적 API 키 설정**
```javascript
// 로컬 스토리지에서 안전하게 로드
this.loadApiKey();

// 사용자가 직접 설정
chatter.setApiKey(userProvidedKey);
```

2. **UI 기반 API 키 관리**
- 게임 인터페이스에 API 키 설정 패널 추가
- 마스킹된 키 표시로 보안 강화
- 저장/삭제 버튼으로 간편한 관리

3. **안전한 폴백 시스템**
```javascript
// API 키가 없어도 게임 정상 작동
if (!this.isApiKeyValid()) {
    return this.getFallbackText(situation, isAI);
}
```

**사용 방법:**
1. 게임 페이지에서 "AI 혼잣말 설정" 섹션 확인
2. OpenAI API 키 입력 (선택사항)
3. "저장" 버튼 클릭
4. API 키 없이도 기본 텍스트로 게임 진행 가능

### 기타 보안 고려사항
- **XSS 방지**: 사용자 입력 데이터 검증 및 이스케이프
- **CORS 정책**: 적절한 도메인 제한 설정
- **API 호출 제한**: 과도한 API 호출 방지를 위한 throttling

## Development Guidelines

### 코드 스타일 컨벤션
- **클래스명**: PascalCase (예: `Snake`, `FoodManager`)
- **함수명**: camelCase (예: `generateChatter`, `updateAnimation`)
- **상수**: UPPER_SNAKE_CASE (예: `MAX_LIFE`, `GRID_SIZE`)
- **파일명**: camelCase (예: `aiSnake.js`, `speechBubble.js`)

### 새로운 기능 추가 시 고려사항

#### 1. 모듈 추가 시
```javascript
// 새 모듈 생성
export class NewFeature {
    constructor() {
        // 초기화 코드
    }
}

// game.js에서 import 및 초기화
import { NewFeature } from './newFeature.js';
this.newFeature = new NewFeature();
```

#### 2. 게임 루프 통합
- **업데이트 로직**: `game.js`의 `update()` 메서드에 추가
- **렌더링 로직**: `game.js`의 `draw()` 메서드에 추가
- **이벤트 처리**: `setupEventListeners()` 메서드에 추가

#### 3. AI 뱀 기능 확장
- `aiSnake.js`의 `decideDirection()` 메서드 수정
- 새로운 행동 패턴은 별도 메서드로 분리
- 기존 충돌 검사 로직 재사용

#### 4. 시각 효과 추가
- `particles.js`에 새로운 파티클 타입 추가
- `speechBubble.js`에 새로운 UI 요소 추가
- Canvas 렌더링 순서 고려 (뒤에서 앞으로)

### 성능 최적화 가이드라인
- **객체 생성 최소화**: 게임 루프 내에서 새 객체 생성 지양
- **DOM 접근 최소화**: 점수 업데이트 등은 변경 시에만 수행
- **이벤트 리스너**: 적절한 이벤트 위임 사용
- **메모리 누수 방지**: 타이머 및 이벤트 리스너 정리

### 디버깅 팁
- **콘솔 접근**: `window.game`으로 게임 객체 접근
- **상태 확인**: `game.snake.body`, `game.aiSnake.isAlive` 등
- **API 호출 모니터링**: 네트워크 탭에서 LLM API 호출 확인
- **에러 로깅**: try-catch 블록으로 에러 처리 및 로깅

### 테스트 전략
- **수동 테스트**: 다양한 게임 시나리오 테스트
- **브라우저 호환성**: Chrome, Firefox, Safari에서 테스트
- **모바일 테스트**: 터치 인터페이스 고려
- **성능 테스트**: 장시간 플레이 시 메모리 누수 확인