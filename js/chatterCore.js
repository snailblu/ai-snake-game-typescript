import { ApiClient } from './apiClient.js';
import { CacheManager } from './cacheManager.js';
import { MessageValidator } from './messageValidator.js';
import { PromptManager } from './promptManager.js';
import { SituationAnalyzer } from './situationAnalyzer.js';

// 리팩토링된 Chatter 시스템의 코어 클래스
export class ChatterCore {
    constructor() {
        // 각 기능별 전담 클래스들 초기화
        this.apiClient = new ApiClient();
        this.cacheManager = new CacheManager();
        this.messageValidator = new MessageValidator();
        this.promptManager = new PromptManager();
        this.situationAnalyzer = new SituationAnalyzer();
        
        // 캐시 정리 타이머 시작
        this.cacheManager.startPeriodicCleanup();
        
        console.log('🚀 [ChatterCore 초기화] 모든 서브시스템이 준비됨');
    }

    // 메인 혼잣말 생성 함수 (기존 Chatter.generateChatter와 호환)
    async generateChatter(situation, isAI = false) {
        // AI 뱀은 항상 폴백 메시지만 사용
        if (isAI) {
            return this.getFallbackTextWithType(situation, isAI);
        }
        
        const currentTime = Date.now();
        
        // API 사용 가능 여부 확인
        if (!this.apiClient.isApiAvailable()) {
            return this.getFallbackTextWithType(situation, isAI);
        }
        
        // 요청 간격 제한 확인
        const requiredInterval = this.situationAnalyzer.getRequiredIntervalBySituation(situation);
        if (!this.apiClient.canMakeRequest(requiredInterval)) {
            const snakeType = isAI ? 'AI' : '플레이어';
            const remaining = Math.ceil((requiredInterval - (currentTime - this.apiClient.lastRequestTime)) / 1000);
            console.log(`⏰ [API 제한] ${snakeType} 뱀 - 상황: ${situation}, ${remaining}초 후 재시도 가능`);
            return this.getFallbackTextWithType(situation, isAI);
        }
        
        // 캐시 확인
        const cachedResponse = this.cacheManager.get(situation, isAI);
        if (cachedResponse) {
            const snakeType = isAI ? 'AI' : '플레이어';
            
            // 캐시된 응답도 중복 검사
            if (!this.messageValidator.checkAndAddRecentMessage(cachedResponse.text, isAI)) {
                console.log(`🔁 [캐시 중복 감지] ${snakeType} 뱀 - 메시지: "${cachedResponse.text}" -> 캐시 무효화`);
                // 캐시 무효화 로직이 필요하면 여기에 추가
                // 현재는 새로운 응답 생성을 위해 계속 진행
            } else {
                console.log(`💾 [캐시 사용] ${snakeType} 뱀 - 상황: ${situation}, 메시지: "${cachedResponse.text}", 타입: ${cachedResponse.type}`);
                return cachedResponse;
            }
        }
        
        try {
            // LLM API 호출
            const prompt = this.promptManager.getPrompt(situation, isAI);
            const promptKey = isAI ? `ai_${situation}` : situation;
            const response = await this.apiClient.callAPI(prompt, promptKey);
            
            // 텍스트 정리 및 검증
            const finalText = this.messageValidator.smartTruncate(response, 15);
            
            // 중복 검사 및 처리
            if (!this.messageValidator.checkAndAddRecentMessage(finalText, isAI)) {
                console.log(`🔁 [LLM 중복 감지] 플레이어 뱀 - 메시지: "${finalText}" -> 폴백으로 대체`);
                return this.getFallbackTextWithType(situation, isAI);
            }
            
            // 캐시에 저장
            const responseWithType = { text: finalText, type: 'llm' };
            this.cacheManager.set(situation, isAI, responseWithType);
            
            const snakeType = isAI ? 'AI' : '플레이어';
            console.log(`✅ [LLM 응답 완료] ${snakeType} 뱀 - 상황: ${situation}, 메시지: "${finalText}"`);
            
            return responseWithType;
            
        } catch (error) {
            console.warn('LLM API 호출 실패:', error);
            return this.getFallbackTextWithType(situation, isAI);
        }
    }

    // 폴백 텍스트 가져오기 (타입 정보 포함)
    getFallbackTextWithType(situation, isAI = false) {
        const text = this.getFallbackText(situation, isAI);
        return { text: text, type: 'fallback' };
    }

    // 폴백 텍스트 가져오기 (중복 방지 로직 포함)
    getFallbackText(situation, isAI = false) {
        const snakeType = isAI ? 'AI' : '플레이어';
        const allTexts = this.promptManager.getFallbackTexts(situation, isAI);
        
        // 사용 가능한 텍스트 필터링
        const availableTexts = this.messageValidator.filterAvailableFallbacks(allTexts, situation, isAI);
        
        // 사용 가능한 메시지가 없으면 전체에서 선택 (리셋)
        const selectedTexts = availableTexts.length > 0 ? availableTexts : allTexts;
        let selectedText = selectedTexts[Math.floor(Math.random() * selectedTexts.length)];
        
        // 전역 중복 방지를 위해 재시도 (최대 10번)
        const globalRecentMessages = this.messageValidator.getRecentMessages(isAI);
        let retryCount = 0;
        while (globalRecentMessages.includes(selectedText) && retryCount < 10) {
            selectedText = selectedTexts[Math.floor(Math.random() * selectedTexts.length)];
            retryCount++;
        }
        
        // 재시도로도 중복이면 메시지 변형
        if (globalRecentMessages.includes(selectedText)) {
            selectedText = this.messageValidator.createUniqueMessage(selectedText, retryCount);
        }
        
        // 메시지 기록 업데이트
        this.messageValidator.addRecentFallback(selectedText, situation, isAI);
        this.messageValidator.checkAndAddRecentMessage(selectedText, isAI);
        
        console.log(`🔄 [폴백 메시지] ${snakeType} 뱀 - 상황: ${situation}, 메시지: "${selectedText}" (중복방지: ${availableTexts.length}/${allTexts.length} 가능, 재시도: ${retryCount}번)`);
        return selectedText;
    }

    // 상황 분석 (기존 Chatter.analyzeSituation와 호환)
    analyzeSituation(snake, foods, otherSnake = null) {
        return this.situationAnalyzer.analyzeSituation(snake, foods, otherSnake);
    }

    // API 키 설정 (기존 Chatter.setApiKey와 호환)
    setApiKey(key) {
        this.apiClient.setApiKey(key);
    }

    // API 키 유효성 검사 (기존 Chatter.isApiKeyValid와 호환)
    isApiKeyValid() {
        return this.apiClient.isApiKeyValid();
    }

    // 캐시 정리 (기존 Chatter.clearCache와 호환)
    clearCache() {
        this.cacheManager.clear();
    }

    // 메시지 기록 초기화
    clearMessageHistory() {
        this.messageValidator.clearHistory();
    }

    // 시스템 상태 정보 반환
    getSystemStatus() {
        return {
            api: this.apiClient.getStatus(),
            cache: this.cacheManager.getStats(),
            validator: this.messageValidator.getStats(),
            prompts: this.promptManager.getStats(),
            analyzer: this.situationAnalyzer.getConfig()
        };
    }

    // 설정 내보내기
    exportSettings() {
        return {
            prompts: this.promptManager.exportConfig(),
            analyzer: this.situationAnalyzer.getConfig(),
            timestamp: new Date().toISOString()
        };
    }

    // 설정 가져오기
    importSettings(settings) {
        if (settings.prompts) {
            this.promptManager.importConfig(settings.prompts);
        }
        if (settings.analyzer) {
            this.situationAnalyzer.setConfig(settings.analyzer);
        }
        console.log('⚙️ [설정 가져오기] ChatterCore 설정이 업데이트됨');
    }

    // 시스템 재시작
    restart() {
        this.clearCache();
        this.clearMessageHistory();
        this.apiClient.resetErrorCount();
        console.log('🔄 [시스템 재시작] ChatterCore가 재시작됨');
    }

    // 디버그 모드용 상세 로깅
    enableDebugMode() {
        this.debugMode = true;
        console.log('🔍 [디버그 모드] 활성화됨');
    }

    disableDebugMode() {
        this.debugMode = false;
        console.log('🔍 [디버그 모드] 비활성화됨');
    }

    // 성능 통계
    getPerformanceStats() {
        const cacheStats = this.cacheManager.getStats();
        const validatorStats = this.messageValidator.getStats();
        const apiStatus = this.apiClient.getStatus();
        
        return {
            cacheHitRate: cacheStats.usage,
            messageValidationStats: validatorStats,
            apiAvailability: apiStatus.isAvailable,
            errorCount: apiStatus.errorCount,
            timestamp: Date.now()
        };
    }
}