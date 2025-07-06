import { Snake } from './snake.js';

export class AISnake extends Snake {
    constructor(gridSize) {
        super(gridSize);
        this.isAI = true;
        this.lastMoveTime = 0;
        this.moveInterval = 200; // AI는 조금 더 느리게 (200ms)
        this.mistakeChance = 0.05; // 5% 실수 확률
        this.isAlive = true;
        this.respawnTimer = 0;
        this.respawnDelay = 5000; // 5초
    }

    reset() {
        super.reset();
        // AI는 다른 시작 위치
        this.body = [
            { x: 5, y: 5, renderX: 5, renderY: 5 },
            { x: 4, y: 5, renderX: 4, renderY: 5 },
            { x: 3, y: 5, renderX: 3, renderY: 5 }
        ];
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.moveProgress = 0;
        this.isAlive = true;
        this.respawnTimer = 0;
    }

    // AI 업데이트 (자동 이동)
    updateAI(currentTime, foods, playerSnake, canvasWidth, canvasHeight) {
        if (!this.isAlive) {
            this.respawnTimer += 16; // 대략 60fps 기준
            if (this.respawnTimer >= this.respawnDelay) {
                this.respawn(canvasWidth, canvasHeight, playerSnake);
            }
            return;
        }

        // 이동 타이밍 체크
        if (currentTime - this.lastMoveTime < this.moveInterval) {
            return;
        }

        this.lastMoveTime = currentTime;

        // AI 방향 결정
        const newDirection = this.decideDirection(foods, playerSnake, canvasWidth, canvasHeight);
        if (newDirection) {
            this.changeDirection(newDirection);
        }

        this.move();
    }

    // AI 방향 결정 로직
    decideDirection(foods, playerSnake, canvasWidth, canvasHeight) {
        // 5% 확률로 실수
        if (Math.random() < this.mistakeChance) {
            return this.getRandomDirection();
        }

        // 가장 가까운 음식 찾기
        const target = this.findNearestFood(foods);
        if (!target) return null;

        // 목표로 가는 방향 계산
        const head = this.body[0];
        const directions = [
            { x: 0, y: -1 }, // 위
            { x: 1, y: 0 },  // 오른쪽
            { x: 0, y: 1 },  // 아래
            { x: -1, y: 0 }  // 왼쪽
        ];

        // 각 방향의 안전성과 목표까지의 거리 계산
        const validDirections = directions.filter(dir => {
            // 반대 방향 제외
            if (this.direction.x === -dir.x && this.direction.y === -dir.y) {
                return false;
            }

            const nextPos = { x: head.x + dir.x, y: head.y + dir.y };
            return this.isSafePosition(nextPos, playerSnake, canvasWidth, canvasHeight);
        });

        if (validDirections.length === 0) {
            return this.getRandomDirection(); // 막다른 길이면 랜덤
        }

        // 목표에 가장 가까운 안전한 방향 선택
        let bestDirection = validDirections[0];
        let bestDistance = this.getDistance(
            { x: head.x + bestDirection.x, y: head.y + bestDirection.y }, 
            target
        );

        validDirections.forEach(dir => {
            const nextPos = { x: head.x + dir.x, y: head.y + dir.y };
            const distance = this.getDistance(nextPos, target);
            if (distance < bestDistance) {
                bestDistance = distance;
                bestDirection = dir;
            }
        });

        return bestDirection;
    }

    // 가장 가까운 음식 찾기
    findNearestFood(foods) {
        if (!foods || foods.length === 0) return null;

        const head = this.body[0];
        let nearest = foods[0];
        let minDistance = this.getDistance(head, nearest);

        foods.forEach(food => {
            const distance = this.getDistance(head, food);
            if (distance < minDistance) {
                minDistance = distance;
                nearest = food;
            }
        });

        return nearest;
    }

    // 거리 계산 (맨하탄 거리)
    getDistance(pos1, pos2) {
        return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
    }

    // 안전한 위치인지 확인
    isSafePosition(pos, playerSnake, canvasWidth, canvasHeight) {
        const gridWidth = canvasWidth / this.gridSize;
        const gridHeight = canvasHeight / this.gridSize;

        // 벽 충돌 체크
        if (pos.x < 0 || pos.x >= gridWidth || pos.y < 0 || pos.y >= gridHeight) {
            return false;
        }

        // 자기 몸체 충돌 체크
        if (this.body.some(segment => segment.x === pos.x && segment.y === pos.y)) {
            return false;
        }

        // 플레이어 뱀과 충돌 체크
        if (playerSnake && playerSnake.body.some(segment => segment.x === pos.x && segment.y === pos.y)) {
            return false;
        }

        return true;
    }

    // 랜덤 방향
    getRandomDirection() {
        const directions = [
            { x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }
        ];
        return directions[Math.floor(Math.random() * directions.length)];
    }

    // 사망 처리
    die() {
        this.isAlive = false;
        this.respawnTimer = 0;
    }

    // 리스폰
    respawn(canvasWidth, canvasHeight, playerSnake) {
        const gridWidth = canvasWidth / this.gridSize;
        const gridHeight = canvasHeight / this.gridSize;

        // 안전한 위치 찾기
        let attempts = 0;
        let startX, startY;
        
        do {
            startX = Math.floor(Math.random() * (gridWidth - 3)) + 1;
            startY = Math.floor(Math.random() * (gridHeight - 3)) + 1;
            attempts++;
        } while (attempts < 100 && this.isPositionOccupied(startX, startY, playerSnake));

        this.body = [
            { x: startX, y: startY, renderX: startX, renderY: startY },
            { x: startX - 1, y: startY, renderX: startX - 1, renderY: startY },
            { x: startX - 2, y: startY, renderX: startX - 2, renderY: startY }
        ];
        
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.moveProgress = 0;
        this.isAlive = true;
        this.respawnTimer = 0;
    }

    isPositionOccupied(x, y, playerSnake) {
        // 플레이어 뱀과 겹치는지 확인
        return playerSnake && playerSnake.body.some(segment => 
            Math.abs(segment.x - x) <= 2 && Math.abs(segment.y - y) <= 2
        );
    }

    // AI 뱀용 그리기 (파란색)
    draw(ctx) {
        if (!this.isAlive) return;

        ctx.lineWidth = 2;

        // 꼬리부터 머리 순으로 그리기 (머리가 최상단에 표시되도록)
        this.body.slice().reverse().forEach((segment, reverseIndex) => {
            const index = this.body.length - 1 - reverseIndex;
            const x = segment.renderX * this.gridSize;
            const y = segment.renderY * this.gridSize;
            
            // 파란색 그라데이션
            const intensity = 1 - (index / this.body.length) * 0.6;
            
            if (index === 0) {
                // AI 뱀 머리 - 네온 블루
                ctx.fillStyle = `hsl(240, 100%, ${70 * intensity}%)`;
                ctx.strokeStyle = `hsl(240, 100%, ${50 * intensity}%)`;
                
                ctx.fillRect(x, y, this.gridSize, this.gridSize);
                ctx.strokeRect(x, y, this.gridSize, this.gridSize);
                
                // 다른 모양의 눈 (삼각형)
                ctx.fillStyle = '#fff';
                const eyeSize = 4;
                const eyeOffset = 3;
                
                // 삼각형 눈
                ctx.beginPath();
                ctx.moveTo(x + eyeOffset, y + eyeOffset + eyeSize);
                ctx.lineTo(x + eyeOffset + eyeSize, y + eyeOffset + eyeSize);
                ctx.lineTo(x + eyeOffset + eyeSize/2, y + eyeOffset);
                ctx.fill();
                
                ctx.beginPath();
                ctx.moveTo(x + this.gridSize - eyeOffset - eyeSize, y + eyeOffset + eyeSize);
                ctx.lineTo(x + this.gridSize - eyeOffset, y + eyeOffset + eyeSize);
                ctx.lineTo(x + this.gridSize - eyeOffset - eyeSize/2, y + eyeOffset);
                ctx.fill();
                
            } else {
                // AI 뱀 몸통 - 파란색 그라데이션
                ctx.fillStyle = `hsl(240, 80%, ${50 * intensity}%)`;
                ctx.strokeStyle = `hsl(240, 90%, ${30 * intensity}%)`;
                
                ctx.beginPath();
                ctx.roundRect(x + 1, y + 1, this.gridSize - 2, this.gridSize - 2, 3);
                ctx.fill();
                ctx.stroke();
            }
        });
    }
}