export class Platform {
  x: number;
  y: number;
  width: number;
  height: number;

  constructor({ x = 0, y = 0, width = 0, height = 0 }) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  draw(ctx: CanvasRenderingContext2D | null) {
    if (ctx) {
      ctx.fillStyle = '#4a3728';
      ctx.fillRect(this.x, this.y, this.width, this.height);

      ctx.fillStyle = '#2d5a27';
      ctx.fillRect(this.x, this.y, this.width, 5);
    }
  }

}