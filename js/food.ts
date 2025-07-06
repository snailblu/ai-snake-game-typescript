import { Position, RenderPosition } from './types.js';

export class Food {
    public gridSize: number;
    public position: Position;
    public animationOffset: number;
    public pulseSpeed: number;

    constructor(gridSize: number) {
        this.gridSize = gridSize;
        this.position = { x: 0, y: 0 };
        this.animationOffset = 0;
        this.pulseSpeed = 0.05;
    }

    generateRandomPosition(canvasWidth: number, canvasHeight: number, snakeBody: RenderPosition[], otherFoods: Food[] = []): void {
        const gridWidth = canvasWidth / this.gridSize;
        const gridHeight = canvasHeight / this.gridSize;
        
        let newPosition: Position;
        do {
            newPosition = {
                x: Math.floor(Math.random() * gridWidth),
                y: Math.floor(Math.random() * gridHeight)
            };
        } while (this.isPositionOccupied(newPosition, snakeBody, otherFoods));
        
        this.position = newPosition;
    }

    isPositionOccupied(position: Position, snakeBody: RenderPosition[], otherFoods: Food[] = []): boolean {
        const snakeCollision = snakeBody.some(segment => 
            segment.x === position.x && segment.y === position.y
        );
        
        const foodCollision = otherFoods.some(food => 
            food.x === position.x && food.y === position.y
        );
        
        return snakeCollision || foodCollision;
    }

    get x(): number {
        return this.position.x;
    }

    get y(): number {
        return this.position.y;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        this.animationOffset += this.pulseSpeed;
        
        const x = this.position.x * this.gridSize;
        const y = this.position.y * this.gridSize;
        const centerX = x + this.gridSize / 2;
        const centerY = y + this.gridSize / 2;
        const baseRadius = this.gridSize / 2 - 2;
        
        const pulseScale = 1 + Math.sin(this.animationOffset) * 0.2;
        const radius = baseRadius * pulseScale;
        
        ctx.save();
        ctx.shadowColor = '#FF6B6B';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        gradient.addColorStop(0, '#FF8A80');
        gradient.addColorStop(0.7, '#FF6B6B');
        gradient.addColorStop(1, '#E53E3E');
        
        ctx.fillStyle = gradient;
        ctx.strokeStyle = '#C62828';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        
        ctx.fillStyle = '#FFCDD2';
        ctx.beginPath();
        ctx.arc(centerX - radius/3, centerY - radius/3, radius/3, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.restore();
        
        ctx.fillStyle = '#4CAF50';
        ctx.beginPath();
        ctx.ellipse(centerX, centerY - radius + 2, 3, 2, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.strokeStyle = '#8D6E63';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - radius + 1);
        ctx.lineTo(centerX, centerY - radius - 2);
        ctx.stroke();
    }
}

export class FoodManager {
    public gridSize: number;
    public foods: Food[];
    public maxCount: number;

    constructor(gridSize: number, count: number = 2) {
        this.gridSize = gridSize;
        this.foods = [];
        this.maxCount = count;
    }

    initialize(canvasWidth: number, canvasHeight: number, snakeBody: RenderPosition[]): void {
        this.foods = [];
        for (let i = 0; i < this.maxCount; i++) {
            const food = new Food(this.gridSize);
            food.generateRandomPosition(canvasWidth, canvasHeight, snakeBody, this.foods);
            this.foods.push(food);
        }
    }

    checkCollision(snake: { body: RenderPosition[] }): Food | undefined {
        const head = snake.body[0];
        return this.foods.find(food => 
            food.x === head.x && food.y === head.y
        );
    }

    removeFood(foodToRemove: Food): void {
        const index = this.foods.indexOf(foodToRemove);
        if (index > -1) {
            this.foods.splice(index, 1);
        }
    }

    addNewFood(canvasWidth: number, canvasHeight: number, snakeBody: RenderPosition[]): void {
        if (this.foods.length < this.maxCount) {
            const food = new Food(this.gridSize);
            food.generateRandomPosition(canvasWidth, canvasHeight, snakeBody, this.foods);
            this.foods.push(food);
        }
    }

    draw(ctx: CanvasRenderingContext2D): void {
        this.foods.forEach(food => food.draw(ctx));
    }

    get count(): number {
        return this.foods.length;
    }
}