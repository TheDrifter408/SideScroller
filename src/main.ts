import './style.css'
import { GRAVITY } from './constants';

const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const ctx = canvas?.getContext('2d');

// Set to keep track of keys pressed
const keys = new Set();

// Listener to update set of keys pressed
window.addEventListener('keydown', (event) => keys.add(event));
window.addEventListener('keyup', (event) => keys.delete(event))

let player = {
  x: 50,
  y: 30,
  width: 30,
  height: 30,
  frameX: 0,
  maxFrame: 5,
  fps: 10,
  speed: 5,
  moving: false,
  facingLeft: false,
  dy: 0,
  jumpForce: 12,
  grounded: false,
}

function update() {
  player.dy += GRAVITY;
  player.y += player.dy;

  // Ground Collision
  if (player.y + player.height > canvas.height) {
    player.y = canvas.height - player.height;
    player.dy = 0;
    player.grounded = true;
  }

}

function draw() {
  if (ctx) {
    ctx.fillStyle = 'red';
    ctx.fillRect(player.x, player.y, player.width, player.height);
  }
}

window.addEventListener('keydown', (event) => {
  if (event.code === 'Space' && player.grounded) {
    player.dy -= player.jumpForce;
    player.grounded = false;
  }
})

function gameLoop() {
  ctx?.clearRect(0, 0, canvas.width, canvas.height); // 1. Clear
  update(); // 2. Update
  draw(); //  3. Draw
  requestAnimationFrame(gameLoop); // 4. Repeat
}

gameLoop();