// OpenAI API 호출 전담 클래스
export class ApiClient {
    constructor() {
        this.apiEndpoint = 'https://api.openai.com/v1/chat/completions';
        this.apiKey = null;
        this.lastRequestTime = 0;
        
        // 오류 추적 및 API 중단 관리
        this.errorCount = 0;
        this.maxErrors = 3;
        this.apiDisabled = false;
        this.apiDisabledUntil = 0;
        this.disableDuration = 300000; // 5분
        
        this.loadApiKey();
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

    // API 사용 가능 여부 확인
    isApiAvailable() {
        const currentTime = Date.now();
        
        if (this.apiDisabled) {
            if (currentTime < this.apiDisabledUntil) {
                return false;
            } else {
                // 중단 시간 경과 시 API 재활성화
                this.apiDisabled = false;
                this.errorCount = 0;
                console.log('API 호출 재활성화됨');
            }
        }
        
        return this.isApiKeyValid();
    }

    // 요청 간격 확인
    canMakeRequest(requiredInterval) {
        const currentTime = Date.now();
        return currentTime - this.lastRequestTime >= requiredInterval;
    }

    // LLM API 호출
    async callAPI(prompt, promptKey) {
        if (!this.isApiAvailable()) {
            throw new Error('API를 사용할 수 없습니다');
        }

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

        console.log(`🚀 [LLM API 요청] 상황: ${promptKey}`);
        console.log(`📝 [요청 내용] ${prompt}`);

        const startTime = Date.now();
        this.lastRequestTime = startTime;
        
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
                
                // 429 오류 특별 처리
                if (response.status === 429) {
                    this.handleRateLimitError();
                }
                
                throw new Error(`API 호출 실패: ${response.status}`);
            }

            const data = await response.json();
            const text = data.choices[0]?.message?.content?.trim() || '';
            
            // API 호출 성공 시 오류 카운트 리셋
            this.errorCount = 0;
            
            console.log(`💬 [API 응답] "${text}"`);
            console.log(`⏱️ [API 호출 완료] 총 소요시간: ${responseTime}ms`);
            
            return text;
            
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                console.warn('⏰ [API 타임아웃] 3초 초과로 요청 중단됨');
                throw new Error('API 타임아웃 (3초 초과)');
            }
            
            // 일반 오류 처리
            if (error.message.includes('429') || error.message.includes('Too Many Requests')) {
                this.handleRateLimitError();
            }
            
            throw error;
        }
    }

    // Rate Limit 오류 처리
    handleRateLimitError() {
        this.errorCount++;
        console.warn(`API 사용량 초과 오류 (${this.errorCount}/${this.maxErrors})`);
        
        // 연속 오류 횟수가 최대치 도달 시 API 중단
        if (this.errorCount >= this.maxErrors) {
            this.apiDisabled = true;
            this.apiDisabledUntil = Date.now() + this.disableDuration;
            console.warn(`API 호출 ${this.disableDuration / 60000}분간 중단됨`);
        }
    }

    // 오류 카운트 리셋
    resetErrorCount() {
        this.errorCount = 0;
    }

    // API 상태 정보 반환
    getStatus() {
        return {
            isAvailable: this.isApiAvailable(),
            hasValidKey: this.isApiKeyValid(),
            isDisabled: this.apiDisabled,
            errorCount: this.errorCount,
            disabledUntil: this.apiDisabledUntil
        };
    }
}