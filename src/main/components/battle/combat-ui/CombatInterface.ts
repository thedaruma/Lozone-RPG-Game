import { UserInterface } from "../../UI/UserInterface";
import { TextFactory } from "../../../utility/TextFactory";
import { CombatEvent, UseItemEvent } from '../CombatEvent';
import { Orientation, CombatActionTypes, CombatEntity } from '../CombatDataStructures';
import { PartyMember } from "../PartyMember";
import { Combatant } from "../Combatant";
import { UIPanel, PanelContainer } from "../../UI/PanelContainer";
import { KeyboardControl } from "../../UI/Keyboard";
import { State } from "../../../utility/state/State";

export class CombatInterface extends UserInterface {
  private textFactory: TextFactory;
  private enemyTargetPanel: UIPanel;
  private partyTargetPanel: UIPanel;
  private itemPanel: UIPanel;
  private statusPanel: PanelContainer;
  private mainPanel: UIPanel;
  private currentPartyMember: Combatant;

  constructor(
    scene: Phaser.Scene,
    spriteKey: string,
    private party: CombatEntity[],
    private enemies: CombatEntity[]
  ) {
    super(scene, spriteKey, new KeyboardControl(scene));
    this.textFactory = new TextFactory(scene);
    //TODO: Refactor the combat interface logic here.
  }
  public create(partyMember: Combatant) {
    this.currentPartyMember = partyMember;
    this.createMainPanel();
    this.createStatusPanel();

    this.mainPanel.addChildPanel("status", this.statusPanel);
    this.showPanel(this.mainPanel).focusPanel(this.mainPanel);

    this.createEnemyTargetPanel();
    this.createPartyTargetPanel();
    this.createItemPanel();
  }

  private createMainPanel() {
    this.mainPanel = this.createUIPanel({ x: 3, y: 3 }, { x: 0, y: 6 }, false)
      .addOption("Attack", () => {
        this.showPanel(this.enemyTargetPanel).focusPanel(this.enemyTargetPanel);
      })
      .addOption("Defend", () => {
        const event = new CombatEvent(
          this.currentPartyMember,
          null,
          CombatActionTypes.defend,
          Orientation.left,
          this.scene
        );
        this.events.emit("option-selected", event);
      })
      .addOption("Item", () => this.showPanel(this.itemPanel).focusPanel(this.itemPanel))
      .addOption("Run", () => {
        this.scene.events.emit("run-battle");
      });

    this.setEventOnPanel(this.mainPanel, "keydown", event => {
      if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.ESC) {
        //TODO: Handle iterating backward through the combat input loop.
      }
    });
  }

  private createEnemyTargetPanel() {
    this.enemyTargetPanel = this.createUIPanel({ x: 7, y: 3 }, { x: 3, y: 6 });

    this.enemies.forEach(enemyCombatant => {
      this.enemyTargetPanel.addOption(enemyCombatant.entity.name, () => {
        const event = new CombatEvent(
          this.currentPartyMember,
          enemyCombatant.entity,
          CombatActionTypes.attack,
          Orientation.left,
          this.scene
        );
        this.events.emit("option-selected", event);
      });
    });
  }

  private createItemPanel() {
    this.itemPanel = this.createUIPanel({ x: 7, y: 3 }, { x: 3, y: 6 });
    const sm = State.getInstance();
    const consumeables = sm.getConsumeablesOnPlayer();
    consumeables.forEach(item => {
      // Create list of items to use in battle.
      this.itemPanel.addOption(`${item.name} x${item.quantity}`, () => {
        // On item use, show party member panel
        this.itemPanel.closePanel();
        this.showPanel(this.partyTargetPanel).focusPanel(this.partyTargetPanel);
        this.partyTargetPanel.on('party-member-chosen', (partyMember) => {
          this.partyTargetPanel.off("party-member-chosen");
          const event = new UseItemEvent(
            this.currentPartyMember,
            partyMember.entity,
            CombatActionTypes.useItem,
            Orientation.left,
            this.scene,
            item,
          );
          this.events.emit('option-selected', event);
        })
      })
    })

  }

  private createPartyTargetPanel() {
    this.partyTargetPanel = this.createUIPanel({ x: 7, y: 3 }, { x: 3, y: 6 });

    this.party.forEach(partyMember => {
      this.partyTargetPanel.addOption(partyMember.entity.name, () => {
        this.partyTargetPanel.emit("party-member-chosen", partyMember);
      });
    });
  }



  private createStatusPanel() {
    this.statusPanel = this.createPresentationPanel(
      { x: 4, y: 3 },
      { x: 3, y: 6 }
    );
    const combatant = this.currentPartyMember;
    const statusTextSize = "32px";
    const name = this.textFactory.createText(
      combatant.name,
      { x: 20, y: 10 },
      statusTextSize
    );
    const hp = this.textFactory.createText(
      `HP: ${combatant.currentHp}/${combatant.getMaxHp()}`,
      { x: 20, y: 50 },
      statusTextSize
    );
    const mp = this.textFactory.createText(
      `MP: ${combatant.currentMp}/${combatant.getMaxMp()}`,
      { x: 20, y: 90 },
      statusTextSize
    );
    [hp, mp, name].forEach(gameObject => {
      this.scene.add.existing(gameObject);
      this.statusPanel.add(gameObject);
    });

    return this.statusPanel;
  }
}
