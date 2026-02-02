import { Ship } from './Ship';
import { Laser } from './Laser';
import { Lander } from './Lander';
import { Human } from './Human';
import { TerrainPoint } from './types';
import { wrapX } from './World';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  WORLD_WIDTH,
  GROUND_Y,
  RADAR_HEIGHT,
  COLORS,
  SHIP_WIDTH,
  SHIP_HEIGHT,
  LANDER_WIDTH,
  LANDER_HEIGHT,
  HUMAN_WIDTH,
  HUMAN_HEIGHT,
} from './constants';

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private stars: { x: number; y: number; size: number }[];

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.stars = this.generateStars();
  }

  private generateStars(): { x: number; y: number; size: number }[] {
    const stars: { x: number; y: number; size: number }[] = [];
    for (let i = 0; i < 100; i++) {
      stars.push({
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * (GROUND_Y - RADAR_HEIGHT) + RADAR_HEIGHT,
        size: Math.random() * 1.5 + 0.5,
      });
    }
    return stars;
  }

  clear(): void {
    this.ctx.fillStyle = COLORS.background;
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  drawBackground(): void {
    this.ctx.fillStyle = COLORS.stars;
    for (const star of this.stars) {
      this.ctx.beginPath();
      this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  drawTerrain(terrain: TerrainPoint[], cameraX: number): void {
    this.ctx.fillStyle = COLORS.terrain;
    this.ctx.beginPath();
    this.ctx.moveTo(0, CANVAS_HEIGHT);

    for (let screenX = 0; screenX <= CANVAS_WIDTH; screenX += 4) {
      const worldX = wrapX(cameraX - CANVAS_WIDTH / 2 + screenX);
      const y = this.getTerrainHeight(terrain, worldX);
      this.ctx.lineTo(screenX, y);
    }

    this.ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT);
    this.ctx.closePath();
    this.ctx.fill();
  }

  private getTerrainHeight(terrain: TerrainPoint[], worldX: number): number {
    const wrappedX = wrapX(worldX);
    const resolution = terrain[1].x - terrain[0].x;
    const index = Math.floor(wrappedX / resolution);
    const nextIndex = (index + 1) % terrain.length;
    
    if (index >= terrain.length) return GROUND_Y;
    
    const p1 = terrain[index];
    const p2 = terrain[nextIndex];
    const t = (wrappedX - p1.x) / resolution;
    return p1.y + (p2.y - p1.y) * t;
  }

  private worldToScreen(worldX: number, cameraX: number): number {
    let dx = worldX - cameraX;
    // Handle wraparound
    if (dx > WORLD_WIDTH / 2) dx -= WORLD_WIDTH;
    if (dx < -WORLD_WIDTH / 2) dx += WORLD_WIDTH;
    return CANVAS_WIDTH / 2 + dx;
  }

  private isOnScreen(screenX: number): boolean {
    return screenX >= -50 && screenX <= CANVAS_WIDTH + 50;
  }

  drawShip(ship: Ship, cameraX: number): void {
    if (!ship.alive) return;

    const screenX = this.worldToScreen(ship.x, cameraX);
    if (!this.isOnScreen(screenX)) return;

    this.ctx.fillStyle = COLORS.ship;
    this.ctx.save();
    this.ctx.translate(screenX, ship.y);
    
    // Draw arrow shape pointing in facing direction
    this.ctx.beginPath();
    if (ship.facing === 1) {
      this.ctx.moveTo(SHIP_WIDTH / 2, 0);
      this.ctx.lineTo(-SHIP_WIDTH / 2, -SHIP_HEIGHT / 2);
      this.ctx.lineTo(-SHIP_WIDTH / 4, 0);
      this.ctx.lineTo(-SHIP_WIDTH / 2, SHIP_HEIGHT / 2);
    } else {
      this.ctx.moveTo(-SHIP_WIDTH / 2, 0);
      this.ctx.lineTo(SHIP_WIDTH / 2, -SHIP_HEIGHT / 2);
      this.ctx.lineTo(SHIP_WIDTH / 4, 0);
      this.ctx.lineTo(SHIP_WIDTH / 2, SHIP_HEIGHT / 2);
    }
    this.ctx.closePath();
    this.ctx.fill();
    
    this.ctx.restore();
  }

  drawLasers(lasers: Laser[], cameraX: number): void {
    this.ctx.fillStyle = COLORS.laser;
    for (const laser of lasers) {
      const screenX = this.worldToScreen(laser.x, cameraX);
      if (!this.isOnScreen(screenX)) continue;

      this.ctx.fillRect(
        screenX - 6,
        laser.y - 2,
        12,
        4
      );
    }
  }

  drawLanders(landers: Lander[], cameraX: number): void {
    for (const lander of landers) {
      if (!lander.isAlive()) continue;

      const screenX = this.worldToScreen(lander.x, cameraX);
      if (!this.isOnScreen(screenX)) continue;

      this.ctx.fillStyle = COLORS.lander;
      
      // Draw boxy alien shape
      this.ctx.fillRect(
        screenX - LANDER_WIDTH / 2,
        lander.y - LANDER_HEIGHT / 2,
        LANDER_WIDTH,
        LANDER_HEIGHT
      );
      
      // "Eyes"
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillRect(screenX - 4, lander.y - 4, 3, 3);
      this.ctx.fillRect(screenX + 1, lander.y - 4, 3, 3);
    }
  }

  drawHumans(humans: Human[], cameraX: number): void {
    for (const human of humans) {
      if (!human.isAlive()) continue;

      const screenX = this.worldToScreen(human.x, cameraX);
      if (!this.isOnScreen(screenX)) continue;

      this.ctx.fillStyle = human.state === 'grabbed' ? COLORS.humanGrabbed : COLORS.human;
      
      // Simple stick figure
      const y = human.y;
      
      // Body
      this.ctx.fillRect(screenX - 2, y - HUMAN_HEIGHT, 4, HUMAN_HEIGHT - 4);
      
      // Head
      this.ctx.beginPath();
      this.ctx.arc(screenX, y - HUMAN_HEIGHT - 2, 3, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  drawRadar(
    ship: Ship,
    landers: Lander[],
    humans: Human[],
    cameraX: number
  ): void {
    // Radar background
    this.ctx.fillStyle = COLORS.radarBg;
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, RADAR_HEIGHT);
    
    // Radar border
    this.ctx.strokeStyle = '#004400';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(0, 0, CANVAS_WIDTH, RADAR_HEIGHT);

    const scale = CANVAS_WIDTH / WORLD_WIDTH;
    const radarY = RADAR_HEIGHT / 2;

    // Draw terrain line
    this.ctx.strokeStyle = COLORS.terrain;
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(0, RADAR_HEIGHT - 2);
    this.ctx.lineTo(CANVAS_WIDTH, RADAR_HEIGHT - 2);
    this.ctx.stroke();

    // Draw humans
    this.ctx.fillStyle = COLORS.radarHuman;
    for (const human of humans) {
      if (!human.isAlive()) continue;
      const rx = human.x * scale;
      this.ctx.fillRect(rx - 1, RADAR_HEIGHT - 6, 2, 4);
    }

    // Draw landers
    this.ctx.fillStyle = COLORS.radarLander;
    for (const lander of landers) {
      if (!lander.isAlive()) continue;
      const rx = lander.x * scale;
      const ry = (lander.y / GROUND_Y) * (RADAR_HEIGHT - 4) + 2;
      this.ctx.fillRect(rx - 1, ry - 1, 3, 3);
    }

    // Draw ship (white, centered marker)
    if (ship.alive) {
      const rx = ship.x * scale;
      this.ctx.fillStyle = COLORS.radarShip;
      this.ctx.beginPath();
      this.ctx.arc(rx, radarY, 3, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Viewport indicator
    const viewLeft = wrapX(cameraX - CANVAS_WIDTH / 2) * scale;
    const viewWidth = CANVAS_WIDTH * scale;
    this.ctx.strokeStyle = '#444444';
    this.ctx.strokeRect(viewLeft, 2, viewWidth, RADAR_HEIGHT - 4);
  }

  drawHUD(score: number, lives: number, wave: number, humansAlive: number): void {
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '14px monospace';

    // Score (left)
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`SCORE: ${score}`, 10, CANVAS_HEIGHT - 10);

    // Lives (center-left)
    this.ctx.fillText(`LIVES: ${lives}`, 150, CANVAS_HEIGHT - 10);

    // Wave (center)
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`WAVE ${wave}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 10);

    // Humans (right)
    this.ctx.textAlign = 'right';
    this.ctx.fillText(`HUMANS: ${humansAlive}`, CANVAS_WIDTH - 10, CANVAS_HEIGHT - 10);
  }

  render(
    ship: Ship,
    lasers: Laser[],
    landers: Lander[],
    humans: Human[],
    terrain: TerrainPoint[],
    score: number,
    lives: number,
    wave: number
  ): void {
    // Camera follows ship with lead in facing direction
    const cameraX = ship.x + ship.facing * 100;

    this.clear();
    this.drawBackground();
    this.drawTerrain(terrain, cameraX);
    this.drawHumans(humans, cameraX);
    this.drawLanders(landers, cameraX);
    this.drawShip(ship, cameraX);
    this.drawLasers(lasers, cameraX);
    this.drawRadar(ship, landers, humans, cameraX);
    
    const humansAlive = humans.filter(h => h.isAlive()).length;
    this.drawHUD(score, lives, wave, humansAlive);
  }
}
