export class Chatter {
    constructor() {
        this.apiEndpoint = 'https://api.openai.com/v1/chat/completions';
        this.apiKey = null; // 사용자가 설정해야 함
        this.cache = new Map(); // 응답 캐싱
        this.lastRequestTime = 0;
        this.minInterval = 5000; // 5초 최소 간격 (LLM 체감 향상)
        
        // 오류 추적 및 API 중단 관리
        this.errorCount = 0;
        this.maxErrors = 3; // 연속 3회 오류 시 API 중단
        this.apiDisabled = false;
        this.apiDisabledUntil = 0;
        this.disableDuration = 300000; // 5분간 API 중단
        
        // 폴백 메시지 중복 방지
        this.recentFallbacks = new Map(); // key: 뱀타입_상황, value: 최근 사용한 메시지들
        this.maxRecentFallbacks = 3; // 최근 3개 메시지 추적
        
        // 전역 최근 메시지 추적 (LLM + 폴백 모두 포함)
        this.recentMessages = new Map(); // key: 뱀타입, value: 최근 사용한 메시지들
        this.maxRecentMessages = 5; // 최근 5개 메시지 추적
        
        // 로컬 스토리지에서 API 키 로드
        this.loadApiKey();
        
        // 상황별 프롬프트 (개선된 버전)
        this.prompts = {
            hunting: "음식을 찾는 상황입니다. 배고픔을 표현하는 인터넷 커뮤니티 스타일 혼잣말을 하세요. 예시: ㅇㄱㄹㅇ배고픔, 먹방가즈아, 간식ㄱㄱ",
            eating: "음식을 먹는 중입니다. 맛있다는 기쁨을 인터넷 밈으로 표현하는 혼잣말을 하세요. 예시: ㅗㅜㅑ맛있어, 개꿀맛ㅋㅋ, 존맛탱",
            danger: "위험한 상황입니다. 당황하는 감정을 인터넷 용어로 표현하는 혼잣말을 하세요. 예시: ㅁㅊ위험해, 망했다ㅋㅋ, 헐위험",
            idle: "심심한 상황입니다. 지루함을 표현하는 인터넷 용어 혼잣말을 하세요. 예시: ㅇㅇ지루해, 뭐하지ㅋㅋ, 심심하네",
            competitive: "경쟁 상황입니다. 도전적인 감정을 인터넷 용어로 표현하는 혼잣말을 하세요. 예시: ㄱㄱ싸자, 내가이김ㅋ, 덤벼라",
            ai_hunting: "AI 뱀이 음식을 탐색중입니다. 논리적이고 체계적인 혼잣말을 하세요. 예시: 경로계산중, 타겟스캔, 최적화필요",
            ai_eating: "AI 뱀이 음식을 섭취했습니다. 효율성에 대한 논리적 혼잣말을 하세요. 예시: 효율성증가, 에너지충전, 성능향상",
            ai_danger: "AI 뱀이 위험을 감지했습니다. 냉정한 분석적 혼잣말을 하세요. 예시: 위험감지됨, 회피필요, 재계산중"
        };
        
        // 폴백 텍스트 (API 실패 시 사용) - 커뮤니티체
        this.fallbackTexts = {
            hunting: ["ㅇㄱㄹㅇ 배고픔", "먹방가즈아", "사과 ㅊㅊ", "배고파죽겠네", "간식 어딨지ㅋ", "냠냠타임", "꿀조합 찾자", "먹부림ㅋㅋ", "배고프다진짜", "음식 ㄱㄱ"],
            eating: ["ㅗㅜㅑ 맛있어", "개맛있네ㅋㅋ", "꿀맛이네", "존맛탱", "더줘ㅋㅋ", "극락이다", "맛도리", "굿굿", "개존맛", "꿀빰"],
            danger: ["ㅁㅊ위험해", "아 시발", "어우야", "망했다ㅋㅋ", "죽겠네", "헐 위험", "도망가자", "아니야;;", "진짜위험", "사고뻔함"],
            idle: ["ㅇㅇ지루해", "뭐하지ㅋㅋ", "심심하네", "날씨조타", "여유롭네", "힐링타임", "피곤해", "한가하다", "평온함", "졸려죽겠어"],
            competitive: ["ㄱㄱ싸자", "내가이김ㅋ", "덤벼라", "이길거야", "지지않아", "1등각", "넘파이팅", "빨리가자", "대결이다", "승부욕ㅋ"],
            ai_hunting: ["경로 계산 중", "최적화 필요", "타겟 스캔", "분석 중", "탐색 알고리즘", "거리 측정", "패턴 분석", "최단경로", "목표 설정", "데이터 처리", "좌표 계산", "효율 검토", "시스템 스캔", "정보 수집", "루트 탐색"],
            ai_eating: ["효율성 증가", "에너지 충전", "성능 향상", "데이터 수집", "연산 최적화", "시스템 업그레이드", "배터리 보충", "메모리 확장", "처리속도 증가", "알고리즘 개선", "코어 강화", "네트워크 향상", "부스트 모드", "터보 충전", "파워 업"],
            ai_danger: ["위험 감지됨", "회피 필요", "안전 모드", "재계산 중", "충돌 경고", "리스크 분석", "방어 시스템", "긴급 회피", "안전 프로토콜", "위험도 측정", "보안 모드", "대피 경로", "경고 신호", "방어막 활성", "비상 모드"]
        };
    }

    // 로컬 스토리지에서 API 키 로드
    loadApiKey() {
        try {
            const storedKey = localStorage.getItem('openai_api_key');
            if (storedKey) {
                this.apiKey = storedKey;
            }
        } catch (error) {
            console.warn('API 키 로드 실패:', error);
        }
    }

    // API 키 설정 및 저장
    setApiKey(key) {
        this.apiKey = key;
        try {
            if (key) {
                localStorage.setItem('openai_api_key', key);
            } else {
                localStorage.removeItem('openai_api_key');
            }
        } catch (error) {
            console.warn('API 키 저장 실패:', error);
        }
    }

    // API 키 유효성 검사
    isApiKeyValid() {
        return this.apiKey && this.apiKey.trim().length > 0;
    }

    // 혼잣말 생성 (메인 함수)
    async generateChatter(situation, isAI = false) {
        // AI 뱀은 항상 폴백 메시지만 사용
        if (isAI) {
            return this.getFallbackTextWithType(situation, isAI);
        }
        
        const currentTime = Date.now();
        
        // API 중단 상태 확인
        if (this.apiDisabled) {
            if (currentTime < this.apiDisabledUntil) {
                return this.getFallbackTextWithType(situation, isAI);
            } else {
                // 중단 시간 경과 시 API 재활성화
                this.apiDisabled = false;
                this.errorCount = 0;
                console.log('API 호출 재활성화됨');
            }
        }
        
        // 우선순위 기반 요청 간격 제한
        const priority = this.getSituationPriority(situation);
        const requiredInterval = this.getRequiredInterval(priority);
        
        if (currentTime - this.lastRequestTime < requiredInterval) {
            const snakeType = isAI ? 'AI' : '플레이어';
            const remaining = Math.ceil((requiredInterval - (currentTime - this.lastRequestTime)) / 1000);
            console.log(`⏰ [API 제한] ${snakeType} 뱀 - 상황: ${situation} (${priority}), ${remaining}초 후 재시도 가능`);
            return this.getFallbackTextWithType(situation, isAI);
        }
        
        // AI 뱀인 경우 프롬프트 조정
        const promptKey = isAI ? `ai_${situation}` : situation;
        // 상황별 차별화된 캐시 시간 적용
        const cacheTimeWindow = this.getCacheTimeWindow(situation);
        const contextHash = this.generateContextHash(situation, isAI);
        const cacheKey = `${promptKey}_${Math.floor(currentTime / cacheTimeWindow)}_${contextHash}`;
        
        // 캐시 확인 및 중복 검사
        if (this.cache.has(cacheKey)) {
            const cachedResponse = this.cache.get(cacheKey);
            const snakeType = isAI ? 'AI' : '플레이어';
            
            // 캐시된 응답도 중복 검사
            if (!this.checkAndAddRecentMessage(cachedResponse.text, isAI)) {
                console.log(`🔁 [캐시 중복 감지] ${snakeType} 뱀 - 메시지: "${cachedResponse.text}" -> 캐시 무효화`);
                this.cache.delete(cacheKey);
                // 캐시 무효화 후 새로운 응답 생성을 위해 계속 진행
            } else {
                console.log(`💾 [캐시 사용] ${snakeType} 뱀 - 상황: ${situation}, 메시지: "${cachedResponse.text}", 타입: ${cachedResponse.type}`);
                return cachedResponse;
            }
        }
        
        // API 키가 없으면 폴백 사용
        if (!this.isApiKeyValid()) {
            return this.getFallbackTextWithType(situation, isAI);
        }
        
        try {
            this.lastRequestTime = currentTime;
            const response = await this.callLLM(promptKey);
            
            // API 호출 성공 시 오류 카운트 리셋
            this.errorCount = 0;
            
            // 중복 검사 및 처리
            if (!this.checkAndAddRecentMessage(response, isAI)) {
                console.log(`🔁 [LLM 중복 감지] 플레이어 뱀 - 메시지: "${response}" -> 폴백으로 대체`);
                return this.getFallbackTextWithType(situation, isAI);
            }
            
            // 캐시에 저장
            const responseWithType = { text: response, type: 'llm' };
            this.cache.set(cacheKey, responseWithType);
            
            // 캐시 크기 제한 (메모리 관리)
            if (this.cache.size > 50) {
                const firstKey = this.cache.keys().next().value;
                this.cache.delete(firstKey);
            }
            
            const snakeType = isAI ? 'AI' : '플레이어';
            console.log(`✅ [LLM 응답 완료] ${snakeType} 뱀 - 상황: ${situation}, 메시지: "${response}"`);
            
            return responseWithType;
        } catch (error) {
            console.warn('LLM API 호출 실패:', error);
            
            // 429 오류 특별 처리
            if (error.message.includes('429') || error.message.includes('Too Many Requests')) {
                this.errorCount++;
                console.warn(`API 사용량 초과 오류 (${this.errorCount}/${this.maxErrors})`);
                
                // 연속 오류 횟수가 최대치 도달 시 API 중단
                if (this.errorCount >= this.maxErrors) {
                    this.apiDisabled = true;
                    this.apiDisabledUntil = currentTime + this.disableDuration;
                    console.warn(`API 호출 ${this.disableDuration / 60000}분간 중단됨`);
                }
            }
            
            return this.getFallbackTextWithType(situation, isAI);
        }
    }

    // LLM API 호출
    async callLLM(promptKey) {
        const prompt = this.prompts[promptKey] || this.prompts.idle;
        
        const requestBody = {
            model: "gpt-4.1-mini",
            messages: [
                {
                    role: "system",
                    content: "당신은 인터넷 커뮤니티를 자주 하는 뱀 게임 캐릭터입니다. 규칙: 1) 15자 이하 짧은 혼잣말만 2) 따옴표, 괄호, 특수문자 절대 사용 금지 3) ㅋㅋ, ㅇㅇ, ㄱㄱ 같은 자음 표현 적극 활용 4) 디시인사이드, 웃긴대학 스타일의 줄임말 사용 5) 혼잣말만 말하고 설명 금지"
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            max_tokens: 50,
            temperature: 0.9
        };

        // 요청 로깅
        console.log(`🚀 [LLM API 요청] 상황: ${promptKey}`);
        console.log(`📝 [요청 내용] ${prompt}`);
        console.log(`📋 [요청 데이터]`, requestBody);

        const startTime = Date.now();
        
        // API 타임아웃 설정 (3초)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify(requestBody),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            const responseTime = Date.now() - startTime;
            
            console.log(`📡 [API 응답] 상태: ${response.status}, 소요시간: ${responseTime}ms`);

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`❌ [API 오류] 상태: ${response.status}, 내용: ${errorText}`);
                throw new Error(`API 호출 실패: ${response.status}`);
            }

            const data = await response.json();
            console.log(`📦 [응답 데이터]`, data);
            
            const text = data.choices[0]?.message?.content?.trim() || '';
            
            // 15자 제한을 스마트하게 적용 (단어/문장 경계에서 자르기)
            const finalText = this.smartTruncate(text, 15);
            
            console.log(`💬 [최종 응답] "${finalText}"`);
            console.log(`⏱️ [API 호출 완료] 총 소요시간: ${responseTime}ms`);
            
            return finalText;
            
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                console.warn('⏰ [API 타임아웃] 3초 초과로 요청 중단됨');
                throw new Error('API 타임아웃 (3초 초과)');
            }
            
            throw error;
        }
    }

    // 폴백 텍스트 가져오기 (전역 중복 방지 통합)
    getFallbackText(situation, isAI = false) {
        const key = isAI ? `ai_${situation}` : situation;
        const texts = this.fallbackTexts[key] || this.fallbackTexts.idle;
        const snakeType = isAI ? 'AI' : '플레이어';
        const fallbackKey = `${snakeType}_${situation}`;
        
        // 최근 사용한 메시지들 가져오기 (전역 + 상황별)
        const recentMessages = this.recentFallbacks.get(fallbackKey) || [];
        const globalRecentMessages = this.recentMessages.get(snakeType) || [];
        
        // 전역 및 상황별 중복 모두 제외
        const availableTexts = texts.filter(text => 
            !recentMessages.includes(text) && !globalRecentMessages.includes(text)
        );
        
        // 사용 가능한 메시지가 없으면 전체에서 선택 (리셋)
        const selectedTexts = availableTexts.length > 0 ? availableTexts : texts;
        let selectedText = selectedTexts[Math.floor(Math.random() * selectedTexts.length)];
        
        // 전역 중복 방지를 위해 재시도 (최대 10번)
        let retryCount = 0;
        while (globalRecentMessages.includes(selectedText) && retryCount < 10) {
            selectedText = selectedTexts[Math.floor(Math.random() * selectedTexts.length)];
            retryCount++;
        }
        
        // 재시도로도 중복이면 강제로 다른 메시지 선택
        if (globalRecentMessages.includes(selectedText)) {
            // 전체 풀에서 전역 최근 메시지에 없는 것들 찾기
            const nonRecentTexts = texts.filter(text => !globalRecentMessages.includes(text));
            if (nonRecentTexts.length > 0) {
                selectedText = nonRecentTexts[Math.floor(Math.random() * nonRecentTexts.length)];
            } else {
                // 최악의 경우 메시지에 번호 추가로 구분
                selectedText = selectedText + ` #${Date.now() % 100}`;
            }
        }
        
        // 최근 사용 메시지 목록 업데이트 (상황별)
        const updatedRecent = [selectedText, ...recentMessages.slice(0, this.maxRecentFallbacks - 1)];
        this.recentFallbacks.set(fallbackKey, updatedRecent);
        
        // 전역 최근 메시지 목록 업데이트
        this.checkAndAddRecentMessage(selectedText, isAI);
        
        console.log(`🔄 [폴백 메시지] ${snakeType} 뱀 - 상황: ${situation}, 메시지: "${selectedText}" (중복방지: ${availableTexts.length}/${texts.length} 가능, 재시도: ${retryCount}번)`);
        return selectedText;
    }

    // 타입 정보가 포함된 폴백 텍스트 가져오기
    getFallbackTextWithType(situation, isAI = false) {
        const text = this.getFallbackText(situation, isAI);
        return { text: text, type: 'fallback' };
    }

    // 컨텍스트 해시 생성 (더 세밀한 변화로 다양성 증대)
    generateContextHash(situation, isAI) {
        const currentTime = Date.now();
        const randomSeed = Math.floor(currentTime / 15000); // 15초마다 변경 (기존 30초에서 개선)
        const situationWeight = situation.length * 7; // 상황별 가중치
        const aiWeight = isAI ? 13 : 17; // AI 여부 가중치
        const hash = (randomSeed + situationWeight + aiWeight) % 8; // 0-7 범위 (더 다양한 해시)
        return hash;
    }

    // 상황별 우선순위 결정
    getSituationPriority(situation) {
        const highPriority = ['eating', 'danger'];
        const mediumPriority = ['competitive', 'hunting'];
        const lowPriority = ['idle'];
        
        if (highPriority.includes(situation)) return 'high';
        if (mediumPriority.includes(situation)) return 'medium';
        return 'low';
    }

    // 우선순위별 요구 간격 계산 (완화된 버전)
    getRequiredInterval(priority) {
        switch(priority) {
            case 'high': return 1000; // 1초 (기존 2초에서 완화)
            case 'medium': return 3000; // 3초 (기존 5초에서 완화)
            case 'low': return 6000; // 6초 (기존 8초에서 완화)
            default: return 3000;
        }
    }

    // 상황별 캐시 시간 윈도우 계산
    getCacheTimeWindow(situation) {
        const highPriority = ['eating', 'danger'];
        const mediumPriority = ['competitive', 'hunting'];
        const lowPriority = ['idle'];
        
        if (highPriority.includes(situation)) {
            return 60000; // 1분 - 빠른 변화
        } else if (mediumPriority.includes(situation)) {
            return 120000; // 2분 - 중간 변화
        } else {
            return 300000; // 5분 - 느린 변화
        }
    }

    // 상황 분석 (게임 상태를 바탕으로 상황 판단)
    analyzeSituation(snake, foods, otherSnake = null) {
        const head = snake.body[0];
        
        // 음식까지의 거리 계산
        let nearestFoodDistance = Infinity;
        if (foods && foods.length > 0) {
            foods.forEach(food => {
                const distance = Math.abs(head.x - food.x) + Math.abs(head.y - food.y);
                nearestFoodDistance = Math.min(nearestFoodDistance, distance);
            });
        }
        
        // 다른 뱀과의 거리 (경쟁 상황 감지)
        let competitorDistance = Infinity;
        if (otherSnake && otherSnake.isAlive) {
            const otherHead = otherSnake.body[0];
            competitorDistance = Math.abs(head.x - otherHead.x) + Math.abs(head.y - otherHead.y);
        }
        
        // 벽까지의 거리 (위험 상황 감지)
        const wallDistance = Math.min(head.x, head.y, 20 - head.x, 20 - head.y);
        
        // 상황 우선순위 판단
        if (wallDistance <= 2 || this.isNearOwnBody(snake)) {
            return 'danger';
        }
        
        if (nearestFoodDistance <= 3 && competitorDistance <= 5) {
            return 'competitive';
        }
        
        if (nearestFoodDistance <= 5) {
            return 'hunting';
        }
        
        return 'idle';
    }

    // 자신의 몸체와 가까운지 확인
    isNearOwnBody(snake) {
        const head = snake.body[0];
        return snake.body.slice(1).some(segment => {
            const distance = Math.abs(head.x - segment.x) + Math.abs(head.y - segment.y);
            return distance <= 1;
        });
    }

    // 스마트 텍스트 자르기 (단어/문장 경계에서 자르기)
    smartTruncate(text, maxLength) {
        if (text.length <= maxLength) {
            return text;
        }
        
        // 먼저 따옴표와 특수문자 제거
        let cleanText = text.replace(/["""'''`]/g, '').trim();
        
        if (cleanText.length <= maxLength) {
            return cleanText;
        }
        
        // 공백 기준으로 단어 분리
        const words = cleanText.split(/\s+/);
        let result = '';
        
        for (const word of words) {
            const testResult = result + (result ? ' ' : '') + word;
            if (testResult.length <= maxLength) {
                result = testResult;
            } else {
                break;
            }
        }
        
        // 결과가 없으면 원본을 maxLength로 자르기
        if (!result) {
            result = cleanText.substring(0, maxLength);
        }
        
        // 문장 끝 처리 (자연스러운 종료)
        if (result.length < cleanText.length) {
            // 마지막 문자가 완전하지 않으면 자연스럽게 처리
            if (!/[.!?ㅋㅎ]$/.test(result)) {
                // 감탄사나 웃음 표현으로 끝나지 않으면 자연스럽게 마무리
                if (result.includes('ㅋ') || result.includes('ㅎ') || result.includes('!')) {
                    // 이미 감정 표현이 있으면 그대로
                } else {
                    // 자연스러운 마무리 추가
                    if (result.length <= maxLength - 1) {
                        result += 'ㅋ';
                    }
                }
            }
        }
        
        return result;
    }

    // 중복 검사 및 최근 메시지 추가 (통합 함수)
    checkAndAddRecentMessage(message, isAI = false) {
        const snakeType = isAI ? 'AI' : '플레이어';
        const recentMessages = this.recentMessages.get(snakeType) || [];
        
        // 최근 메시지와 중복 확인
        if (recentMessages.includes(message)) {
            return false; // 중복됨
        }
        
        // 최근 메시지 목록 업데이트
        const updatedRecent = [message, ...recentMessages.slice(0, this.maxRecentMessages - 1)];
        this.recentMessages.set(snakeType, updatedRecent);
        
        return true; // 중복 아님
    }
    
    // 캐시 정리
    clearCache() {
        this.cache.clear();
    }
}