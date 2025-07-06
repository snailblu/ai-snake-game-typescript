import type { SnakeBase } from './types.js';

// 게임 상황 분석 전담 클래스
export class SituationAnalyzer {
    private priorityLevels: { [key: string]: string[] };
    private intervalsByPriority: { [key: string]: number };
    private thresholds: { [key: string]: number };

    constructor() {
        // 상황 우선순위 정의
        this.priorityLevels = {
            high: ['eating', 'danger'],
            medium: ['competitive', 'hunting'],
            low: ['idle']
        };
        
        // 우선순위별 요구 간격 (ms)
        this.intervalsByPriority = {
            high: 1000,    // 1초
            medium: 3000,  // 3초
            low: 6000      // 6초
        };
        
        // 거리 임계값 설정
        this.thresholds = {
            dangerWallDistance: 2,
            competitiveDistance: 5,
            huntingDistance: 5,
            nearBodyDistance: 1,
            competitorNearFood: 3
        };
    }

    // 상황 분석 (게임 상태를 바탕으로 상황 판단)
    analyzeSituation(snake: SnakeBase, foods: any[], otherSnake: SnakeBase | null = null): string {
        const head = snake.body[0];
        
        // 음식까지의 거리 계산
        let nearestFoodDistance = Infinity;
        let nearestFood = null;
        
        if (foods && foods.length > 0) {
            foods.forEach(food => {
                const distance = this.calculateManhattanDistance(head, food);
                if (distance < nearestFoodDistance) {
                    nearestFoodDistance = distance;
                    nearestFood = food;
                }
            });
        }
        
        // 다른 뱀과의 거리 (경쟁 상황 감지)
        let competitorDistance = Infinity;
        if (otherSnake && otherSnake.isAlive) {
            const otherHead = otherSnake.body[0];
            competitorDistance = this.calculateManhattanDistance(head, otherHead);
        }
        
        // 벽까지의 거리 (위험 상황 감지)
        const wallDistance = this.calculateWallDistance(head);
        
        // 상황 우선순위 판단
        if (wallDistance <= this.thresholds.dangerWallDistance || this.isNearOwnBody(snake)) {
            return 'danger';
        }
        
        if (nearestFoodDistance <= this.thresholds.competitorNearFood && 
            competitorDistance <= this.thresholds.competitiveDistance) {
            return 'competitive';
        }
        
        if (nearestFoodDistance <= this.thresholds.huntingDistance) {
            return 'hunting';
        }
        
        return 'idle';
    }

    // 맨하탄 거리 계산
    calculateManhattanDistance(pos1: { x: number; y: number }, pos2: { x: number; y: number }): number {
        return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
    }

    // 벽까지의 최단 거리 계산
    calculateWallDistance(head: { x: number; y: number }, gridWidth: number = 20, gridHeight: number = 20): number {
        return Math.min(
            head.x,                    // 왼쪽 벽
            head.y,                    // 위쪽 벽
            gridWidth - 1 - head.x,    // 오른쪽 벽
            gridHeight - 1 - head.y    // 아래쪽 벽
        );
    }

    // 자신의 몸체와 가까운지 확인
    isNearOwnBody(snake: SnakeBase): boolean {
        const head = snake.body[0];
        return snake.body.slice(1).some(segment => {
            const distance = this.calculateManhattanDistance(head, segment);
            return distance <= this.thresholds.nearBodyDistance;
        });
    }

    // 상황별 우선순위 결정
    getSituationPriority(situation: string): string {
        for (const [priority, situations] of Object.entries(this.priorityLevels)) {
            if (situations.includes(situation)) {
                return priority;
            }
        }
        return 'low';
    }

    // 우선순위별 요구 간격 반환
    getRequiredInterval(priority: string): number {
        return this.intervalsByPriority[priority] || this.intervalsByPriority.low;
    }

    // 상황별 요구 간격 계산
    getRequiredIntervalBySituation(situation: string): number {
        const priority = this.getSituationPriority(situation);
        return this.getRequiredInterval(priority);
    }

    // 뱀 주변의 위험도 분석
    analyzeDangerLevel(snake: SnakeBase, otherSnake: SnakeBase | null = null, gridWidth: number = 20, gridHeight: number = 20): number {
        const head = snake.body[0];
        let dangerLevel = 0;
        
        // 벽과의 거리
        const wallDistance = this.calculateWallDistance(head, gridWidth, gridHeight);
        if (wallDistance <= 1) dangerLevel += 3;
        else if (wallDistance <= 2) dangerLevel += 2;
        else if (wallDistance <= 3) dangerLevel += 1;
        
        // 자신의 몸체와의 거리
        if (this.isNearOwnBody(snake)) {
            dangerLevel += 3;
        }
        
        // 다른 뱀과의 거리
        if (otherSnake && otherSnake.isAlive) {
            const distance = this.calculateManhattanDistance(head, otherSnake.body[0]);
            if (distance <= 1) dangerLevel += 2;
            else if (distance <= 2) dangerLevel += 1;
        }
        
        return Math.min(dangerLevel, 5); // 최대 위험도 5
    }

    // 음식에 대한 경쟁 강도 분석
    analyzeCompetitionLevel(snake: SnakeBase, foods: any[], otherSnake: SnakeBase | null): number {
        if (!otherSnake || !otherSnake.isAlive || !foods || foods.length === 0) {
            return 0;
        }
        
        const snakeHead = snake.body[0];
        const aiHead = otherSnake.body[0];
        let maxCompetition = 0;
        
        foods.forEach(food => {
            const snakeDistance = this.calculateManhattanDistance(snakeHead, food);
            const aiDistance = this.calculateManhattanDistance(aiHead, food);
            
            // 두 뱀이 모두 음식에 가까울 때 경쟁 강도 증가
            if (snakeDistance <= 5 && aiDistance <= 5) {
                const competition = Math.max(0, 5 - Math.abs(snakeDistance - aiDistance));
                maxCompetition = Math.max(maxCompetition, competition);
            }
        });
        
        return maxCompetition;
    }

    // 종합적인 상황 분석 (상세 정보 포함)
    analyzeDetailedSituation(snake: SnakeBase, foods: any[], otherSnake: SnakeBase | null = null): any {
        const basicSituation = this.analyzeSituation(snake, foods, otherSnake);
        const dangerLevel = this.analyzeDangerLevel(snake, otherSnake);
        const competitionLevel = this.analyzeCompetitionLevel(snake, foods, otherSnake);
        const priority = this.getSituationPriority(basicSituation);
        const requiredInterval = this.getRequiredInterval(priority);
        
        return {
            situation: basicSituation,
            priority: priority,
            dangerLevel: dangerLevel,
            competitionLevel: competitionLevel,
            requiredInterval: requiredInterval,
            analysis: {
                wallDistance: this.calculateWallDistance(snake.body[0]),
                nearOwnBody: this.isNearOwnBody(snake),
                nearestFoodDistance: this.getNearestFoodDistance(snake.body[0], foods),
                competitorDistance: otherSnake && otherSnake.isAlive ? 
                    this.calculateManhattanDistance(snake.body[0], otherSnake.body[0]) : Infinity
            }
        };
    }

    // 가장 가까운 음식까지의 거리
    getNearestFoodDistance(head: { x: number; y: number }, foods: any[]): number {
        if (!foods || foods.length === 0) return Infinity;
        
        let minDistance = Infinity;
        foods.forEach(food => {
            const distance = this.calculateManhattanDistance(head, food);
            minDistance = Math.min(minDistance, distance);
        });
        
        return minDistance;
    }

    // 임계값 설정 업데이트
    updateThresholds(newThresholds: { [key: string]: number }): void {
        this.thresholds = { ...this.thresholds, ...newThresholds };
        console.log('🎯 [임계값 업데이트]', this.thresholds);
    }

    // 우선순위별 간격 설정 업데이트
    updateIntervals(newIntervals: { [key: string]: number }): void {
        this.intervalsByPriority = { ...this.intervalsByPriority, ...newIntervals };
        console.log('⏱️ [간격 설정 업데이트]', this.intervalsByPriority);
    }

    // 현재 설정 반환
    getConfig(): {
        thresholds: { [key: string]: number };
        intervalsByPriority: { [key: string]: number };
        priorityLevels: { [key: string]: string[] };
    } {
        return {
            thresholds: { ...this.thresholds },
            intervalsByPriority: { ...this.intervalsByPriority },
            priorityLevels: { ...this.priorityLevels }
        };
    }

    // 설정 가져오기
    setConfig(config: any): void {
        if (config.thresholds) {
            this.thresholds = { ...config.thresholds };
        }
        if (config.intervalsByPriority) {
            this.intervalsByPriority = { ...config.intervalsByPriority };
        }
        if (config.priorityLevels) {
            this.priorityLevels = { ...config.priorityLevels };
        }
        console.log('⚙️ [설정 가져오기] 상황 분석 설정이 업데이트됨');
    }
}