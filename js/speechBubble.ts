export class SpeechBubble {
    public x: number;
    public y: number;
    public text: string;
    public isAI: boolean;
    public type: 'llm' | 'fallback';
    public life: number;
    public maxLife: number;
    public opacity: number;
    public scale: number;
    public targetScale: number;
    public animationSpeed: number;
    public padding: number;
    public fontSize: number;
    public minWidth: number;
    public estimatedWidth: number;
    public height: number;

    constructor(x: number, y: number, text: string, isAI: boolean = false, type: 'llm' | 'fallback' = 'fallback') {
        this.x = x;
        this.y = y;
        this.text = text;
        this.isAI = isAI;
        this.type = type;
        this.life = 3000; // 3초간 표시
        this.maxLife = 3000;
        this.opacity = 1.0;
        this.scale = 0.1; // 애니메이션용 시작 크기
        this.targetScale = 1.0;
        this.animationSpeed = 0.1;
        
        // 말풍선 크기 계산
        this.padding = 8;
        this.fontSize = 12;
        this.minWidth = 60;
        this.estimatedWidth = Math.max(this.minWidth, text.length * 8 + this.padding * 2);
        this.height = this.fontSize + this.padding * 2;
    }

    update(deltaTime: number): boolean {
        this.life -= deltaTime;
        
        // 스케일 애니메이션 (등장 효과)
        if (this.scale < this.targetScale) {
            this.scale = Math.min(this.targetScale, this.scale + this.animationSpeed);
        }
        
        // 페이드 아웃 효과 (마지막 1초)
        if (this.life < 1000) {
            this.opacity = this.life / 1000;
        }
        
        // 위로 떠오르는 효과
        this.y -= deltaTime * 0.01;
        
        return this.life > 0;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        if (this.opacity <= 0) return;
        
        ctx.save();
        ctx.globalAlpha = this.opacity;
        
        // 말풍선 중심점 계산
        const bubbleX = this.x - this.estimatedWidth / 2;
        const bubbleY = this.y - this.height - 10; // 뱀 머리 위에 위치
        
        // 스케일 적용
        ctx.translate(this.x, bubbleY + this.height / 2);
        ctx.scale(this.scale, this.scale);
        ctx.translate(-this.x, -(bubbleY + this.height / 2));
        
        // 말풍선 배경
        this.drawBubbleBackground(ctx, bubbleX, bubbleY);
        
        // 말풍선 꼬리 (뱀을 가리키는 삼각형)
        this.drawBubbleTail(ctx, this.x, bubbleY + this.height);
        
        // 텍스트 그리기
        this.drawText(ctx, this.x, bubbleY + this.height / 2 + 2);
        
        ctx.restore();
    }

    private drawBubbleBackground(ctx: CanvasRenderingContext2D, x: number, y: number): void {
        const borderRadius = 8;
        
        // 그림자 효과
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.drawRoundedRect(ctx, x + 2, y + 2, this.estimatedWidth, this.height, borderRadius);
        ctx.fill();
        
        // 말풍선 배경 (AI/플레이어 + LLM/폴백 구분)
        if (this.isAI) {
            // AI: 파란색 계열
            const gradient = ctx.createLinearGradient(x, y, x, y + this.height);
            if (this.type === 'llm') {
                gradient.addColorStop(0, '#E1F5FE'); // 밝은 파란색 (LLM)
                gradient.addColorStop(1, '#B3E5FC');
            } else {
                gradient.addColorStop(0, '#F3E5F5'); // 연보라색 (폴백)
                gradient.addColorStop(1, '#E1BEE7');
            }
            ctx.fillStyle = gradient;
        } else {
            // 플레이어: 초록색 계열
            const gradient = ctx.createLinearGradient(x, y, x, y + this.height);
            if (this.type === 'llm') {
                gradient.addColorStop(0, '#E8F5E8'); // 밝은 초록색 (LLM)
                gradient.addColorStop(1, '#C8E6C9');
            } else {
                gradient.addColorStop(0, '#FFF3E0'); // 연주황색 (폴백)
                gradient.addColorStop(1, '#FFE0B2');
            }
            ctx.fillStyle = gradient;
        }
        
        this.drawRoundedRect(ctx, x, y, this.estimatedWidth, this.height, borderRadius);
        ctx.fill();
        
        // 테두리 (타입에 따라 다른 색상)
        if (this.isAI) {
            ctx.strokeStyle = this.type === 'llm' ? '#2196F3' : '#9C27B0'; // 파란색 또는 보라색
        } else {
            ctx.strokeStyle = this.type === 'llm' ? '#4CAF50' : '#FF9800'; // 초록색 또는 주황색
        }
        ctx.lineWidth = this.type === 'llm' ? 2 : 1; // LLM은 더 두꺼운 테두리
        this.drawRoundedRect(ctx, x, y, this.estimatedWidth, this.height, borderRadius);
        ctx.stroke();
    }

    private drawBubbleTail(ctx: CanvasRenderingContext2D, centerX: number, bubbleBottom: number): void {
        const tailSize = 8;
        
        // 그림자
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.moveTo(centerX + 2, bubbleBottom + 2);
        ctx.lineTo(centerX - tailSize + 2, bubbleBottom + tailSize + 2);
        ctx.lineTo(centerX + tailSize + 2, bubbleBottom + tailSize + 2);
        ctx.closePath();
        ctx.fill();
        
        // 꼬리 배경 (타입에 따라 다른 색상)
        if (this.isAI) {
            ctx.fillStyle = this.type === 'llm' ? '#B3E5FC' : '#E1BEE7';
        } else {
            ctx.fillStyle = this.type === 'llm' ? '#C8E6C9' : '#FFE0B2';
        }
        ctx.beginPath();
        ctx.moveTo(centerX, bubbleBottom);
        ctx.lineTo(centerX - tailSize, bubbleBottom + tailSize);
        ctx.lineTo(centerX + tailSize, bubbleBottom + tailSize);
        ctx.closePath();
        ctx.fill();
        
        // 꼬리 테두리
        ctx.strokeStyle = this.isAI ? '#2196F3' : '#4CAF50';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX, bubbleBottom);
        ctx.lineTo(centerX - tailSize, bubbleBottom + tailSize);
        ctx.lineTo(centerX + tailSize, bubbleBottom + tailSize);
        ctx.stroke();
    }

    private drawText(ctx: CanvasRenderingContext2D, centerX: number, centerY: number): void {
        ctx.fillStyle = this.isAI ? '#1565C0' : '#2E7D32';
        ctx.font = `bold ${this.fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.text, centerX, centerY);
    }

    private drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number): void {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }
}

export class SpeechBubbleManager {
    public bubbles: SpeechBubble[];

    constructor() {
        this.bubbles = [];
    }

    addBubble(x: number, y: number, text: string, isAI: boolean = false, type: 'llm' | 'fallback' = 'fallback'): void {
        // 기존 말풍선 제거 (한 번에 하나만)
        this.bubbles = this.bubbles.filter(bubble => bubble.isAI !== isAI);
        
        // 새 말풍선 추가
        const bubble = new SpeechBubble(x, y, text, isAI, type);
        this.bubbles.push(bubble);
    }

    update(deltaTime: number): void {
        this.bubbles = this.bubbles.filter(bubble => bubble.update(deltaTime));
    }

    draw(ctx: CanvasRenderingContext2D): void {
        this.bubbles.forEach(bubble => bubble.draw(ctx));
    }

    clear(): void {
        this.bubbles = [];
    }

    // 특정 뱀의 말풍선만 제거
    removeBubblesForSnake(isAI: boolean): void {
        this.bubbles = this.bubbles.filter(bubble => bubble.isAI !== isAI);
    }
}