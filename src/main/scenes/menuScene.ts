import { UserInterface } from "../components/UI/UserInterface";
import { State } from "../utility/state/State";
import { UIPanel } from "../components/UI/PanelContainer";
import { Item } from "../components/entities/Item";


export class MenuScene extends Phaser.Scene {
  private UI: UserInterface;
  private callingSceneKey: string;
  private state: State = State.getInstance();
  constructor() {
    super({ key: 'MenuScene' });
  }
  preload(): void {
    // Handle loading assets here, adding sounds etc
  }
  init(data) {
    this.callingSceneKey = data.callingSceneKey;
    this.UI = new UserInterface(this, 'dialog-white');

    const sm = State.getInstance();
    const mainPanel = this.UI.createUIPanel({ x: 4, y: 9 }, { x: 0, y: 0 });
    mainPanel
      .addOption('Items', () => {
        this.UI.showPanel(itemPanel).focusPanel(itemPanel)
      })
      .addOption('Party', () => {
        this.UI.showPanel(partyPanel).focusPanel(partyPanel)
      })
      .addOption('Dungeons', () => {
        this.UI.showPanel(dungeonPanel).focusPanel(dungeonPanel)
      })
      .addOption('Credits', () => {
        this.scene.stop(this.callingSceneKey)
        this.scene.start('CreditsScene');
      })
      .addOption('Cancel', () => this.closeMenuScene());

    this.UI.showPanel(mainPanel).focusPanel(mainPanel);

    const itemPanel = this.createItemPanel();

    const itemConfirmPanel = this.createItemConfirmPanel();

    itemPanel.on('show-and-focus-confirm-panel', item => {
      this.UI.showPanel(itemConfirmPanel);
      this.UI.focusPanel(itemConfirmPanel);
      itemConfirmPanel.setPanelData(item);
    });

    itemConfirmPanel.on('refresh-items', () => {
      itemPanel.refreshPanel();
    });

    const partyPanel = this.createPartyPanel();

    const dungeonPanel = this.createDungeonPanel();

    this.input.keyboard.on('keydown', event => {
      if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.Z) {
        this.closeMenuScene();
      }

    });

    this.events.once('close', () => this.closeMenuScene());
    this.UI.initialize();
  }

  closeMenuScene() {
    //TODO: Make more generic
    this.scene.setActive(true, this.callingSceneKey)
    this.scene.stop();
  }
  private createItemPanel() {
    const itemPanel = new ItemPanelContainer({ x: 6, y: 9 }, { x: 4, y: 0 }, 'dialog-white', this, this.state.getItemsOnPlayer());
    this.UI.addPanel(itemPanel)
    itemPanel.on('item-selected', (item) => {
      itemPanel.emit('show-and-focus-confirm-panel', item);
    });
    itemPanel.on('panel-close', () => {
      this.UI.closePanel(itemPanel);
    });
    return itemPanel;
  }
  private createItemConfirmPanel() {
    // Add item use confirmation panel.
    const itemConfirmPanel = new ConfirmItemPanelContainer({ x: 3, y: 3 }, { x: 7, y: 6 }, 'dialog-white', this);

    this.UI.addPanel(itemConfirmPanel);
    // Add option for confirmation
    itemConfirmPanel.addOption('Use', () => {
      const item = itemConfirmPanel.getPanelData();
      this.state.consumeItem(item.id);
      itemConfirmPanel.emit('refresh-items');

      this.UI.closePanel(itemConfirmPanel);

    }).addOption('Drop', () => {
      const item = itemConfirmPanel.getPanelData();
      this.state.removeItemFromContents(item.id);
      itemConfirmPanel.emit('refresh-items');

      this.UI.closePanel(itemConfirmPanel);
    }).addOption('Cancel', () => {
      this.UI.closePanel(itemConfirmPanel);
    });
    return itemConfirmPanel;
  }
  private createPartyPanel() {
    const partyPanel = this.UI.createUIPanel({ x: 6, y: 9 }, { x: 4, y: 0 }).addOption('Cancel', () => {
      this.UI.closePanel(partyPanel);
    });
    return partyPanel;
  }
  private createDungeonPanel() {
    const dungeonPanel = this.UI.createUIPanel({ x: 6, y: 9 }, { x: 4, y: 0 })
      .addOption('Dungeon One', () => {
        this.scene.stop('House')
        this.scene.start('Dungeon', { map: 'dungeon_1', tileset: 'dungeon', warpId: 1, enemyPartyIds: [8, 6, 4, 3, 13] });

      })
      .addOption('Cancel', () => {
        this.UI.closePanel(dungeonPanel);
      });
      return dungeonPanel;
  }
  update(): void { }
}

// Refresh all panels in UI.
// Make refreshPanel something you can do on a UIPanel
// Focus and show panel by names.

class ConfirmItemPanelContainer extends UIPanel {
  private itemData: Item;
  constructor(dimensions: Coords,
    pos: Coords,
    spriteKey: string,
    scene: Phaser.Scene, id?: string) {
    super(dimensions, pos, spriteKey, scene, true, id);

  }
  setPanelData(item: Item) {
    this.itemData = item;
  }
  getPanelData() {
    return this.itemData;
  }
}

class ItemPanelContainer extends UIPanel {
  constructor(dimensions: Coords,
    pos: Coords,
    spriteKey: string,
    scene: Phaser.Scene, private items: Item[]) {
    super(dimensions, pos, spriteKey, scene);
    this.addOptionsViaData();
  }
  setPanelData(items: Item[]) {
    this.items = items;
  }
  addOptionsViaData() {
    this.items.forEach(item => {
      // Item Options
      this.addOption(`${item.name} x${item.quantity}`, () => {
        this.emit('item-selected', item);
      });
    });
    this.addOption('Cancel', () => {
      this.emit('panel-close');
    })
  }
  public refreshPanel() {
    this.list = this.list.filter(item => item.type !== "Text");
    this.options = [];
    this.addOptionsViaData();
  }

}