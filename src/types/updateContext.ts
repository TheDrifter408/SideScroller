import type { Platform } from '../classes/platform';

export interface UpdateContext {
  keys: Set<string>;
  canvasHeight: number;
  gravity: number;
  gameFrame: number;
  platforms: Platform[];
}