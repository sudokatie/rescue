// Minimum swipe distance in pixels
const SWIPE_THRESHOLD = 30;

export class Input {
  private pressedKeys: Set<string> = new Set();
  private boundKeyDown: ((e: KeyboardEvent) => void) | null = null;
  private boundKeyUp: ((e: KeyboardEvent) => void) | null = null;
  
  // Touch tracking
  private touchStartX: number = 0;
  private touchStartY: number = 0;
  private touchStartTime: number = 0;
  private virtualKeys: Set<string> = new Set();

  attach(): void {
    this.boundKeyDown = this.handleKeyDown.bind(this);
    this.boundKeyUp = this.handleKeyUp.bind(this);

    window.addEventListener('keydown', this.boundKeyDown);
    window.addEventListener('keyup', this.boundKeyUp);
    window.addEventListener('touchstart', this.handleTouchStart, { passive: false });
    window.addEventListener('touchend', this.handleTouchEnd, { passive: false });
    window.addEventListener('touchmove', this.handleTouchMove, { passive: false });
  }

  detach(): void {
    if (this.boundKeyDown) {
      window.removeEventListener('keydown', this.boundKeyDown);
    }
    if (this.boundKeyUp) {
      window.removeEventListener('keyup', this.boundKeyUp);
    }
    window.removeEventListener('touchstart', this.handleTouchStart);
    window.removeEventListener('touchend', this.handleTouchEnd);
    window.removeEventListener('touchmove', this.handleTouchMove);
    this.pressedKeys.clear();
    this.virtualKeys.clear();
  }
  
  private handleTouchStart = (event: TouchEvent): void => {
    if (event.touches.length !== 1) return;
    const touch = event.touches[0];
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
    this.touchStartTime = Date.now();
    event.preventDefault();
  };

  private handleTouchMove = (event: TouchEvent): void => {
    if (event.touches.length !== 1) return;
    const touch = event.touches[0];
    const deltaX = touch.clientX - this.touchStartX;
    const deltaY = touch.clientY - this.touchStartY;
    event.preventDefault();

    // Clear previous virtual keys
    this.virtualKeys.clear();

    // Horizontal movement
    if (deltaX > SWIPE_THRESHOLD) {
      this.virtualKeys.add('ArrowRight');
    } else if (deltaX < -SWIPE_THRESHOLD) {
      this.virtualKeys.add('ArrowLeft');
    }

    // Vertical movement
    if (deltaY > SWIPE_THRESHOLD) {
      this.virtualKeys.add('ArrowDown');
    } else if (deltaY < -SWIPE_THRESHOLD) {
      this.virtualKeys.add('ArrowUp');
    }
  };

  private handleTouchEnd = (event: TouchEvent): void => {
    const deltaTime = Date.now() - this.touchStartTime;
    event.preventDefault();

    // Quick tap = fire (Space)
    if (deltaTime < 200 && this.virtualKeys.size === 0) {
      // Simulate quick space press
      this.virtualKeys.add('Space');
      setTimeout(() => {
        this.virtualKeys.delete('Space');
      }, 100);
    } else {
      this.virtualKeys.clear();
    }
  };

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
    return this.pressedKeys.has(key) || this.virtualKeys.has(key);
  }

  getPressed(): Set<string> {
    const all = new Set(this.pressedKeys);
    this.virtualKeys.forEach(k => all.add(k));
    return all;
  }

  clear(): void {
    this.pressedKeys.clear();
    this.virtualKeys.clear();
  }
}
