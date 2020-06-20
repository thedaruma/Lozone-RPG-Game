import { Modifier } from "./../../battle/CombatDataStructures";
import { Item } from "./Item";

export enum EquipmentSlot {
  weapon,
  chest,
  accessory,
}

export enum EquipmentType {
  sword,
  dagger,
  claws,
  accessory,
  armor,
}

/** Type of Item that can be equipped */
export class Equipment extends Item {
  constructor(
    id,
    name,
    description,
    effect,
    effectPotency,
    spriteKey,
    frame,
    category,
    quantity,
    sound,
    flagId,
    placementFlags,
    private slot: EquipmentSlot,
    private equipmentType: EquipmentType,
    private classes: number[],
    private characters: number[],
    private modifiers: Modifier[]
  ) {
    super(
      id,
      name,
      description,
      effect,
      effectPotency,
      spriteKey,
      frame,
      category,
      quantity,
      sound,
      flagId,
      placementFlags
    );
  }
  getModifiers() {
    return this.modifiers;
  }
  getSlot() {
    return this.slot;
  }
  getClasses() {
    return this.classes;
  }
  getType() {
    return this.equipmentType;
  }
  getCharacters() {
    return this.characters;
  }
}