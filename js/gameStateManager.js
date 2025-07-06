import { GAME_CONSTANTS } from './gameConstants.js';

// 게임 상태 관리 클래스
export class GameStateManager {
    constructor() {
        this.score = 0;
        this.highScore = localStorage.getItem(GAME_CONSTANTS.STORAGE_KEYS.HIGH_SCORE) || 0;
        this.gameRunning = false;
        this.gameLoop = null;
        this.renderLoop = null;
        this.lastTime = 0;
        
        this.updateScore();
        this.updateHighScore();
    }

    // 게임 시작
    start(updateCallback) {
        this.gameRunning = true;
        this.gameLoop = setInterval(() => {
            updateCallback();
        }, GAME_CONSTANTS.GAME_UPDATE_INTERVAL);
    }

    // 게임 일시정지
    pause() {
        this.gameRunning = false;
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
    }

    // 게임 토글
    toggleGame(updateCallback) {
        if (this.gameRunning) {
            this.pause();
        } else {
            this.start(updateCallback);
        }
    }

    // 렌더링 루프 시작
    startRenderLoop(renderCallback) {
        const render = (currentTime) => {
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
    stopRenderLoop() {
        if (this.renderLoop) {
            cancelAnimationFrame(this.renderLoop);
            this.renderLoop = null;
        }
    }

    // 점수 추가
    addScore(points = GAME_CONSTANTS.SCORE_PER_FOOD) {
        this.score += points;
        this.updateScore();
    }

    // 점수 업데이트
    updateScore() {
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            scoreElement.textContent = this.score;
        }
    }

    // 최고 점수 업데이트
    updateHighScore() {
        const highScoreElement = document.getElementById('highScore');
        if (highScoreElement) {
            highScoreElement.textContent = this.highScore;
        }
    }

    // 게임 오버 처리
    gameOver() {
        this.pause();
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem(GAME_CONSTANTS.STORAGE_KEYS.HIGH_SCORE, this.highScore);
            this.updateHighScore();
        }
        
        const finalScoreElement = document.getElementById('finalScore');
        const gameOverElement = document.getElementById('gameOver');
        
        if (finalScoreElement) {
            finalScoreElement.textContent = this.score;
        }
        if (gameOverElement) {
            gameOverElement.style.display = 'block';
        }
    }

    // 게임 재시작
    restart() {
        const gameOverElement = document.getElementById('gameOver');
        if (gameOverElement) {
            gameOverElement.style.display = 'none';
        }
        
        this.score = 0;
        this.updateScore();
        this.gameRunning = false;
    }

    // 게임 실행 상태 확인
    isRunning() {
        return this.gameRunning;
    }

    // 현재 점수 반환
    getScore() {
        return this.score;
    }

    // 최고 점수 반환
    getHighScore() {
        return this.highScore;
    }
}