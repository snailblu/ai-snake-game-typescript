export class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    createFoodParticles(x, y, gridSize) {
        const centerX = x * gridSize + gridSize / 2;
        const centerY = y * gridSize + gridSize / 2;
        
        // 12개의 파티클 생성 (더 화려하게)
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const speed = 3 + Math.random() * 4; // 속도 증가
            
            this.particles.push({
                x: centerX,
                y: centerY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0,
                maxLife: 1.0,
                size: 2 + Math.random() * 3,
                color: `hsl(${Math.random() * 60 + 340}, 100%, 60%)` // 빨간색 계열
            });
        }
    }

    createScoreParticles(x, y, score) {
        // 점수 텍스트 파티클
        this.particles.push({
            x: x,
            y: y,
            vx: 0,
            vy: -3, // 속도 증가
            life: 2.0, // 생명력 증가
            maxLife: 2.0,
            size: 18, // 크기 증가
            color: '#FFD700',
            text: `+${score}`,
            isText: true
        });
    }

    update() {
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= 0.016; // 60fps 기준으로 조정 (이전: 0.02)
            
            // 중력 효과 (텍스트가 아닌 파티클에만)
            if (!particle.isText) {
                particle.vy += 0.2; // 중력 증가
                particle.vx *= 0.99; // 공기 저항
            }
            
            return particle.life > 0;
        });
    }

    draw(ctx) {
        this.particles.forEach(particle => {
            const alpha = particle.life / particle.maxLife;
            
            if (particle.isText) {
                // 텍스트 파티클
                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.fillStyle = particle.color;
                ctx.font = `${particle.size}px Arial`;
                ctx.textAlign = 'center';
                ctx.fillText(particle.text, particle.x, particle.y);
                ctx.restore();
            } else {
                // 일반 파티클
                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.fillStyle = particle.color;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        });
    }
}