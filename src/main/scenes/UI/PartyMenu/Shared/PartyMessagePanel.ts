import { PanelContainer } from "../../../../components/UI/PanelContainer";
import { PartyMember } from "../../../../components/battle/PartyMember";
import { TextFactory } from "../../../../utility/TextFactory";
import { MessagePanel } from "./MessagePanel";
import { BLACK } from "../../../../utility/Constants";

export class PartyMessagePanel extends MessagePanel {
  protected currentText: Phaser.GameObjects.Text;
  constructor(public scene, dimensions: Coords, position: Coords) {
    super(scene, dimensions, position);
    this.show();
    this.clearPanelContainerByType("Text");
  }

  public populateStatsPanel(member: PartyMember) {
    this.clearPanelContainerByType("Text");
    // Name, level, hp mp xp to next level,
    // str, sta, dex, int, wis,
    //class
    const tf = new TextFactory(this.scene);
    const name = tf.createText(member.name, { x: 20, y: 10 }, "20px");
    const level = tf.createText(
      `Lvl.${member.level} ${member.combatClass.name} - Next Lvl:  ${Math.floor(
        member.getExperienceToNextLevel() - member.currentExperience
      )} `,
      { x: 20, y: 35 },
      "16px"
    );
    const hp = tf.createText(
      `HP: ${member.currentHp}/${member.getMaxHp()}`,
      { x: 20, y: 60 },
      "20px"
    );
    const mp = tf.createText(
      `MP: ${member.currentMp}/${member.getMaxMp()}`,
      { x: 20, y: 85 },
      "20px"
    );

    const str = tf.createText(
      `STR: ${member.getStrength()}`,
      { x: 170, y: 60 },
      "20px"
    );
    const sta = tf.createText(
      `STA: ${member.getStamina()}`,
      { x: 170, y: 85 },
      "20px"
    );
    const dex = tf.createText(
      `DEX: ${member.getDexterity()}`,
      { x: 170, y: 110 },
      "20px"
    );
    const int = tf.createText(
      `INT: ${member.getIntellect()}`,
      { x: 285, y: 60 },
      "20px"
    );
    const wis = tf.createText(
      `WIS: ${member.getWisdom()}`,
      { x: 285, y: 85 },
      "20px"
    );
    const pres = tf.createText(
      `PRES: ${member.getDefensePower()}`,
      { x: 20, y: 110 },
      "20px"
    );
    const mres = tf.createText(
      `MRES: ${member.getMagicResist()}`,
      { x: 20, y: 135 },
      "20px"
    );
    this.add([name, level, hp, mp, str, sta, dex, int, wis, pres, mres]);
  }
  /**
   * Function that results after the message scene is done doing its thing.
   * @param message
   */
  public displayMessage(message: string) {
    this.currentText && this.clearPanelContainerByType("Text");
    this.currentText = this.scene.add.text(
      this.panel.x + 20,
      this.panel.y + 20,
      message,
      {
        fontFamily: "pixel",
        fontSize: "32px",
        fill: BLACK.hex,
        wordWrap: {
          width: (this.panel.width / 4.5) * 4,
          useAdvancedWrap: true,
        },
      }
    );
    this.add(this.currentText);
    this.currentText.setScrollFactor(0);
  }
}
