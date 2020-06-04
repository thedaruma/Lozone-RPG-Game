import "phaser";
import PhaserUpdatePlugin from "./utility/UpdatePlugin";
import { Plugin as NineSlicePlugin } from "phaser3-nineslice";
import { CreditsScene } from "./scenes/credits/creditsScene";
import { HouseScene } from "./scenes/exploration/houseScene";
import { DungeonScene } from "./scenes/exploration/dungeonScene";
import { CombatScene } from "./scenes/combat/combatScene";
import { StoreScene } from "./scenes/store/storeScene";
import { GameOverScene } from "./scenes/gameOverScene";
import { BootScene } from "./scenes/UI/bootScene";
import { MenuScene } from "./scenes/UI/menuScene";
import { DialogScene } from "./scenes/dialogScene";
import { PartyMenuScene } from "./scenes/UI/partyMenuScene";
import { AudioScene } from "./scenes/audioScene";
// main game configuration
const config: GameConfig = {
  width: 640,
  height: 576,
  zoom: 1,
  type: Phaser.AUTO,
  parent: "game",
  scene: [
    BootScene,
    HouseScene,
    MenuScene,
    DungeonScene,
    CreditsScene,
    CombatScene,
    DialogScene,
    PartyMenuScene,
    StoreScene,
    GameOverScene,
    AudioScene,
  ],
  input: {
    keyboard: true,
  },
  plugins: {
    global: [NineSlicePlugin.DefaultCfg],
    scene: [
      { key: "updatePlugin", plugin: PhaserUpdatePlugin, mapping: "updates" },
    ],
  },
  backgroundColor: "#383838",
  physics: {
    default: "arcade",
    render: { pixelArt: true, antialias: false },
  },
};

export class Game extends Phaser.Game {
  constructor(config: GameConfig) {
    super(config);
  }
}

window.addEventListener("load", () => {
  var game = new Game(config);
});
