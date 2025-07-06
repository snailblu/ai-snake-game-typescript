export interface Position {
  x: number;
  y: number;
}

export interface RenderPosition extends Position {
  renderX: number;
  renderY: number;
  prevX?: number;
  prevY?: number;
}

export interface Direction {
  x: number;
  y: number;
}

export interface FoodType {
  x: number;
  y: number;
  type: 'normal' | 'special';
  color: string;
  points: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  text?: string;
  isText?: boolean;
}

export interface SpeechBubble {
  x: number;
  y: number;
  text: string;
  life: number;
  maxLife: number;
  alpha: number;
  width: number;
  height: number;
  isAI?: boolean;
  type?: 'llm' | 'fallback';
  opacity?: number;
  scale?: number;
  targetScale?: number;
  animationSpeed?: number;
  padding?: number;
  fontSize?: number;
  minWidth?: number;
  estimatedWidth?: number;
}

export interface GameState {
  isRunning: boolean;
  isPaused: boolean;
  gameOver: boolean;
  score: number;
  highScore: number;
}

export interface ChatterConfig {
  apiKey?: string;
  maxRetries: number;
  retryDelay: number;
  cacheExpiry: number;
}

export interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export interface GameConstants {
  GRID_SIZE: number;
  CANVAS_WIDTH: number;
  CANVAS_HEIGHT: number;
  FOOD_COUNT: number;
  GAME_SPEED: number;
  RENDER_FPS: number;
  AI_RESPAWN_DELAY: number;
  PARTICLE_COUNT: number;
  SPEECH_BUBBLE_DURATION: number;
  CHATTER_INTERVAL: number;
}

export type GameSituation = 'idle' | 'eating' | 'near_food' | 'avoiding_collision' | 'growing' | 'game_over' | 'danger' | 'competitive' | 'hunting';

export type ChatterType = 'player' | 'ai';

export interface CollisionResult {
  wall: boolean;
  self: boolean;
  enemy: boolean;
}

export type CollisionType = 'wall' | 'self' | 'enemy';

export interface ChatterResponse {
  text: string;
  type: 'llm' | 'fallback';
}

export interface SnakeBase {
  gridSize: number;
  body: RenderPosition[];
  direction: Direction;
  nextDirection: Direction;
  moveProgress: number;
  lastChatterTime: number;
  chatterInterval: number;
  lastSituation: GameSituation;
  justAte: boolean;
  isAlive?: boolean;
}

export interface ChatterInterface {
  generateChatter(situation: GameSituation, isAI: boolean): Promise<ChatterResponse>;
  analyzeSituation(snake: SnakeBase, foods: FoodType[], otherSnake: SnakeBase | null): GameSituation;
}

export interface SpeechBubbleManagerInterface {
  addBubble(x: number, y: number, text: string, isAI: boolean, type: 'llm' | 'fallback'): void;
}