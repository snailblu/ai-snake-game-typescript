import { RenderPosition, Direction, FoodType, GameSituation } from './types.js';

export class Snake {
    public gridSize: number;
    public body: RenderPosition[];
    public direction: Direction;
    public nextDirection: Direction;
    public moveProgress: number;
    public lastChatterTime: number;
    public chatterInterval: number;
    public lastSituation: GameSituation;
    public justAte: boolean;

    constructor(gridSize: number) {
        this.gridSize = gridSize;
        this.reset();
    }

    reset(): void {
        this.body = [
            { x: 10, y: 10, renderX: 10, renderY: 10 },
            { x: 9, y: 10, renderX: 9, renderY: 10 },
            { x: 8, y: 10, renderX: 8, renderY: 10 }
        ];
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.moveProgress = 0;
        
        this.lastChatterTime = 0;
        this.chatterInterval = 30000;
        this.lastSituation = 'idle';
        this.justAte = false;
    }

    move(): void {
        this.direction = { ...this.nextDirection };
        
        this.body.forEach(segment => {
            segment.prevX = segment.x;
            segment.prevY = segment.y;
        });
        
        const head = { ...this.body[0] };
        head.x += this.direction.x;
        head.y += this.direction.y;
        head.renderX = head.x;
        head.renderY = head.y;
        head.prevX = this.body[0].x;
        head.prevY = this.body[0].y;
        
        this.body.unshift(head);
        this.body.pop();
        
        this.moveProgress = 0;
    }

    grow(): void {
        const tail = { ...this.body[this.body.length - 1] };
        tail.renderX = tail.x;
        tail.renderY = tail.y;
        tail.prevX = tail.x;
        tail.prevY = tail.y;
        this.body.push(tail);
        this.justAte = true;
    }

    lerp(start: number, end: number, progress: number): number {
        return start + (end - start) * progress;
    }

    updateAnimation(deltaProgress: number): void {
        this.moveProgress = Math.min(1, this.moveProgress + deltaProgress);
        
        this.body.forEach((segment) => {
            if (segment.prevX !== undefined && segment.prevY !== undefined) {
                segment.renderX = this.lerp(segment.prevX, segment.x, this.moveProgress);
                segment.renderY = this.lerp(segment.prevY, segment.y, this.moveProgress);
            } else {
                segment.renderX = segment.x;
                segment.renderY = segment.y;
            }
        });
    }

    shouldChatter(currentTime: number, foods: FoodType[], otherSnake: Snake, chatter: any, probability: number = 0.3): { should: boolean; situation?: GameSituation } {
        if (this.justAte) {
            this.justAte = false;
            return { should: true, situation: 'eating' };
        }
        
        if (currentTime - this.lastChatterTime < this.chatterInterval) {
            return { should: false };
        }
        
        const situation = chatter.analyzeSituation(this, foods, otherSnake);
        
        const shouldTalk = (situation !== this.lastSituation || 
                          (currentTime - this.lastChatterTime > this.chatterInterval)) &&
                          Math.random() < probability;
        
        if (shouldTalk) {
            this.lastSituation = situation;
            this.lastChatterTime = currentTime;
        }
        
        return { should: shouldTalk, situation };
    }

    changeDirection(newDirection: Direction): void {
        if (this.direction.x === -newDirection.x && this.direction.y === -newDirection.y) {
            return;
        }
        this.nextDirection = newDirection;
    }

    checkWallCollision(canvasWidth: number, canvasHeight: number): boolean {
        const head = this.body[0];
        const gridWidth = canvasWidth / this.gridSize;
        const gridHeight = canvasHeight / this.gridSize;
        
        return head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight;
    }

    checkSelfCollision(): boolean {
        const head = this.body[0];
        return this.body.slice(1).some(segment => 
            segment.x === head.x && segment.y === head.y
        );
    }

    checkFoodCollision(food: FoodType): boolean {
        const head = this.body[0];
        return head.x === food.x && head.y === food.y;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.lineWidth = 2;

        this.body.slice().reverse().forEach((segment, reverseIndex) => {
            const index = this.body.length - 1 - reverseIndex;
            const x = segment.renderX * this.gridSize;
            const y = segment.renderY * this.gridSize;
            
            const intensity = 1 - (index / this.body.length) * 0.6;
            
            if (index === 0) {
                ctx.fillStyle = `hsl(120, 100%, ${70 * intensity}%)`;
                ctx.strokeStyle = `hsl(120, 100%, ${50 * intensity}%)`;
                
                ctx.fillRect(x, y, this.gridSize, this.gridSize);
                ctx.strokeRect(x, y, this.gridSize, this.gridSize);
                
                ctx.fillStyle = '#fff';
                const eyeSize = 3;
                const eyeOffset = 4;
                ctx.fillRect(x + eyeOffset, y + eyeOffset, eyeSize, eyeSize);
                ctx.fillRect(x + this.gridSize - eyeOffset - eyeSize, y + eyeOffset, eyeSize, eyeSize);
                
                ctx.fillStyle = '#000';
                ctx.fillRect(x + eyeOffset + 1, y + eyeOffset + 1, 1, 1);
                ctx.fillRect(x + this.gridSize - eyeOffset - eyeSize + 1, y + eyeOffset + 1, 1, 1);
                
            } else {
                ctx.fillStyle = `hsl(120, 80%, ${50 * intensity}%)`;
                ctx.strokeStyle = `hsl(120, 90%, ${30 * intensity}%)`;
                
                ctx.beginPath();
                ctx.roundRect(x + 1, y + 1, this.gridSize - 2, this.gridSize - 2, 3);
                ctx.fill();
                ctx.stroke();
            }
        });
    }
}