export class Food {
    constructor(gridSize) {
        this.gridSize = gridSize;
        this.position = { x: 0, y: 0 };
        this.animationOffset = 0;
        this.pulseSpeed = 0.05;
    }

    generateRandomPosition(canvasWidth, canvasHeight, snakeBody, otherFoods = []) {
        const gridWidth = canvasWidth / this.gridSize;
        const gridHeight = canvasHeight / this.gridSize;
        
        let newPosition;
        do {
            newPosition = {
                x: Math.floor(Math.random() * gridWidth),
                y: Math.floor(Math.random() * gridHeight)
            };
        } while (this.isPositionOccupied(newPosition, snakeBody, otherFoods));
        
        this.position = newPosition;
    }

    isPositionOccupied(position, snakeBody, otherFoods = []) {
        // 뱀 몸체와 겹치는지 확인
        const snakeCollision = snakeBody.some(segment => 
            segment.x === position.x && segment.y === position.y
        );
        
        // 다른 과일과 겹치는지 확인
        const foodCollision = otherFoods.some(food => 
            food.x === position.x && food.y === position.y
        );
        
        return snakeCollision || foodCollision;
    }

    get x() {
        return this.position.x;
    }

    get y() {
        return this.position.y;
    }

    draw(ctx) {
        // 애니메이션 업데이트
        this.animationOffset += this.pulseSpeed;
        
        const x = this.position.x * this.gridSize;
        const y = this.position.y * this.gridSize;
        const centerX = x + this.gridSize / 2;
        const centerY = y + this.gridSize / 2;
        const baseRadius = this.gridSize / 2 - 2;
        
        // 펄스 효과 (크기 변화)
        const pulseScale = 1 + Math.sin(this.animationOffset) * 0.2;
        const radius = baseRadius * pulseScale;
        
        // 글로우 효과 (외곽선)
        ctx.save();
        ctx.shadowColor = '#FF6B6B';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // 메인 사과 몸체
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
        
        // 하이라이트 효과
        ctx.fillStyle = '#FFCDD2';
        ctx.beginPath();
        ctx.arc(centerX - radius/3, centerY - radius/3, radius/3, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.restore();
        
        // 사과 잎사귀 (작은 초록색 장식)
        ctx.fillStyle = '#4CAF50';
        ctx.beginPath();
        ctx.ellipse(centerX, centerY - radius + 2, 3, 2, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // 사과 줄기
        ctx.strokeStyle = '#8D6E63';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - radius + 1);
        ctx.lineTo(centerX, centerY - radius - 2);
        ctx.stroke();
    }
}

export class FoodManager {
    constructor(gridSize, count = 2) {
        this.gridSize = gridSize;
        this.foods = [];
        this.maxCount = count;
    }

    initialize(canvasWidth, canvasHeight, snakeBody) {
        this.foods = [];
        for (let i = 0; i < this.maxCount; i++) {
            const food = new Food(this.gridSize);
            food.generateRandomPosition(canvasWidth, canvasHeight, snakeBody, this.foods);
            this.foods.push(food);
        }
    }

    checkCollision(snake) {
        const head = snake.body[0];
        return this.foods.find(food => 
            food.x === head.x && food.y === head.y
        );
    }

    removeFood(foodToRemove) {
        const index = this.foods.indexOf(foodToRemove);
        if (index > -1) {
            this.foods.splice(index, 1);
        }
    }

    addNewFood(canvasWidth, canvasHeight, snakeBody) {
        if (this.foods.length < this.maxCount) {
            const food = new Food(this.gridSize);
            food.generateRandomPosition(canvasWidth, canvasHeight, snakeBody, this.foods);
            this.foods.push(food);
        }
    }

    draw(ctx) {
        this.foods.forEach(food => food.draw(ctx));
    }

    get count() {
        return this.foods.length;
    }
}