// 캐싱 로직 전담 클래스
export class CacheManager {
    private cache: Map<string, any>;
    private maxCacheSize: number;

    constructor(maxCacheSize: number = 50) {
        this.cache = new Map();
        this.maxCacheSize = maxCacheSize;
    }

    // 캐시 키 생성
    generateCacheKey(situation: string, isAI: boolean, contextHash: number): string {
        const promptKey = isAI ? `ai_${situation}` : situation;
        const cacheTimeWindow = this.getCacheTimeWindow(situation);
        const currentTime = Date.now();
        const timeSlot = Math.floor(currentTime / cacheTimeWindow);
        
        return `${promptKey}_${timeSlot}_${contextHash}`;
    }

    // 컨텍스트 해시 생성
    generateContextHash(situation: string, isAI: boolean): number {
        const currentTime = Date.now();
        const randomSeed = Math.floor(currentTime / 15000); // 15초마다 변경
        const situationWeight = situation.length * 7;
        const aiWeight = isAI ? 13 : 17;
        const hash = (randomSeed + situationWeight + aiWeight) % 8; // 0-7 범위
        return hash;
    }

    // 상황별 캐시 시간 윈도우 계산
    private getCacheTimeWindow(situation: string): number {
        const highPriority = ['eating', 'danger'];
        const mediumPriority = ['competitive', 'hunting'];
        
        if (highPriority.includes(situation)) {
            return 60000; // 1분 - 빠른 변화
        } else if (mediumPriority.includes(situation)) {
            return 120000; // 2분 - 중간 변화
        } else {
            return 300000; // 5분 - 느린 변화
        }
    }

    // 캐시에서 데이터 가져오기
    get(situation: string, isAI: boolean): any {
        const contextHash = this.generateContextHash(situation, isAI);
        const cacheKey = this.generateCacheKey(situation, isAI, contextHash);
        
        return this.cache.get(cacheKey);
    }

    // 캐시에 데이터 저장
    set(situation: string, isAI: boolean, value: any): string {
        const contextHash = this.generateContextHash(situation, isAI);
        const cacheKey = this.generateCacheKey(situation, isAI, contextHash);
        
        this.cache.set(cacheKey, value);
        
        // 캐시 크기 제한 (메모리 관리)
        this.manageCacheSize();
        
        return cacheKey;
    }

    // 특정 캐시 키 삭제
    delete(cacheKey: string): boolean {
        return this.cache.delete(cacheKey);
    }

    // 캐시에 키가 존재하는지 확인
    has(situation: string, isAI: boolean): boolean {
        const contextHash = this.generateContextHash(situation, isAI);
        const cacheKey = this.generateCacheKey(situation, isAI, contextHash);
        
        return this.cache.has(cacheKey);
    }

    // 캐시 크기 관리
    private manageCacheSize(): void {
        while (this.cache.size > this.maxCacheSize) {
            // 가장 오래된 항목 제거 (FIFO)
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
    }

    // 만료된 캐시 정리
    cleanExpiredCache(): void {
        const currentTime = Date.now();
        const keysToDelete: string[] = [];
        
        for (const [key, value] of this.cache.entries()) {
            // 캐시 키에서 시간 정보 추출
            const keyParts = key.split('_');
            if (keyParts.length >= 2) {
                const timeSlot = parseInt(keyParts[1]);
                const situation = keyParts[0].replace('ai_', '');
                const cacheTimeWindow = this.getCacheTimeWindow(situation);
                const expiryTime = timeSlot * cacheTimeWindow + cacheTimeWindow;
                
                if (currentTime > expiryTime) {
                    keysToDelete.push(key);
                }
            }
        }
        
        // 만료된 키들 삭제
        keysToDelete.forEach(key => this.cache.delete(key));
        
        if (keysToDelete.length > 0) {
            console.log(`🧹 [캐시 정리] ${keysToDelete.length}개 만료된 항목 삭제`);
        }
    }

    // 전체 캐시 초기화
    clear(): void {
        this.cache.clear();
        console.log('🗑️ [캐시 전체 삭제] 모든 캐시 항목이 제거됨');
    }

    // 캐시 상태 정보
    getStats(): {
        size: number;
        maxSize: number;
        keys: string[];
        usage: number;
    } {
        return {
            size: this.cache.size,
            maxSize: this.maxCacheSize,
            keys: Array.from(this.cache.keys()),
            usage: Math.round((this.cache.size / this.maxCacheSize) * 100)
        };
    }

    // 특정 상황의 캐시 항목 개수
    countBySituation(situation: string): number {
        let count = 0;
        for (const key of this.cache.keys()) {
            if (key.includes(situation)) {
                count++;
            }
        }
        return count;
    }

    // 정기적인 캐시 정리를 위한 타이머 설정
    startPeriodicCleanup(intervalMs: number = 300000): void { // 5분마다
        setInterval(() => {
            this.cleanExpiredCache();
        }, intervalMs);
    }
}