import './style.css'
import { GRAVITY } from './constants';
import { Player } from './classes/player';
import { Platform } from './classes/platform';

const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const ctx = canvas?.getContext('2d');

canvas.width = 800;
canvas.height = 400;

// Set to keep track of keys pressed
const keys = new Set<string>();

// Listener to update set of keys pressed
window.addEventListener('keydown', (event) => keys.add(event.code));
window.addEventListener('keyup', (event) => keys.delete(event.code))

const animations: Record<string, HTMLImageElement> = {
  idle: new Image(),
  walk: new Image(),
  jump: new Image(),
  attack1: new Image(),
  attack2: new Image(),
  attack3: new Image(),
  running: new Image(),
}

animations.idle.src = '/Samurai/Idle.png';
animations.walk.src = '/Samurai/Walk.png';
animations.jump.src = '/Samurai/Jump.png';
animations.attack1.src = '/Samurai/Attack_1.png';
animations.attack2.src = '/Samurai/Attack_2.png';
animations.attack3.src = '/Samurai/Attack_3.png';
animations.running.src = '/Samurai/Run.png';

let player = new Player({
  x: 50,
  y: 30,
  width: 64,
  height: 64,
  maxFrame: 5,
  speed: 0.5,
  jumpForce: 12,
});

// Create a few platforms
const platforms = [
  new Platform({ x: 200, y: 300, width: 200, height: 20 }),
  new Platform({ x: 500, y: 200, width: 150, height: 20 }),
  new Platform({ x: 100, y: 150, width: 100, height: 20 }),
];

let gameFrame = 0;

function gameLoop() {
  ctx?.clearRect(0, 0, canvas.width, canvas.height);

  platforms.forEach((platform) => platform.draw(ctx));

  player.update({
    keys,
    canvasHeight: canvas.height,
    gravity: GRAVITY,
    gameFrame,
    platforms,
  });

  let imageKey: string = player.currentState;

  if (player.currentState === 'attack' && player.currentAttack) {
    imageKey = player.currentAttack.imageKey;
  }

  const currentImage = animations[imageKey] || animations.idle;

  player.draw(ctx, currentImage);

  gameFrame++;
  requestAnimationFrame(gameLoop);

}

gameLoop();