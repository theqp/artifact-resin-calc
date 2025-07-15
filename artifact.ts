import { MainStat, SubStat, Part } from "./constants";
export type Artifact = {
  level: number;
  rarity: number;
  substats: {
    key: SubStat;
    value: number;
  }[];
  mainStatKey: MainStat;
  slotKey: Part;
};
