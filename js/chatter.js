import { ChatterCore } from './chatterCore.js';

// 기존 코드와의 호환성을 위한 래퍼 클래스
export class Chatter {
    constructor() {
        // 새로운 리팩토링된 시스템 사용
        this.core = new ChatterCore();
        
        console.log('🔄 [Chatter 시스템] 리팩토링된 ChatterCore로 업그레이드됨');
    }

    // 기존 API와의 호환성을 위한 위임 메서드들
    
    // API 키 관련 메서드들
    setApiKey(key) {
        return this.core.setApiKey(key);
    }

    isApiKeyValid() {
        return this.core.isApiKeyValid();
    }

    // 메인 혼잣말 생성 함수
    async generateChatter(situation, isAI = false) {
        return await this.core.generateChatter(situation, isAI);
    }

    // 상황 분석
    analyzeSituation(snake, foods, otherSnake = null) {
        return this.core.analyzeSituation(snake, foods, otherSnake);
    }

    // 캐시 정리
    clearCache() {
        return this.core.clearCache();
    }

    // 시스템 상태 정보 (디버깅용)
    getSystemStatus() {
        return this.core.getSystemStatus();
    }

    // 성능 통계 (디버깅용)
    getPerformanceStats() {
        return this.core.getPerformanceStats();
    }
}