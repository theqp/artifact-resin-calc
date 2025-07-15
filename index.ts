import { scoreTbp } from "./estTbp";

function main() {
  console.log(
    scoreTbp(
      {
        level: 20,
        rarity: 5,
        slotKey: "flower",
        mainStatKey: "hp",
        substats: [
          { key: "atk", value: 53 },
          { key: "critDMG_", value: 7.8 },
          { key: "critRate_", value: 12.8 },
          { key: "atk_", value: 5.8 },
        ],
      },
      { critDMG_: 1, critRate_: 1, atk_: 0.65, eleMas: 0.75 }
    )
  );
}

main();
