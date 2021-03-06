import { Explore } from "../../scenes/exploration/exploreScene";
import { State } from "../state/State";
import { Interactive } from "../../components/entities/Interactive";
import { NPC, BossMonster } from "../../components/entities/NPC";
import { Directions, getObjectPropertyByName, hasProperty } from "../Utility";
import { InteractivesController } from "../../data/controllers/InteractivesController";
import { ItemSwitch } from "../../components/entities/ItemSwitch";
import { WarpController } from "../../data/controllers/WarpController";
import { EntityTypes } from "../../components/entities/Entity";
import { Warp, WarpTrigger, Spawn } from "../../components/entities/Warp";
import { Chest } from "../../components/entities/Chest";
import { LockedDoor } from "../../components/entities/LockedDoor";
import { KeyItem } from "../../components/entities/Items/KeyItem";
import { Block, PitBlock } from "../../components/entities/Block";
import { Switcher } from "../../components/entities/Switchable";
import { CircuitController } from "../../data/controllers/CircuitController";

interface MapObject {}

interface ExploreData {
  interactives: Phaser.GameObjects.Sprite[];
}

export class MapObjectFactory {
  /**
   * Handles loading objects on the Explore scenes.
   */
  private stateManager: State;
  private interactivesController: InteractivesController;
  private warpController: WarpController;
  constructor(private scene: Explore) {
    //TODO: Use events to refactor having to pass casts down from scene to every npc;
    this.stateManager = State.getInstance();
    this.interactivesController = new InteractivesController(scene.game);
    this.warpController = new WarpController(scene.game);
  }

  public getDataToLoad(): ExploreData {
    const exploreData: ExploreData = {
      interactives: [],
    };
    const objects = this.scene.map.getObjectLayer("objects").objects as any[];
    // ===================================
    // Lay Objects down
    // ===================================

    objects.forEach((object) => {
      // ===================================
      // Interactives
      // ===================================
      if (object.type === "interactive") {
        const interactive = this.createInteractive(object);
        exploreData.interactives.push(interactive);
      }

      //TODO: Eventually switch all interactives to this new system
      // deprecating the above
      if (object.type === "interactive-object") {
        const interactive = this.createInteractiveObject(object);
        exploreData.interactives.push(interactive);
      }

      if (object.type === "block") {
        const block = this.createBlock(object);
        exploreData.interactives.push(block);
      }

      if (object.type === "pit-block") {
        const block = this.createPitBlock(object);
        exploreData.interactives.push(block);
      }

      if (object.type === "switch") {
        const switchObject = this.createSwitch(object);
        exploreData.interactives.push(switchObject);
      }

      // ===================================
      // warps
      // ===================================
      if (object.type === "spawn") {
        const spawn = this.createSpawn(object);
        exploreData.interactives.push(spawn);
      }

      if (object.type === "warp" || object.type === "warp-tile") {
        const warp = this.createWarp(object, object.type === "warp-tile");
        exploreData.interactives.push(warp);
      }

      // ===================================
      // Handle placing the NPC
      // ===================================
      if (object.type === "npc") {
        const npc = this.createNpc(object);
        exploreData.interactives.push(npc);
      }

      // ===================================
      // Handle placing the Bossmonster
      // ===================================
      if (object.type === "boss-monster") {
        const bossMonster = this.createBossMonster(object);
        exploreData.interactives.push(bossMonster);
      }

      // ===================================
      // Handle placing the chest
      // ===================================
      if (object.type === "chest") {
        const chest = this.createChest(object);
        exploreData.interactives.push(chest);
      }

      // ===================================
      // Handle placing locked door.
      // ===================================
      if (object.type === "door") {
        const door = this.createDoor(object);
        door && exploreData.interactives.push(door);
      }
      // ===================================
      // Handle placing key item
      // ===================================
      if (object.type === "key-item") {
        const keyItem = this.createKeyItem(object);
        exploreData.interactives.push(keyItem);
      }
    });
    return exploreData;
  }

  private createInteractive(object) {
    const id = getObjectPropertyByName("dialogId", object.properties);
    const eventId = getObjectPropertyByName("eventId", object.properties);
    return new Interactive({
      scene: this.scene,
      x: object.x + 32,
      y: object.y + 32,
      message: id && this.stateManager.dialogController.getDialogById(id),
      eventId: eventId,
    });
  }

  private createInteractiveObject(object) {
    const interactiveId = getObjectPropertyByName(
      "interactiveId",
      object.properties
    );
    const interactiveObject = this.interactivesController.getInteractiveById(
      interactiveId
    );
    if (interactiveObject.category === "item-switch") {
      return new ItemSwitch(
        {
          scene: this.scene,
          x: object.x + 32,
          y: object.y + 32,
        },
        interactiveObject
      );
    }
  }

  /** Multi-use switches that flip flag state */
  private createSwitch(object) {
    const circuitId = getObjectPropertyByName("circuitId", object.properties);
    const cc = new CircuitController(this.scene.game);
    const circuit = cc.getCircuitById(circuitId);
    return new Switcher(
      {
        scene: this.scene,
        x: object.x + 32,
        y: object.y + 32,
      },
      circuit
    );
  }

  /** Blocks that change position depending on flag state */
  private createBlock(object) {
    const circuitId = getObjectPropertyByName("circuitId", object.properties);
    const cc = new CircuitController(this.scene.game);
    const circuit = cc.getCircuitById(circuitId);
    const erect = cc.circuitIsActive(circuit.id);
    return new Block(
      {
        scene: this.scene,
        x: object.x + 32,
        y: object.y + 32,
      },
      erect,
      circuit
    );
  }

  /** Pit Blocks that change position depending on flag state */
  private createPitBlock(object) {
    const circuitId = getObjectPropertyByName("circuitId", object.properties);
    const cc = new CircuitController(this.scene.game);
    const circuit = cc.getCircuitById(circuitId);
    const erect = cc.circuitIsActive(circuit.id);
    return new PitBlock(
      {
        scene: this.scene,
        x: object.x + 32,
        y: object.y + 32,
      },
      erect,
      circuit
    );
  }

  private createWarp(object, isWarpTile) {
    const warpId = getObjectPropertyByName("warpId", object.properties);
    const warpData = this.warpController.getWarpById(warpId);
    const warpConfig = {
      scene: this.scene,
      x: object.x + 32,
      y: object.y + 32,
      warpId,
      key: null,
      event: warpData.event,
      placementFlags: warpData.placementFlags,
    };

    const warp = isWarpTile
      ? new Warp(warpConfig)
      : new WarpTrigger(warpConfig);

    return warp;
  }

  private createSpawn(object) {
    const spawnConfig = {
      scene: this.scene,
      x: object.x + 32,
      y: object.y + 32,
    };
    return new Spawn(spawnConfig);
  }

  private createTrigger(object) {
    throw new Error("Not Yet Implemented");
  }

  private createNpc(object) {
    const id = getObjectPropertyByName("npcId", object.properties);
    const eventId = getObjectPropertyByName("eventId", object.properties);
    const npc = this.stateManager.npcController.getNPCById(id);
    const npcObject = new NPC(
      {
        scene: this.scene,
        key: npc.spriteKey,
      },
      npc.facing !== undefined ? npc.facing : Directions.up,
      npc.dialog,
      npc.placement,
      eventId
    );
    return npcObject;
  }

  private createBossMonster(object) {
    const id = getObjectPropertyByName("npcId", object.properties);
    const npc = this.stateManager.npcController.getNPCById(id);
    const npcObject = new BossMonster(
      {
        scene: this.scene,
        key: npc.spriteKey,
      },
      npc.encounterId,
      Directions.up,
      npc.dialog,
      npc.placement
    );
    return npcObject;
  }

  /** todo: Move the metadata to a chests.json file */
  private createChest(object) {
    const itemId = getObjectPropertyByName("itemId", object.properties);
    const flagId = getObjectPropertyByName("flagId", object.properties);
    const locked = getObjectPropertyByName("locked", object.properties);
    const unlockItemId = getObjectPropertyByName(
      "unlockItemId",
      object.properties
    );
    const chest = new Chest(
      {
        scene: this.scene,
        x: object.x + 32,
        y: object.y + 32,
        properties: {
          flagId,
          itemId,
          type: EntityTypes.chest,
        },
      },
      locked && unlockItemId
    );
    if (this.stateManager.isFlagged(flagId)) {
      chest.setOpen();
    } else if (locked) {
      chest.lock();
    }

    return chest;
  }

  private createDoor(object) {
    const flagId = getObjectPropertyByName("flagId", object.properties);
    const keyItem = getObjectPropertyByName("keyItem", object.properties);
    const lockMessage = getObjectPropertyByName(
      "lockMessage",
      object.properties
    );
    const unlockMessage = getObjectPropertyByName(
      "unlockMessage",
      object.properties
    );
    if (!this.stateManager.isFlagged(flagId)) {
      const door = new LockedDoor(
        {
          scene: this.scene,
          x: object.x + 32,
          y: object.y + 32,
        },
        flagId,
        keyItem || 7,
        lockMessage || object.lockMessage,
        unlockMessage || object.unlockMessage
      );
      return door;
    }
    return false;
  }

  private createKeyItem(object) {
    const itemId = getObjectPropertyByName("itemId", object.properties);
    const item = this.stateManager.getItem(itemId);
    const flagId = item.flagId;
    const placementFlags = item.placementFlags;

    return new KeyItem({
      scene: this.scene,
      x: object.x + 32,
      y: object.y + 32,
      spriteKey: item.spriteKey,
      frame: item.frame,
      flagId,
      itemId,
      placementFlags,
    });
  }
}
