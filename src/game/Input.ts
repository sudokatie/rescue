export class Input {
  private pressedKeys: Set<string> = new Set();
  private boundKeyDown: ((e: KeyboardEvent) => void) | null = null;
  private boundKeyUp: ((e: KeyboardEvent) => void) | null = null;

  attach(): void {
    this.boundKeyDown = this.handleKeyDown.bind(this);
    this.boundKeyUp = this.handleKeyUp.bind(this);

    window.addEventListener('keydown', this.boundKeyDown);
    window.addEventListener('keyup', this.boundKeyUp);
  }

  detach(): void {
    if (this.boundKeyDown) {
      window.removeEventListener('keydown', this.boundKeyDown);
    }
    if (this.boundKeyUp) {
      window.removeEventListener('keyup', this.boundKeyUp);
    }
    this.pressedKeys.clear();
  }

  private handleKeyDown(e: KeyboardEvent): void {
    // Prevent default for game keys
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
      e.preventDefault();
    }
    this.pressedKeys.add(e.code);
  }

  private handleKeyUp(e: KeyboardEvent): void {
    this.pressedKeys.delete(e.code);
  }

  isPressed(key: string): boolean {
    return this.pressedKeys.has(key);
  }

  getPressed(): Set<string> {
    return new Set(this.pressedKeys);
  }

  clear(): void {
    this.pressedKeys.clear();
  }
}
