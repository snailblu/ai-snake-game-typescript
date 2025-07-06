// 게임 상수 정의
export const GAME_CONSTANTS = {
    // 게임 플레이 관련 상수
    GRID_SIZE: 20,
    GAME_UPDATE_INTERVAL: 150, // ms
    RENDER_FPS: 60,
    
    // 뱀 관련 상수
    CHATTER_PROBABILITY: 0.3,
    SCORE_PER_FOOD: 10,
    
    // 음식 관련 상수
    FOOD_COUNT: 2,
    
    // 애니메이션 관련 상수
    ANIMATION_SPEED_BASE: 150, // ms for full animation
    
    // AI 뱀 관련 상수
    AI_RESPAWN_DELAY: 5000, // ms
    
    // 색상 상수
    COLORS: {
        BACKGROUND: {
            START: '#0a0a0a',
            END: '#1a1a1a'
        },
        GRID: 'rgba(255, 255, 255, 0.1)',
        SNAKE: {
            PLAYER: '#4CAF50',
            AI: '#FF5722'
        }
    },
    
    // 로컬 스토리지 키
    STORAGE_KEYS: {
        HIGH_SCORE: 'snakeHighScore'
    }
};