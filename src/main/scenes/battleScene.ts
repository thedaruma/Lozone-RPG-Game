import { StateManager } from "../utility/state/StateManager";
import { CombatContainer } from "../components/battle/combat-grid/CombatContainer";
import { UserInterface } from "../components/UI/UserInterface";

export class BattleScene extends Phaser.Scene {
  private partyContainer: CombatContainer;
  private enemyContainer: CombatContainer;
  private UI: UserInterface;
  private previousSceneKey: string;
  constructor() {
    super('Battle');
  }
  init(data) {
    this.previousSceneKey = data.key;
    this.add.image(0, 0, 'dungeon_battle_background').setOrigin(0, 0).setScale(.5, .5);

    this.addAndPopulateContainers(data.enemies);
    this.createUI();

    // DEBUG
    this.input.keyboard.on('keydown', event => {
      if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.ESC) {
        this.endBattle();
      }
    });
    // DEBUG
  }
  private addAndPopulateContainers(enemies) {
    const sm = StateManager.getInstance();
    const party = sm.getCurrentParty();

    this.partyContainer = new CombatContainer({ x: 1, y: 3 }, this, party.getParty());
    this.enemyContainer = new CombatContainer({ x: 7, y: 3 }, this, enemies);

    this.add.existing(this.partyContainer);
    this.add.existing(this.enemyContainer);

    this.partyContainer.populateContainer();
    this.enemyContainer.populateContainerRandomly();
  }
  private createUI() {
    this.UI = new UserInterface(this, 'dialog-white');
    const mainPanel = this.UI.createPanel({ x: 3, y: 3 }, { x: 0, y: 6 })
      .addOption('Attack', () => {
      })
      .addOption('Defend', () => {
      })
      .addOption('Item', () => {
      })
      .addOption('Run', () => {
        this.endBattle();
      })
    this.UI.showPanel(mainPanel).focusPanel(mainPanel);
  }
  private endBattle() {
    this.scene.stop();
    this.scene.manager.wake(this.previousSceneKey);
    this.scene.bringToTop(this.previousSceneKey);
  }
}


