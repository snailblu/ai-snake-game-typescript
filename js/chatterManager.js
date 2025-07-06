import { GAME_CONSTANTS } from './gameConstants.js';

// 혼잣말 통합 관리 클래스
export class ChatterManager {
    constructor(chatter, speechBubbles, gridSize) {
        this.chatter = chatter;
        this.speechBubbles = speechBubbles;
        this.gridSize = gridSize;
        this.chatterProbability = GAME_CONSTANTS.CHATTER_PROBABILITY;
    }

    // 혼잣말 확률 설정
    setChatterProbability(probability) {
        this.chatterProbability = probability;
    }

    // 플레이어 뱀 혼잣말 체크 및 생성
    async checkPlayerChatter(currentTime, playerSnake, foods, aiSnake) {
        const chatterCheck = playerSnake.shouldChatter(
            currentTime, 
            foods, 
            aiSnake, 
            this.chatter,
            this.chatterProbability
        );
        
        if (chatterCheck.should) {
            await this.generateChatter(playerSnake, chatterCheck.situation, false);
        }
    }

    // AI 뱀 혼잣말 체크 및 생성
    async checkAIChatter(currentTime, aiSnake, foods, playerSnake) {
        if (!aiSnake.isAlive) return;
        
        // AI 뱀에 shouldChatter 메서드가 있는지 확인
        const chatterCheck = aiSnake.shouldChatter ? 
            aiSnake.shouldChatter(
                currentTime, 
                foods, 
                playerSnake, 
                this.chatter,
                this.chatterProbability
            ) : playerSnake.shouldChatter(
                currentTime, 
                foods, 
                playerSnake, 
                this.chatter,
                this.chatterProbability
            );
        
        if (chatterCheck.should) {
            await this.generateChatter(aiSnake, chatterCheck.situation, true);
        }
    }

    // 혼잣말 생성 및 말풍선 표시
    async generateChatter(snake, situation, isAI) {
        try {
            const response = await this.chatter.generateChatter(situation, isAI);
            const head = snake.body[0];
            const bubbleX = head.renderX * this.gridSize + this.gridSize / 2;
            const bubbleY = head.renderY * this.gridSize;
            
            this.speechBubbles.addBubble(bubbleX, bubbleY, response.text, isAI, response.type);
        } catch (error) {
            const snakeType = isAI ? 'AI' : '플레이어';
            console.warn(`${snakeType} 뱀 혼잣말 생성 실패:`, error);
        }
    }

    // 전체 혼잣말 체크 (플레이어 + AI)
    async checkAllChatter(currentTime, playerSnake, aiSnake, foods) {
        // 플레이어 뱀 혼잣말 체크
        await this.checkPlayerChatter(currentTime, playerSnake, foods, aiSnake);
        
        // AI 뱀 혼잣말 체크
        await this.checkAIChatter(currentTime, aiSnake, foods, playerSnake);
    }
}