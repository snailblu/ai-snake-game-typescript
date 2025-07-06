export class Snake {
    constructor(gridSize) {
        this.gridSize = gridSize;
        this.reset();
    }

    reset() {
        this.body = [
            { x: 10, y: 10, renderX: 10, renderY: 10 },
            { x: 9, y: 10, renderX: 9, renderY: 10 },
            { x: 8, y: 10, renderX: 8, renderY: 10 }
        ];
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.moveProgress = 0; // 이동 애니메이션 진행도 (0-1)
    }

    move() {
        this.direction = { ...this.nextDirection };
        
        // 이전 위치 저장 (애니메이션용)
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
        
        // 애니메이션 초기화
        this.moveProgress = 0;
    }

    grow() {
        const tail = { ...this.body[this.body.length - 1] };
        tail.renderX = tail.x;
        tail.renderY = tail.y;
        tail.prevX = tail.x;
        tail.prevY = tail.y;
        this.body.push(tail);
    }

    // 보간 함수 (Linear Interpolation)
    lerp(start, end, progress) {
        return start + (end - start) * progress;
    }

    // 부드러운 이동 애니메이션 업데이트
    updateAnimation(deltaProgress) {
        this.moveProgress = Math.min(1, this.moveProgress + deltaProgress);
        
        // 각 세그먼트의 렌더링 위치 업데이트
        this.body.forEach((segment, index) => {
            if (segment.prevX !== undefined && segment.prevY !== undefined) {
                segment.renderX = this.lerp(segment.prevX, segment.x, this.moveProgress);
                segment.renderY = this.lerp(segment.prevY, segment.y, this.moveProgress);
            } else {
                segment.renderX = segment.x;
                segment.renderY = segment.y;
            }
        });
    }

    changeDirection(newDirection) {
        if (this.direction.x === -newDirection.x && this.direction.y === -newDirection.y) {
            return;
        }
        this.nextDirection = newDirection;
    }

    checkWallCollision(canvasWidth, canvasHeight) {
        const head = this.body[0];
        const gridWidth = canvasWidth / this.gridSize;
        const gridHeight = canvasHeight / this.gridSize;
        
        return head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight;
    }

    checkSelfCollision() {
        const head = this.body[0];
        return this.body.slice(1).some(segment => 
            segment.x === head.x && segment.y === head.y
        );
    }

    checkFoodCollision(food) {
        const head = this.body[0];
        return head.x === food.x && head.y === food.y;
    }

    draw(ctx) {
        ctx.lineWidth = 2;

        // 꼬리부터 머리 순으로 그리기 (머리가 최상단에 표시되도록)
        this.body.slice().reverse().forEach((segment, reverseIndex) => {
            const index = this.body.length - 1 - reverseIndex; // 원래 인덱스 계산
            const x = segment.renderX * this.gridSize;
            const y = segment.renderY * this.gridSize;
            
            // 그라데이션 색상 계산 (머리에서 꼬리로 갈수록 어두워짐)
            const intensity = 1 - (index / this.body.length) * 0.6;
            
            if (index === 0) {
                // 머리 - 네온 그린
                ctx.fillStyle = `hsl(120, 100%, ${70 * intensity}%)`;
                ctx.strokeStyle = `hsl(120, 100%, ${50 * intensity}%)`;
                
                // 머리에 눈 그리기
                ctx.fillRect(x, y, this.gridSize, this.gridSize);
                ctx.strokeRect(x, y, this.gridSize, this.gridSize);
                
                // 눈 그리기
                ctx.fillStyle = '#fff';
                const eyeSize = 3;
                const eyeOffset = 4;
                ctx.fillRect(x + eyeOffset, y + eyeOffset, eyeSize, eyeSize);
                ctx.fillRect(x + this.gridSize - eyeOffset - eyeSize, y + eyeOffset, eyeSize, eyeSize);
                
                // 눈동자
                ctx.fillStyle = '#000';
                ctx.fillRect(x + eyeOffset + 1, y + eyeOffset + 1, 1, 1);
                ctx.fillRect(x + this.gridSize - eyeOffset - eyeSize + 1, y + eyeOffset + 1, 1, 1);
                
            } else {
                // 몸통 - 그라데이션 적용
                ctx.fillStyle = `hsl(120, 80%, ${50 * intensity}%)`;
                ctx.strokeStyle = `hsl(120, 90%, ${30 * intensity}%)`;
                
                // 둥근 모서리 효과
                ctx.beginPath();
                ctx.roundRect(x + 1, y + 1, this.gridSize - 2, this.gridSize - 2, 3);
                ctx.fill();
                ctx.stroke();
            }
        });
    }
}