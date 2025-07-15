import { MainStat, Part, SubStat, SubStats, subStatValues } from "./constants";
import {
  getRollQualityDistribution,
  thresholdProbability,
} from "./convolution";
import { TsUtils } from "./tsUtils";
import { Artifact } from "./artifact";

export function scoreTbp(
  relic: Artifact,
  weights: Partial<Record<SubStat, number>>
): number {
  // Round away the floating point errors from weight products
  const scoreToBeat = TsUtils.precisionRound(
    simpleSubstatScoreOfRelic(relic, weights)
  );

  const pMain =
    probabilityOfCorrectSet() *
    probabilityOfCorrectSlot() *
    probabilityOfCorrectStat(relic.slotKey, relic.mainStatKey);

  let totalPSub = 0.0;

  for (const spread of initialSubstatGenerator(relic.mainStatKey, 4)) {
    const pSubInitial = probabilityOfCorrectInitialSubs(
      relic.mainStatKey,
      spread
    );

    const statWeights = spread
      .map(sub => {
        if (sub == "atk" || sub == "def" || sub == "hp") {
          return 0.4 * (weights[sub] ?? 0);
        }
        return weights[sub] ?? 0;
      })
      .sort((a, b) => a - b);

    // 80% vs 20% to get a 3 liner vs a 4 liner
    const threeLinerPSubUpgrade = thresholdProbability(
      getRollQualityDistribution(statWeights, 4),
      scoreToBeat
    );
    const fourLinerPSubUpgrade = thresholdProbability(
      getRollQualityDistribution(statWeights, 5),
      scoreToBeat
    );
    const pSubUpgrade =
      0.8 * threeLinerPSubUpgrade + 0.2 * fourLinerPSubUpgrade;

    totalPSub += pSubInitial * pSubUpgrade;
  }

  const totalP = pMain * totalPSub;

  const estCount = 1 / totalP;
  // 1.065 per domain run
  // https://genshin-impact.fandom.com/wiki/Loot_System/Artifact_Drop_Distribution#Domains
  const tbpPerRelic = 20 / 1.065;
  const estTbp = estCount * tbpPerRelic;
  const days = estTbp / 180;

  return days;
}

function simpleSubstatScoreOfRelic(
  relic: Artifact,
  weights: Partial<Record<SubStat, number>>
): number {
  let weightedSum = 0;
  for (const substat of relic.substats) {
    const stat = substat.key;
    const rolls = substat.value / subStatValues[stat];
    weightedSum += rolls * flatReduction(stat) * (weights[stat] ?? 0);
  }
  return weightedSum;
}

function flatReduction(stat: SubStat) {
  return stat == "hp" || stat == "def" || stat == "atk" ? 0.4 : 1;
}

export function initialSubstatGenerator(
  main: MainStat,
  initialCount: number
): Generator<Array<SubStat>> {
  return combinations(
    SubStats.filter(sub => sub != main),
    initialCount
  );
}

export function probabilityOfCorrectStat(part: Part, stat: MainStat): number {
  switch (part) {
    case "flower":
    case "plume":
      return 1.0;
    case "sands":
      switch (stat) {
        case "hp_":
          return 0.2668;
        case "atk_":
        case "def_":
          return 0.2666;
        case "enerRech_":
        case "eleMas":
          return 0.1;
        default:
          throw new Error("undefined part");
      }
    case "goblet":
      switch (stat) {
        case "hp_":
        case "atk_":
          return 0.1925;
        case "def_":
          return 0.19;
        case "pyro_dmg_":
        case "electro_dmg_":
        case "cryo_dmg_":
        case "hydro_dmg_":
        case "dendro_dmg_":
        case "anemo_dmg_":
        case "geo_dmg_":
        case "physical_dmg_":
          return 0.05;
        case "eleMas":
          return 0.025;
        default:
          throw new Error("undefined part");
      }
    case "circlet":
      switch (stat) {
        case "hp_":
        case "atk_":
        case "def_":
          return 0.22;
        case "critRate_":
        case "critDMG_":
        case "heal_":
          return 0.1;
        case "eleMas":
          return 0.04;
        default:
          throw new Error("undefined part");
      }
    default:
      throw new Error("undefined part");
  }
}

export function probabilityOfCorrectSet(): number {
  return 1 / 2;
}

export function probabilityOfCorrectSlot(): number {
  return 0.2;
}

// source: https://docs.qq.com/sheet/DYkFxSVFNSGp5YlVv?tab=metuhj
export function substatLineWeight(sub: SubStat | MainStat): number {
  switch (sub) {
    case "hp":
    case "atk":
    case "def":
      return 6;
    case "hp_":
    case "atk_":
    case "def_":
    case "enerRech_":
    case "eleMas":
      return 4;
    case "critRate_":
    case "critDMG_":
      return 3;
    default:
      return 0;
  }
}

export function probabilityOfCorrectInitialSubs(
  main: MainStat,
  subs: Array<SubStat>
): number {
  let totalP = 0.0;
  for (const perm of permutations(subs.slice(0, Math.min(4, subs.length)))) {
    let remainingWeight = 44 - substatLineWeight(main);
    let p = 1.0;

    for (const sub of perm) {
      const weight = substatLineWeight(sub);
      p *= weight / remainingWeight;
      remainingWeight -= weight;
    }

    totalP += p;
  }

  return totalP;
}

// we only need the factorial up until n=5, so it's fine to use the trivial implementation
export function factorial(n: number): number {
  let fact = 1;
  for (let i = 2; i <= n; i++) fact *= i;
  return fact;
}

export function binomialCoefficient(n: number, k: number): number {
  return factorial(n) / (factorial(k) * factorial(n - k));
}

// https://gist.github.com/xuab/c96bd47769ec459b60db8da4e796a0ff
export function* permutations<T>(arr: Array<T>): Generator<Array<T>> {
  if (arr.length < 2) return yield arr;
  const [first, ...rest] = arr;
  for (const ps of permutations(rest))
    for (const i of arr.keys())
      yield [...ps.slice(0, i), first, ...ps.slice(i)];
}

// https://gist.github.com/xuab/c96bd47769ec459b60db8da4e796a0ff
// "kSubSets"
export function* combinations<T>(l: Array<T>, k: number): Generator<Array<T>> {
  if (k < 1) return yield [];
  for (const [i, x] of l.entries())
    for (const set of combinations(l.slice(i + 1), k - 1)) yield [x, ...set];
}
