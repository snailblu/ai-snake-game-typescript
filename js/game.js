import { Snake } from './snake.js';
import { AISnake } from './aiSnake.js';
import { FoodManager } from './food.js';
import { ParticleSystem } from './particles.js';
import { Chatter } from './chatter.js';
import { SpeechBubbleManager } from './speechBubble.js';
import { ApiKeyManager } from './apiKeyManager.js';
import { GAME_CONSTANTS } from './gameConstants.js';
import { GameStateManager } from './gameStateManager.js';
import { CollisionDetector } from './collisionDetector.js';
import { ChatterManager } from './chatterManager.js';

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = GAME_CONSTANTS.GRID_SIZE;
        
        // 게임 객체 초기화
        this.snake = new Snake(this.gridSize);
        this.aiSnake = new AISnake(this.gridSize);
        this.foodManager = new FoodManager(this.gridSize, GAME_CONSTANTS.FOOD_COUNT);
        this.particles = new ParticleSystem();
        this.chatter = new Chatter();
        this.speechBubbles = new SpeechBubbleManager();
        this.apiKeyManager = new ApiKeyManager(this.chatter);
        
        // 관리자 객체 초기화
        this.stateManager = new GameStateManager();
        this.collisionDetector = new CollisionDetector();
        this.chatterManager = new ChatterManager(this.chatter, this.speechBubbles, this.gridSize);
        
        this.setupEventListeners();
        this.foodManager.initialize(this.canvas.width, this.canvas.height, this.snake.body);
        this.startRenderLoop();
        this.draw();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.toggleGame();
                return;
            }
            
            if (!this.stateManager.isRunning()) return;
            
            switch(e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    this.snake.changeDirection({ x: 0, y: -1 });
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.snake.changeDirection({ x: 0, y: 1 });
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.snake.changeDirection({ x: -1, y: 0 });
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.snake.changeDirection({ x: 1, y: 0 });
                    break;
            }
        });
    }


    toggleGame() {
        this.stateManager.toggleGame(() => this.update());
    }

    start() {
        this.stateManager.start(() => this.update());
    }

    pause() {
        this.stateManager.pause();
    }

    startRenderLoop() {
        this.stateManager.startRenderLoop((currentTime, deltaTime, animationSpeed) => {
            this.particles.update();
            this.snake.updateAnimation(animationSpeed);
            this.aiSnake.updateAnimation(animationSpeed);
            this.speechBubbles.update(deltaTime);
            
            // AI 뱀 업데이트 (게임이 실행 중일 때만)
            if (this.stateManager.isRunning()) {
                this.aiSnake.updateAI(currentTime, this.foodManager.foods, this.snake, this.canvas.width, this.canvas.height);
                
                // 혼잣말 체크
                this.chatterManager.checkAllChatter(currentTime, this.snake, this.aiSnake, this.foodManager.foods);
            }
            
            this.draw();
        });
    }

    stopRenderLoop() {
        this.stateManager.stopRenderLoop();
    }

    update() {
        this.snake.move();
        
        // 플레이어 뱀 충돌 검사
        const playerCollisions = this.collisionDetector.checkPlayerCollisions(
            this.snake, this.aiSnake, this.canvas.width, this.canvas.height
        );
        if (this.collisionDetector.hasAnyCollision(playerCollisions)) {
            this.gameOver();
            return;
        }
        
        // AI 뱀 충돌 검사
        const aiCollisions = this.collisionDetector.checkAICollisions(
            this.aiSnake, this.snake, this.canvas.width, this.canvas.height
        );
        if (this.collisionDetector.hasAnyCollision(aiCollisions)) {
            this.aiSnake.die();
            // AI 뱀 사망 파티클 효과
            this.particles.createFoodParticles(
                this.aiSnake.body[0].x, 
                this.aiSnake.body[0].y, 
                this.gridSize
            );
        }
        
        // 플레이어 뱀 음식 충돌
        const playerEatenFood = this.foodManager.checkCollision(this.snake);
        if (playerEatenFood) {
            this.handlePlayerFoodEaten(playerEatenFood);
        }
        
        // AI 뱀 음식 충돌
        if (this.aiSnake.isAlive) {
            const aiEatenFood = this.foodManager.checkCollision(this.aiSnake);
            if (aiEatenFood) {
                this.handleAIFoodEaten(aiEatenFood);
            }
        }
    }


    // 플레이어 뱀 음식 섭취 처리
    handlePlayerFoodEaten(eatenFood) {
        // 파티클 효과 생성
        this.particles.createFoodParticles(eatenFood.x, eatenFood.y, this.gridSize);
        this.particles.createScoreParticles(
            eatenFood.x * this.gridSize + this.gridSize / 2,
            eatenFood.y * this.gridSize,
            GAME_CONSTANTS.SCORE_PER_FOOD
        );
        
        this.snake.grow();
        this.stateManager.addScore();
        
        // 먹은 과일 제거하고 새 과일 추가
        this.foodManager.removeFood(eatenFood);
        this.foodManager.addNewFood(this.canvas.width, this.canvas.height, this.snake.body);
    }

    // AI 뱀 음식 섭취 처리
    handleAIFoodEaten(eatenFood) {
        // 파티클 효과 생성
        this.particles.createFoodParticles(eatenFood.x, eatenFood.y, this.gridSize);
        this.aiSnake.grow();
        
        // 먹은 과일 제거하고 새 과일 추가
        this.foodManager.removeFood(eatenFood);
        this.foodManager.addNewFood(this.canvas.width, this.canvas.height, this.snake.body);
    }


    draw() {
        // 배경 그라데이션
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, GAME_CONSTANTS.COLORS.BACKGROUND.START);
        gradient.addColorStop(1, GAME_CONSTANTS.COLORS.BACKGROUND.END);
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 격자 패턴 그리기
        this.drawGrid();
        
        this.snake.draw(this.ctx);
        this.aiSnake.draw(this.ctx);
        this.foodManager.draw(this.ctx);
        this.particles.draw(this.ctx);
        this.speechBubbles.draw(this.ctx);
    }

    drawGrid() {
        this.ctx.strokeStyle = GAME_CONSTANTS.COLORS.GRID;
        this.ctx.lineWidth = 1;
        
        // 세로 선
        for (let x = 0; x <= this.canvas.width; x += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        // 가로 선
        for (let y = 0; y <= this.canvas.height; y += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }


    gameOver() {
        this.stateManager.gameOver();
    }

    restart() {
        this.stateManager.restart();
        this.snake.reset();
        this.aiSnake.reset();
        this.foodManager.initialize(this.canvas.width, this.canvas.height, this.snake.body);
        this.draw();
    }
}

const game = new Game();
window.game = game;