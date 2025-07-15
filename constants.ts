export const MainStats = [
  "hp",
  "atk",
  "hp_",
  "def_",
  "atk_",
  "eleMas",
  "enerRech_",
  "physical_dmg_",
  "anemo_dmg_",
  "geo_dmg_",
  "electro_dmg_",
  "hydro_dmg_",
  "pyro_dmg_",
  "cryo_dmg_",
  "dendro_dmg_",
  "critRate_",
  "critDMG_",
  "heal_",
] as const;
export type MainStat = (typeof MainStats)[number];

export const SubStats = [
  "hp",
  "hp_",
  "def",
  "def_",
  "atk",
  "atk_",
  "eleMas",
  "enerRech_",
  "critRate_",
  "critDMG_",
] as const;
export type SubStat = (typeof SubStats)[number];

export const Parts = ["flower", "plume", "sands", "goblet", "circlet"] as const;
export type Part = (typeof Parts)[number];

export const subStatValues = {
  hp: 298.75,
  atk: 19.45,
  def: 23.15,
  hp_: 5.83,
  atk_: 5.83,
  def_: 7.29,
  eleMas: 23.31,
  enerRech_: 6.48,
  critRate_: 3.89,
  critDMG_: 7.77,
} as const;
