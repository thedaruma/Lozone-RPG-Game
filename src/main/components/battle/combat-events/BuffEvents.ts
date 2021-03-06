import { CombatResult } from "./../CombatDataStructures";
import { CombatEvent } from "./CombatEvent";
import { CombatActionTypes, Orientation } from "../CombatDataStructures";
import { Combatant } from "../Combatant";
import { Enchantment } from "../../../data/repositories/CombatInfluencerRepository";
import { playCombatText } from "../../../utility/tweens/text";
//TODO: This
export class BuffEvent extends CombatEvent {
  constructor(
    enchanted: Combatant,
    orientation: Orientation,
    scene: Phaser.Scene
  ) {
    super(enchanted, null, null, orientation, scene);
  }
}

/** For regen spells and poison spells */
export class PostTurnEnchantment extends CombatEvent {
  constructor(
    private enchanted: Combatant,
    private enchantedParty: Combatant[],
    private enchantment: Enchantment,
    orientation: Orientation,
    scene: Phaser.Scene
  ) {
    super(enchanted, null, null, orientation, scene);
  }
  public async executeAction(): Promise<CombatResult[]> {
    return new Promise(async (resolve) => {
      const result = this.enchantment.applyEnchantment(
        this.enchanted,
        null,
        this.enchantedParty
      );
      const text = this.createCombatText(
        result.value.toString(),
        this.enchanted,
        result.color,
        60
      );
      await playCombatText(text, this.scene);
      return resolve([
        {
          actionType: CombatActionTypes.enchantment,
          executor: null,
          target: this.enchanted,
          resultingValue: result.value,
          targetDown: this.enchanted.currentHp <= 0,
        },
      ]);
    });
  }
}

/** Handle things like extra elemental damage on the enemy,
 * or absorbing HP on attack
 */
export class PostAttackEnchantment extends CombatEvent {
  constructor(
    private enchanted: Combatant,
    private target: Combatant,
    private enchantment: Enchantment,
    orientation: Orientation,
    scene: Phaser.Scene
  ) {
    super(enchanted, null, null, orientation, scene);
  }
  public async executeAction(): Promise<CombatResult[]> {
    return new Promise(async (resolve) => {
      const result = await this.enchantment.applyEnchantment(
        this.enchanted,
        this.target,
        this.enchanted
          .getParty()
          .getMembers()
          .map((m) => m.entity),
        this.target
          .getParty()
          .getMembers()
          .map((m) => m.entity),
        this.scene
      );
      const texts = result.affected
        .filter((t) => t.currentHp > 0)
        .map((t) =>
          this.createCombatText(result.value.toString(), t, result.color, 60)
        );
      await Promise.all(texts.map((t) => playCombatText(t, this.scene)));
      return resolve([
        {
          actionType: CombatActionTypes.enchantment,
          executor: this.enchanted,
          target: this.target,
          resultingValue: result.value,
          targetDown: this.target.currentHp <= 0,
        },
      ]);
    });
  }
}
/** Handle things like sleep, paralysis, confusion, etc */
export class PreAttackEnchantment extends CombatEvent {
  constructor(
    private enchanted: Combatant,
    private target: Combatant,
    private enchantment: Enchantment,
    orientation: Orientation,
    scene: Phaser.Scene
  ) {
    super(enchanted, null, null, orientation, scene);
  }
  public async executeAction(): Promise<CombatResult[]> {
    return new Promise(async (resolve) => {
      const result = this.enchantment.applyEnchantment(this.enchanted);
      const text = this.createCombatText(
        result.value.toString(),
        this.enchanted,
        result.color,
        60
      );
      await playCombatText(text, this.scene);
      return resolve([
        {
          actionType: CombatActionTypes.enchantment,
          executor: this.enchanted,
          target: this.target,
          resultingValue: result.value,
          targetDown: this.target.currentHp <= 0,
        },
      ]);
    });
  }
}
