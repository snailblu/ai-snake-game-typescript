import { Snake } from './snake.ts';
import { AISnake } from './aiSnake.ts';
import { FoodManager, Food } from './food.ts';
import { ParticleSystem } from './particles.ts';
import { Chatter } from './chatter.ts';
import { SpeechBubbleManager } from './speechBubble.ts';
import { ApiKeyManager } from './apiKeyManager.ts';
import { GAME_CONSTANTS, GAME_SETTINGS } from './gameConstants.ts';
import { GameStateManager } from './gameStateManager.ts';
import { CollisionDetector } from './collisionDetector.ts';
import { ChatterManager } from './chatterManager.ts';
import { GameState } from './types.js';

class Game {
    public canvas: HTMLCanvasElement;
    public ctx: CanvasRenderingContext2D;
    public gridSize: number;
    
    public snake: Snake;
    public aiSnake: AISnake;
    public foodManager: FoodManager;
    public particles: ParticleSystem;
    public chatter: Chatter;
    public speechBubbles: SpeechBubbleManager;
    public apiKeyManager: ApiKeyManager;
    
    public stateManager: GameStateManager;
    public collisionDetector: CollisionDetector;
    public chatterManager: ChatterManager;

    constructor() {
        this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
        this.gridSize = GAME_CONSTANTS.GRID_SIZE;
        
        this.snake = new Snake(this.gridSize);
        this.aiSnake = new AISnake(this.gridSize);
        this.foodManager = new FoodManager(this.gridSize, GAME_CONSTANTS.FOOD_COUNT);
        this.particles = new ParticleSystem();
        this.chatter = new Chatter();
        this.speechBubbles = new SpeechBubbleManager();
        this.apiKeyManager = new ApiKeyManager(this.chatter);
        
        this.stateManager = new GameStateManager();
        this.collisionDetector = new CollisionDetector();
        this.chatterManager = new ChatterManager(this.chatter, this.speechBubbles, this.gridSize);
        
        this.setupEventListeners();
        this.foodManager.initialize(this.canvas.width, this.canvas.height, this.snake.body);
        this.startRenderLoop();
        this.draw();
    }

    setupEventListeners(): void {
        document.addEventListener('keydown', (e: KeyboardEvent) => {
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

    toggleGame(): void {
        this.stateManager.toggleGame(() => this.update());
    }

    start(): void {
        this.stateManager.start(() => this.update());
    }

    pause(): void {
        this.stateManager.pause();
    }

    startRenderLoop(): void {
        this.stateManager.startRenderLoop((currentTime: number, deltaTime: number, animationSpeed: number) => {
            this.particles.update();
            this.snake.updateAnimation(animationSpeed);
            this.aiSnake.updateAnimation(animationSpeed);
            this.speechBubbles.update(deltaTime);
            
            if (this.stateManager.isRunning()) {
                this.aiSnake.updateAI(currentTime, this.foodManager.foods as any, this.snake, this.canvas.width, this.canvas.height);
                this.chatterManager.checkAllChatter(currentTime, this.snake, this.aiSnake, this.foodManager.foods as any);
            }
            
            this.draw();
        });
    }

    stopRenderLoop(): void {
        this.stateManager.stopRenderLoop();
    }

    update(): void {
        this.snake.move();
        
        const playerCollisions = this.collisionDetector.checkPlayerCollisions(
            this.snake, this.aiSnake, this.canvas.width, this.canvas.height
        );
        if (this.collisionDetector.hasAnyCollision(playerCollisions)) {
            this.gameOver();
            return;
        }
        
        const aiCollisions = this.collisionDetector.checkAICollisions(
            this.aiSnake, this.snake, this.canvas.width, this.canvas.height
        );
        if (this.collisionDetector.hasAnyCollision(aiCollisions)) {
            this.aiSnake.die();
            this.particles.createFoodParticles(
                this.aiSnake.body[0].x, 
                this.aiSnake.body[0].y, 
                this.gridSize
            );
        }
        
        const playerEatenFood = this.foodManager.checkCollision(this.snake);
        if (playerEatenFood) {
            this.handlePlayerFoodEaten(playerEatenFood);
        }
        
        if (this.aiSnake.isAlive) {
            const aiEatenFood = this.foodManager.checkCollision(this.aiSnake);
            if (aiEatenFood) {
                this.handleAIFoodEaten(aiEatenFood);
            }
        }
    }

    handlePlayerFoodEaten(eatenFood: Food): void {
        this.particles.createFoodParticles(eatenFood.x, eatenFood.y, this.gridSize);
        this.particles.createScoreParticles(
            eatenFood.x * this.gridSize + this.gridSize / 2,
            eatenFood.y * this.gridSize,
            GAME_SETTINGS.SCORE_PER_FOOD
        );
        
        this.snake.grow();
        this.stateManager.addScore();
        
        this.foodManager.removeFood(eatenFood);
        this.foodManager.addNewFood(this.canvas.width, this.canvas.height, this.snake.body);
    }

    handleAIFoodEaten(eatenFood: Food): void {
        this.particles.createFoodParticles(eatenFood.x, eatenFood.y, this.gridSize);
        this.aiSnake.grow();
        
        this.foodManager.removeFood(eatenFood);
        this.foodManager.addNewFood(this.canvas.width, this.canvas.height, this.snake.body);
    }

    draw(): void {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, GAME_SETTINGS.COLORS.BACKGROUND.START);
        gradient.addColorStop(1, GAME_SETTINGS.COLORS.BACKGROUND.END);
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawGrid();
        
        this.snake.draw(this.ctx);
        this.aiSnake.draw(this.ctx);
        this.foodManager.draw(this.ctx);
        this.particles.draw(this.ctx);
        this.speechBubbles.draw(this.ctx);
    }

    drawGrid(): void {
        this.ctx.strokeStyle = GAME_SETTINGS.COLORS.GRID;
        this.ctx.lineWidth = 1;
        
        for (let x = 0; x <= this.canvas.width; x += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y <= this.canvas.height; y += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

    gameOver(): void {
        this.stateManager.gameOver();
    }

    restart(): void {
        this.stateManager.restart();
        this.snake.reset();
        this.aiSnake.reset();
        this.foodManager.initialize(this.canvas.width, this.canvas.height, this.snake.body);
        this.draw();
    }
}

const game = new Game();
(window as any).game = game;