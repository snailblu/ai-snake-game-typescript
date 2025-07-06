import { CollisionResult, CollisionType } from './types.ts';
import { Snake } from './snake.ts';
import { AISnake } from './aiSnake.ts';

// 충돌 검사 전담 클래스
export class CollisionDetector {
    constructor() {
        // 충돌 검사 관련 로직만 담당
    }

    // 뱀들 간의 충돌 검사
    checkSnakeCollision(snake1: Snake, snake2: Snake | AISnake): boolean {
        if (snake2 instanceof AISnake && !snake2.isAlive) return false;
        
        const head = snake1.body[0];
        return snake2.body.some(segment => 
            segment.x === head.x && segment.y === head.y
        );
    }

    // 플레이어 뱀의 모든 충돌 검사
    checkPlayerCollisions(playerSnake: Snake, aiSnake: AISnake, canvasWidth: number, canvasHeight: number): CollisionResult {
        return {
            wall: playerSnake.checkWallCollision(canvasWidth, canvasHeight),
            self: playerSnake.checkSelfCollision(),
            enemy: this.checkSnakeCollision(playerSnake, aiSnake)
        };
    }

    // AI 뱀의 모든 충돌 검사
    checkAICollisions(aiSnake: AISnake, playerSnake: Snake, canvasWidth: number, canvasHeight: number): CollisionResult | null {
        if (!aiSnake.isAlive) return null;
        
        return {
            wall: aiSnake.checkWallCollision(canvasWidth, canvasHeight),
            self: aiSnake.checkSelfCollision(),
            enemy: this.checkSnakeCollision(aiSnake, playerSnake)
        };
    }

    // 전체 충돌 검사 결과 확인
    hasAnyCollision(collisions: CollisionResult | null): boolean {
        if (!collisions) return false;
        return collisions.wall || collisions.self || collisions.enemy;
    }

    // 충돌 유형 반환
    getCollisionType(collisions: CollisionResult | null): CollisionType | null {
        if (!collisions) return null;
        
        if (collisions.wall) return 'wall';
        if (collisions.self) return 'self';
        if (collisions.enemy) return 'enemy';
        return null;
    }
}