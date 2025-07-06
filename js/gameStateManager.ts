import { GAME_CONSTANTS } from './gameConstants.ts';

// 게임 상태 관리 클래스
export class GameStateManager {
    public score: number;
    public highScore: number;
    public gameRunning: boolean;
    public gameLoop: NodeJS.Timeout | null;
    public renderLoop: number | null;
    public lastTime: number;

    constructor() {
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem(GAME_CONSTANTS.STORAGE_KEYS.HIGH_SCORE) || '0');
        this.gameRunning = false;
        this.gameLoop = null;
        this.renderLoop = null;
        this.lastTime = 0;
        
        this.updateScore();
        this.updateHighScore();
    }

    // 게임 시작
    start(updateCallback: () => void): void {
        this.gameRunning = true;
        this.gameLoop = setInterval(() => {
            updateCallback();
        }, GAME_CONSTANTS.GAME_UPDATE_INTERVAL);
    }

    // 게임 일시정지
    pause(): void {
        this.gameRunning = false;
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
    }

    // 게임 토글
    toggleGame(updateCallback: () => void): void {
        if (this.gameRunning) {
            this.pause();
        } else {
            this.start(updateCallback);
        }
    }

    // 렌더링 루프 시작
    startRenderLoop(renderCallback: (currentTime: number, deltaTime: number, animationSpeed: number) => void): void {
        const render = (currentTime: number) => {
            const deltaTime = currentTime - this.lastTime;
            this.lastTime = currentTime;
            
            // 애니메이션 진행도 계산
            const animationSpeed = deltaTime / GAME_CONSTANTS.ANIMATION_SPEED_BASE;
            
            renderCallback(currentTime, deltaTime, animationSpeed);
            
            this.renderLoop = requestAnimationFrame(render);
        };
        
        this.lastTime = performance.now();
        render(this.lastTime);
    }

    // 렌더링 루프 정지
    stopRenderLoop(): void {
        if (this.renderLoop) {
            cancelAnimationFrame(this.renderLoop);
            this.renderLoop = null;
        }
    }

    // 점수 추가
    addScore(points: number = GAME_CONSTANTS.SCORE_PER_FOOD): void {
        this.score += points;
        this.updateScore();
    }

    // 점수 업데이트
    updateScore(): void {
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            scoreElement.textContent = this.score.toString();
        }
    }

    // 최고 점수 업데이트
    updateHighScore(): void {
        const highScoreElement = document.getElementById('highScore');
        if (highScoreElement) {
            highScoreElement.textContent = this.highScore.toString();
        }
    }

    // 게임 오버 처리
    gameOver(): void {
        this.pause();
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem(GAME_CONSTANTS.STORAGE_KEYS.HIGH_SCORE, this.highScore.toString());
            this.updateHighScore();
        }
        
        const finalScoreElement = document.getElementById('finalScore');
        const gameOverElement = document.getElementById('gameOver');
        
        if (finalScoreElement) {
            finalScoreElement.textContent = this.score.toString();
        }
        if (gameOverElement) {
            gameOverElement.style.display = 'block';
        }
    }

    // 게임 재시작
    restart(): void {
        const gameOverElement = document.getElementById('gameOver');
        if (gameOverElement) {
            gameOverElement.style.display = 'none';
        }
        
        this.score = 0;
        this.updateScore();
        this.gameRunning = false;
    }

    // 게임 실행 상태 확인
    isRunning(): boolean {
        return this.gameRunning;
    }

    // 현재 점수 반환
    getScore(): number {
        return this.score;
    }

    // 최고 점수 반환
    getHighScore(): number {
        return this.highScore;
    }
}