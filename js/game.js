import { Snake } from './snake.js';
import { AISnake } from './aiSnake.js';
import { FoodManager } from './food.js';
import { ParticleSystem } from './particles.js';

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 20;
        
        this.snake = new Snake(this.gridSize);
        this.aiSnake = new AISnake(this.gridSize);
        this.foodManager = new FoodManager(this.gridSize, 2);
        this.particles = new ParticleSystem();
        
        this.score = 0;
        this.highScore = localStorage.getItem('snakeHighScore') || 0;
        this.gameRunning = false;
        this.gameLoop = null;
        this.renderLoop = null;
        this.lastTime = 0;
        
        this.updateScore();
        this.updateHighScore();
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
            
            if (!this.gameRunning) return;
            
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
        if (this.gameRunning) {
            this.pause();
        } else {
            this.start();
        }
    }

    start() {
        this.gameRunning = true;
        this.gameLoop = setInterval(() => {
            this.update();
        }, 150);
    }

    pause() {
        this.gameRunning = false;
        clearInterval(this.gameLoop);
    }

    startRenderLoop() {
        const render = (currentTime) => {
            const deltaTime = currentTime - this.lastTime;
            this.lastTime = currentTime;
            
            // 60fps 기준으로 애니메이션 진행도 계산 (150ms = 9프레임)
            const animationSpeed = deltaTime / 150; // 150ms 동안 0에서 1로
            
            this.particles.update();
            this.snake.updateAnimation(animationSpeed);
            this.aiSnake.updateAnimation(animationSpeed);
            
            // AI 뱀 업데이트 (게임이 실행 중일 때만)
            if (this.gameRunning) {
                this.aiSnake.updateAI(currentTime, this.foodManager.foods, this.snake, this.canvas.width, this.canvas.height);
            }
            
            this.draw();
            this.renderLoop = requestAnimationFrame(render);
        };
        this.lastTime = performance.now();
        render(this.lastTime);
    }

    stopRenderLoop() {
        if (this.renderLoop) {
            cancelAnimationFrame(this.renderLoop);
            this.renderLoop = null;
        }
    }

    update() {
        this.snake.move();
        
        // 플레이어 뱀 충돌 검사
        if (this.snake.checkWallCollision(this.canvas.width, this.canvas.height) || 
            this.snake.checkSelfCollision() || this.checkSnakeCollision(this.snake, this.aiSnake)) {
            this.gameOver();
            return;
        }
        
        // AI 뱀 충돌 검사
        if (this.aiSnake.isAlive && (
            this.aiSnake.checkWallCollision(this.canvas.width, this.canvas.height) || 
            this.aiSnake.checkSelfCollision() || this.checkSnakeCollision(this.aiSnake, this.snake))) {
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
            this.handleFoodEaten(playerEatenFood, true);
        }
        
        // AI 뱀 음식 충돌
        if (this.aiSnake.isAlive) {
            const aiEatenFood = this.foodManager.checkCollision(this.aiSnake);
            if (aiEatenFood) {
                this.handleFoodEaten(aiEatenFood, false);
            }
        }
    }

    // 뱀들 간의 충돌 검사
    checkSnakeCollision(snake1, snake2) {
        if (!snake2.isAlive) return false;
        
        const head = snake1.body[0];
        return snake2.body.some(segment => 
            segment.x === head.x && segment.y === head.y
        );
    }

    // 음식 섭취 처리
    handleFoodEaten(eatenFood, isPlayer) {
        // 파티클 효과 생성
        this.particles.createFoodParticles(eatenFood.x, eatenFood.y, this.gridSize);
        
        if (isPlayer) {
            this.particles.createScoreParticles(
                eatenFood.x * this.gridSize + this.gridSize / 2,
                eatenFood.y * this.gridSize,
                10
            );
            this.snake.grow();
            this.score += 10;
            this.updateScore();
        } else {
            this.aiSnake.grow();
        }
        
        // 먹은 과일 제거하고 새 과일 추가
        this.foodManager.removeFood(eatenFood);
        this.foodManager.addNewFood(this.canvas.width, this.canvas.height, this.snake.body);
    }

    draw() {
        // 배경 그라데이션
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#0a0a0a');
        gradient.addColorStop(1, '#1a1a1a');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 격자 패턴 그리기
        this.drawGrid();
        
        this.snake.draw(this.ctx);
        this.aiSnake.draw(this.ctx);
        this.foodManager.draw(this.ctx);
        this.particles.draw(this.ctx);
    }

    drawGrid() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
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

    updateScore() {
        document.getElementById('score').textContent = this.score;
    }

    updateHighScore() {
        document.getElementById('highScore').textContent = this.highScore;
    }

    gameOver() {
        this.pause();
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snakeHighScore', this.highScore);
            this.updateHighScore();
        }
        
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOver').style.display = 'block';
    }

    restart() {
        document.getElementById('gameOver').style.display = 'none';
        this.score = 0;
        this.updateScore();
        this.snake.reset();
        this.aiSnake.reset();
        this.foodManager.initialize(this.canvas.width, this.canvas.height, this.snake.body);
        this.draw();
        this.gameRunning = false;
    }
}

const game = new Game();
window.game = game;