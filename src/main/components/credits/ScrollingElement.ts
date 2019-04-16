export class ScrollingElement extends Phaser.GameObjects.Image {
  /**
   * An element that destroys itself when it's far enough off screen.
   */
  private addedNew = false;
  constructor(private currentScene: Phaser.Scene, private startX: number, private startY: number, private key: string, private speedX: number, private speedY: number, private container: Phaser.GameObjects.Container) {
    super(currentScene, startX, startY, key);
    this.setOrigin(0, .5);
    this.currentScene.events.on('update', this.update, this);
  }
  checkIfDestroyable() {
    if (this.x >= 0 && !this.addedNew) {
      this.addNew();
    }
    if ((this.x > this.currentScene.game.config.width)) {
      this.currentScene.events.off('update', this.update, this);
      this.destroy(true);
      this.container.remove(this, true);
    }
  }
  addNew() {
    const newElement: ScrollingElement = new ScrollingElement(this.currentScene, -<number>this.width, this.startY, this.key, this.speedX, this.speedY, this.container);
    this.container.add(newElement);
    this.addedNew = true;
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.checkIfDestroyable();
  }
}
