import { Directions, createThrottle } from "../../utility/Utility";
import { CastType } from "./Cast";
import { Entity } from "./Entity";

/**
 * The base class that NPCs who can move on a tiled map should inherit from.
 */
export class Moveable extends Entity {
  public isMoving = false;
  // TODO: Refactor this to be a state
  protected velocityX = 0;
  protected velocityY = 0;
  protected movementSpeed = 8;
  protected target = { x: 0, y: 0 };
  protected spriteKey: string;
  protected facing: Directions = Directions.down;
  constructor({ scene, x, y, key }) {
    super({ scene, x, y, key });
    this.spriteKey = key;
  }
  public face(direction: Directions) {
    this.facing = direction;
    switch (direction) {
      case Directions.up:
        this.setFrame(3);
        break;
      case Directions.left:
        this.setFrame(7);
        break;
      case Directions.right:
        this.setFrame(7);
        break;
      default:
        this.setFrame(0);
    }
  }
  public teleportToTarget() {
    this.x = this.target.x;
    this.y = this.target.y;
  }
  /**
   * Called until the Moving character reaches the destination
   */
  protected moveToTarget() {
    if (this.x === this.target.x && this.y === this.target.y) {
      this.isMoving = false;
      this.queryUnderfoot();
      this.emit("finished-movement");
    } else {
      if (this.x !== this.target.x) {
        this.x += this.velocityX;
      }
      if (this.y !== this.target.y) {
        this.y += this.velocityY;
      }
    }
  }
  public stop() {
    this.facing = Directions.down;
    this.target = this.getTileBelowFoot();
  }
  public move(direction: Directions, callback: Function, spaces?: number) {
    this.facing = direction;
    this.target = this.getTileInFront();
    this.handleMovement(this.facing, callback);
  }
  private handleMovement(direction: Directions, callback?: Function) {
    const marker = { x: null, y: null };
    marker.x = Math.floor(this.target.x / 64);
    marker.y = Math.floor(this.target.y / 64);
    const backgroundTile = this.currentMap.getTileAt(
      marker.x,
      marker.y,
      true,
      "background"
    );
    const foregroundTile = this.currentMap.getTileAt(
      marker.x,
      marker.y,
      true,
      "foreground"
    );

    if (this.tileIsOpen(backgroundTile, foregroundTile)) {
      this.isMoving = true;
      const movementSpeed =
        direction === Directions.right || direction === Directions.down
          ? +this.movementSpeed
          : -this.movementSpeed;
      if (direction === Directions.right || direction === Directions.left) {
        this.velocityX = movementSpeed;
      } else {
        this.velocityY = movementSpeed;
      }
      if (callback) {
        callback();
      }
      if (this.currentTile) {
        this.currentTile.properties["collide"] = false;
        this.currentTile = foregroundTile;
        this.currentTile.properties["collide"] = true;
      }
    } else {
      this.anims.stop();
      this.face(direction);
      this.emit("hit-wall");
    }
  }

  private tileIsOpen(backgroundTile, foregroundTile) {
    const backgroundTileIsOpen =
      backgroundTile && !backgroundTile.properties["collide"];
    const foregroundTileIsOpen =
      foregroundTile && !foregroundTile.properties["collide"];
    return backgroundTileIsOpen && foregroundTileIsOpen;
  }

  public queryObject = createThrottle(300, () => {
    const coords = this.getTileInFront();
    this.emitCast(coords, CastType.reach);
  });

  private getTileInFront(): { x: number; y: number } {
    switch (this.facing) {
      case Directions.right:
        return { x: this.x + 64, y: this.y };
      case Directions.left:
        return { x: this.x - 64, y: this.y };
      case Directions.down:
        return { x: this.x, y: this.y + 64 };
      default:
        return { x: this.x, y: this.y - 64 };
    }
  }
}

export class Controllable {
  private keys: Map<string, Phaser.Input.Keyboard.Key>;
  public disabled = false;
  setDisabled(disabled) {
    this.disabled = disabled;
  }
  constructor(private scene: Phaser.Scene, private moveable: Moveable) {
    this.keys = new Map([
      ["LEFT", this.addKey("LEFT")],
      ["RIGHT", this.addKey("RIGHT")],
      ["DOWN", this.addKey("DOWN")],
      ["UP", this.addKey("UP")],
      ["SPACE", this.addKey("SPACE")],
    ]);
  }
  private addKey(key: string): Phaser.Input.Keyboard.Key {
    return this.scene.input.keyboard.addKey(key);
  }
  public handleInput() {
    //TODO: Refactor to use general animations.
    // Movement should bootstrap a specific animation object namespaced
    // to the sprite it belongs to. ex walkV-lo, walkV-ryan etc.
    if (this.keys.get("RIGHT").isDown && !this.disabled) {
      this.moveable.setFlipX(true);
      this.moveable.move(Directions.right, () =>
        this.moveable.anims.play("lo-walkV", true)
      );
    } else if (this.keys.get("LEFT").isDown && !this.disabled) {
      this.moveable.setFlipX(false);
      this.moveable.move(Directions.left, () =>
        this.moveable.anims.play("lo-walkV", true)
      );
    } else if (this.keys.get("DOWN").isDown && !this.disabled) {
      this.moveable.move(Directions.down, () =>
        this.moveable.anims.play("lo-walkDown", true)
      );
    } else if (this.keys.get("UP").isDown && !this.disabled) {
      this.moveable.move(Directions.up, () =>
        this.moveable.anims.play("lo-walkUp", true)
      );
    } else if (Phaser.Input.Keyboard.JustDown(this.keys.get("SPACE"))) {
      this.moveable.queryObject();
    }
  }
}
