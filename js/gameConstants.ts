import { GameConstants } from './types.ts';

export const GAME_CONSTANTS: any = {
    GRID_SIZE: 20,
    CANVAS_WIDTH: 400,
    CANVAS_HEIGHT: 400,
    FOOD_COUNT: 2,
    GAME_SPEED: 150,
    RENDER_FPS: 60,
    AI_RESPAWN_DELAY: 5000,
    PARTICLE_COUNT: 10,
    SPEECH_BUBBLE_DURATION: 3000,
    CHATTER_INTERVAL: 30000,
    GAME_UPDATE_INTERVAL: 150,
    CHATTER_PROBABILITY: 0.3,
    SCORE_PER_FOOD: 10,
    ANIMATION_SPEED_BASE: 150,
    STORAGE_KEYS: {
        HIGH_SCORE: 'snakeHighScore'
    }
};

export const GAME_SETTINGS = {
    GAME_UPDATE_INTERVAL: 150,
    CHATTER_PROBABILITY: 0.3,
    SCORE_PER_FOOD: 10,
    ANIMATION_SPEED_BASE: 150,
    
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
    
    STORAGE_KEYS: {
        HIGH_SCORE: 'snakeHighScore'
    }
} as const;