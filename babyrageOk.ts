/**
 * Based on https://twitter.com/babyrageee/status/1203946111918116864
 * @param ema21
 * @param sma50
 * @param sma200
 * @param lastPrice
 * @param high
 */
export async function babyrageOk(
  ema21: number,
  sma50: number,
  sma200: number,
  lastPrice: number,
  high: number
) {
  // POSITIVE
  if (ema21 <= 0) throw new Error('ema21 not positive');
  if (sma50 <= 0) throw new Error('sma50 not positive');
  if (sma200 <= 0) throw new Error('sma200 not positive');

  // EMA / SMA TREND
  if (ema21 <= sma50) throw new Error('ema21 not over sma50');
  if (sma50 <= sma200) throw new Error('sma50 not over sma200');

  // CLOSING PRICE
  if (lastPrice <= sma200) throw new Error('closing price not over sma200');
  if (lastPrice <= sma50) throw new Error('closing price not over sma50');
  if (lastPrice <= ema21) throw new Error('closing price not over ema21');

  // 52 WEEK HIGH
  if (!fiftyTwoWeekHigh(high, lastPrice))
    throw new Error('Not in 1-5% interval from 52 week high');

  // Buy!
  return true;
}

export function fiftyTwoWeekHigh(high: number, lastPrice: number) {
  return !(Math.abs(high - lastPrice) > 5);
}
