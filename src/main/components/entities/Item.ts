import { Spell } from "../battle/CombatDataStructures";
import { SpellType } from "../../data/repositories/SpellRepository";
import { Combatant } from "../battle/Combatant";

export enum ItemCategory {
  consumable,
  keyItem,
  equipment,
}

export interface ItemData {
  id: number | string,
  name: string,
  description: string,
  spellId: number,
  effectPotency: number,
  spriteKey: string,
  frame: number,
  category: string,
  collectSound: string
}

export class Item {
  private limit = 99;
  private pendingUse: number = 0;
  constructor(
    public id: number | string,
    public name: string,
    public description: string,
    public effect: Spell,
    public effectPotency: number,
    public spriteKey: string,
    public frame: number,
    public category: ItemCategory,
    public quantity: number = 1,
    public collectSound: string) {
  }
  public incrementQuantity() {
    if (this.quantity >= this.limit) {
      this.quantity = this.quantity;
    }
    else {
      this.quantity++;
    }
  }
  public decrementQuantity() {
    if (this.quantity <= 0) {
      this.quantity = this.quantity;
    }
    else {
      this.quantity--;
    }
  }
  public setQuantity(amount: number) {
    this.quantity = amount;
  }

  public setIntendToUse(amount = 1) {
    this.pendingUse += amount;
  }

  public resetIntendToUse() {
    this.pendingUse = 0;
  }

  public canSetIntendToUse() {
    return this.getQuantity() >0;
  }

  public getQuantity(){
    return this.quantity-this.pendingUse;
  }

}

type ItemUseObject = {
  resource: string,
  resourceFull: boolean,
  resourceRecoverFunction: Function,
  item: Item
}


/**
 * Returns an object with meta-data pertaining to whether we can use an item on a target,
 * and which function to invoke when using the item, and the type of resource
 * the item affects.
 * Returns an object with whether the 
 * @param member The recipient of the item use
 * @param item The item being used
 */
export const handleItemUse = (target: Combatant, item: Item): ItemUseObject => {
  let resource;
  let resourceFull;
  let resourceRecoverFunction;
  switch (item.effect.type) {
    case SpellType.manaRecover:
      resource = 'MP';
      resourceFull = target.currentMp >= target.getMaxMp();
      resourceRecoverFunction = target.recoverManaFor;
      break;
    case SpellType.restoration:
      resource = 'HP';
      resourceFull = target.currentHp >= target.getMaxHp();
      resourceRecoverFunction = target.healFor;
      break;
    case SpellType.revive:
      resource = '';
      resourceFull = target.currentHp >= target.getMaxHp();
      resourceRecoverFunction = target.revive;
      break;
    default:
      break;
  }
  return {
    item,
    resource,
    resourceFull,
    resourceRecoverFunction
  }
}