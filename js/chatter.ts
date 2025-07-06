import { ChatterCore } from './chatterCore.js';
import { GameSituation, ChatterResponse, FoodType } from './types.js';
import { Snake } from './snake.js';

// 기존 코드와의 호환성을 위한 래퍼 클래스
export class Chatter {
    private core: ChatterCore;

    constructor() {
        // 새로운 리팩토링된 시스템 사용
        this.core = new ChatterCore();
        
        console.log('🔄 [Chatter 시스템] 리팩토링된 ChatterCore로 업그레이드됨');
    }

    // 기존 API와의 호환성을 위한 위임 메서드들
    
    // API 키 관련 메서드들
    setApiKey(key: string | null): void {
        return this.core.setApiKey(key);
    }

    isApiKeyValid(): boolean {
        return this.core.isApiKeyValid();
    }

    // API 키 테스트 메서드 (ApiKeyManager를 통해 처리)
    async testApiKey(key: string): Promise<{ message: string }> {
        // 실제 테스트는 ApiKeyManager에서 처리하므로 간단한 유효성만 검사
        if (!key || !key.startsWith('sk-')) {
            return { message: '유효하지 않은 API 키 형식입니다.' };
        }
        return { message: 'API 키 형식이 올바릅니다.' };
    }

    // 메인 혼잣말 생성 함수
    async generateChatter(situation: GameSituation, isAI: boolean = false): Promise<ChatterResponse> {
        const result = await this.core.generateChatter(situation, isAI);
        return {
            text: result.text,
            type: result.type as 'llm' | 'fallback'
        };
    }

    // 상황 분석
    analyzeSituation(snake: Snake, foods: FoodType[], otherSnake?: Snake | null): GameSituation {
        const result = this.core.analyzeSituation(snake, foods, otherSnake);
        return result as GameSituation;
    }

    // 캐시 정리
    clearCache(): void {
        return this.core.clearCache();
    }

    // 시스템 상태 정보 (디버깅용)
    getSystemStatus(): any {
        return this.core.getSystemStatus();
    }

    // 성능 통계 (디버깅용)
    getPerformanceStats(): any {
        return this.core.getPerformanceStats();
    }
}