import type { TAttack } from '../types/attack';
import type { UpdateContext } from '../types/updateContext';
import type { Platform } from './platform';

export class Player {
  // Properties
  x = 0;
  y = 0;
  width = 0;
  height = 0;
  frameX = 0;
  maxFrame = 0;
  speed = 0;
  moving = false;
  facingLeft = false;
  dy = 0;
  jumpForce = 12;
  grounded = true;
  staggerFrames = 0;

  private jumpBufferCounter = 0;

  currentAttack: TAttack | null = null;

  private ATTACK_LIBRARY: Record<string, TAttack> = {
    light: {
      frames: 6,
      speed: 6,
      imageKey: 'attack1'
    },
    medium: {
      frames: 4,
      speed: 8,
      imageKey: 'attack2'
    },
    heavy: {
      frames: 3,
      speed: 10,
      imageKey: 'attack3'
    }
  }

  // State
  currentState: 'idle' | 'walk' | 'jump' | 'attack' | 'running' = 'idle';

  private frameCounts = {
    idle: { frames: 6, speed: 15 },
    walk: { frames: 8, speed: 10, },
    attack: { frames: 6, speed: 6 },
    jump: { frames: 12, speed: 0 },
    running: { frames: 8, speed: 5 },
  }

  constructor({
    x = 0,
    y = 0,
    height = 0,
    width = 0,
    frameX = 0,
    maxFrame = 0,
    speed = 0,
    moving = false,
    facingLeft = false,
    dy = 0,
    jumpForce = 12,
    grounded = false,
    staggerFrames = 15,
  }) {
    this.x = x;
    this.y = y;
    this.height = height;
    this.width = width;
    this.frameX = frameX;
    this.maxFrame = maxFrame;
    this.speed = speed;
    this.moving = moving;
    this.facingLeft = facingLeft;
    this.dy = dy;
    this.jumpForce = jumpForce;
    this.grounded = grounded;
    this.staggerFrames = staggerFrames;
  }

  isMoving() {
    return this.moving;
  }

  isFacingLeft() {
    return this.facingLeft;
  }

  private handleMovement(keys: Set<string>) {
    if (this.currentState === 'attack') {
      this.moving = false;
      return;
    }

    const walkingSpeed = 0.5;
    const runningSpeed = 1.5;

    const isSprinting = keys.has('ShiftLeft') || keys.has('ShiftRight');
    const currentSpeed = isSprinting ? runningSpeed : walkingSpeed;

    this.moving = false;

    if (keys.has('KeyD') || keys.has('ArrowRight')) {
      this.x += currentSpeed;
      this.facingLeft = false;
      this.moving = true;
      this.currentState = isSprinting ? 'running' : 'walk';
    } else if (keys.has('KeyA') || keys.has('ArrowLeft')) {
      this.x -= currentSpeed;
      this.facingLeft = true;
      this.moving = true;
      this.currentState = isSprinting ? 'running' : 'walk';
    } else {
      this.currentState = 'idle';
    }
  }

  private handleJump(keys: Set<string>) {

    if (keys.has('Space')) {
      this.jumpBufferCounter = 10;
    } else {
      this.jumpBufferCounter--;
    }

    if (this.jumpBufferCounter > 0 && this.grounded) {
      this.dy -= this.jumpForce;
      this.grounded = false;
      this.currentState = 'jump';
      this.jumpBufferCounter = 0;
    }
  }

  private handleAttack(keys: Set<string>) {
    if (this.currentState === 'attack') return;

    let selectedAttack: TAttack | null = null;

    if (keys.has('KeyH')) selectedAttack = this.ATTACK_LIBRARY.light;
    if (keys.has('KeyJ')) selectedAttack = this.ATTACK_LIBRARY.medium;
    if (keys.has('KeyK')) selectedAttack = this.ATTACK_LIBRARY.heavy;

    if (selectedAttack) {
      this.currentState = 'attack';
      this.currentAttack = selectedAttack;
      this.frameX = 0;
    }

  }

  private applyPhysics(canvasHeight: number, gravity: number, platforms: Platform[]) {
    this.dy += gravity;
    this.y += this.dy;

    let onAnyPlatform = false;

    // Ground Collision
    if (this.y + this.height > canvasHeight) {
      this.y = canvasHeight - this.height;
      this.dy = 0;
      onAnyPlatform = true;
    }

    platforms.forEach((platform) => {
      if (
        this.x + this.width > platform.x &&
        this.x < platform.x + platform.width &&
        this.y + this.height <= platform.y + 10 &&
        this.y + this.height + this.dy >= platform.y
      ) {
        if (this.dy > 0) {
          this.dy = 0;
          this.y = platform.y - this.height;
          onAnyPlatform = true;
        }
      }
    });
    this.grounded = onAnyPlatform;
  }

  private updateAnimationState(gameFrame: number) {
    // 1. Determine State
    if (!this.grounded) {
      this.currentState = 'jump';
      let velocityRatio = (this.dy + this.jumpForce) / (this.jumpForce * 2);
      this.frameX = Math.floor(velocityRatio * (this.frameCounts.jump.frames - 1));

      this.frameX = Math.max(0, Math.min(this.frameX, this.frameCounts.jump.frames - 1));
      return;
    }
    if (this.currentState === 'attack' && this.currentAttack) {

      const { frames, speed } = this.currentAttack;

      if (gameFrame % speed === 0) {
        this.frameX++;
      }

      if (this.frameX >= frames) {
        this.currentState = 'idle';
        this.currentAttack = null;
        this.frameX = 0;
      }

      return;
    }

    const config = this.frameCounts[this.currentState];
    // 2. If we just changed state, we might want to reset frameX
    // But for now, using gameFrame is okay for walk/idle loops.
    this.frameX = Math.floor(gameFrame / config.speed) % config.frames;
  }

  update(context: UpdateContext) {
    const { keys, canvasHeight, gravity, platforms, gameFrame } = context;
    this.handleMovement(keys);
    this.handleJump(keys);
    this.handleAttack(keys);
    this.applyPhysics(canvasHeight, gravity, platforms);
    this.updateAnimationState(gameFrame);
  }

  draw(ctx: CanvasRenderingContext2D | null, img: HTMLImageElement) {
    if (ctx) {
      ctx.save();
      if (this.facingLeft) {
        ctx.scale(-1, 1);
        ctx.drawImage(
          img,
          this.frameX * 128,
          0,
          128,
          128,
          -this.x - this.width,
          this.y,
          this.width,
          this.height,
        )
      } else {
        ctx.drawImage(
          img,
          this.frameX * 128,
          0,
          128,
          128,
          this.x,
          this.y,
          this.width,
          this.height,
        )
      }
      ctx.restore();
    }
  }
}