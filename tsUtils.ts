export const TsUtils = {
  // Rounds the number to the specified precision
  precisionRound: (number: number, precision: number = 5): number => {
    const factor = Math.pow(10, precision)
    return Math.round(number * factor) / factor
  }
}
