import fetch from 'node-fetch';
import stocks from './stocklist.json';

async function sleep(ms: number) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

async function requestStock(orderbookId: number) {
  const body = {
    orderbookId,
    chartType: 'AREA',
    widthOfPlotContainer: 558,
    chartResolution: 'DAY',
    navigator: false,
    percentage: false,
    volume: false,
    owners: false,
    timePeriod: 'year',
    ta: [
      {
        type: 'ema',
        timeFrame: 21
      },
      {
        type: 'sma',
        timeFrame: 50
      },
      {
        type: 'sma',
        timeFrame: 200
      }
    ],
    compareIds: []
  };

  return fetch(
    'https://www.avanza.se/ab/component/highstockchart/getchart/orderbook',
    {
      method: 'POST',
      headers: [
        ['Content-Type', 'application/json'],
        ['Cache-Control', 'no-cache']
      ],
      body: JSON.stringify(body)
    }
  )
    .then((response: any) => {
      if (response.status === 500) return; // If stock gives no match, eg Kappahl
      return response.json();
    })
    .then((result: unknown) => result)
    .catch(async (error: Error) => {
      // Retry same stock if timeout
      if (error.name === 'FetchError') {
        await sleep(500);
        await requestStock(orderbookId);
        return;
      }
      console.log(error);
    });
}

async function parseResponse(response: {
  dataPoints?: (number | null)[][];
  trendSeries?: number[][];
  allowedResolutions?: string[];
  defaultResolution?: string;
  technicalAnalysis: any;
  ownersPoints?: never[];
  changePercent?: number;
  high: number;
  lastPrice: number;
  low: number;
}) {
  const { technicalAnalysis, lastPrice, high } = response;

  const ema21TA = technicalAnalysis.filter(
    (x: { type: string; timeFrame: number }) =>
      x.type === 'ema' && x.timeFrame === 21
  );

  const sma50TA = technicalAnalysis.filter(
    (x: { type: string; timeFrame: number }) =>
      x.type === 'sma' && x.timeFrame === 50
  );

  const sma200TA = technicalAnalysis.filter(
    (x: { type: string; timeFrame: number }) =>
      x.type === 'sma' && x.timeFrame === 200
  );

  const ema21: number =
    ema21TA[0].dataPoints[ema21TA[0].dataPoints.length - 1][1];
  const sma50: number =
    sma50TA[0].dataPoints[sma50TA[0].dataPoints.length - 1][1];
  const sma200: number =
    sma200TA[0].dataPoints[sma200TA[0].dataPoints.length - 1][1];

  return { ema21, sma50, sma200, lastPrice, high };
}

/**
 * Based on https://twitter.com/babyrageee/status/1203946111918116864
 * @param ema21
 * @param sma50
 * @param sma200
 * @param lastPrice
 * @param high
 */
async function babyrageOk(
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
  if (lastPrice <= ema21) throw new Error('ema21 not over closing price');
  if (lastPrice <= sma50) throw new Error('sma50 not over closing price');
  if (lastPrice <= sma200) throw new Error('sma200 not over closing price');

  // 52 WEEK HIGH
  if (lastPrice / high <= 0.95 || lastPrice / high >= 1.05)
    throw new Error('Not in 1-5% interval from 52 week high');

  // Buy!
  return true;
}

/**
 * Fetch, parse and calculate if stock meets requirments
 * @param stock
 * @returns true if valid and Error if not
 */
async function calculate(stock: { api_id: string; name: string }) {
  const response = await requestStock(Number.parseInt(stock.api_id));
  const { ema21, sma50, sma200, lastPrice, high } = await parseResponse(
    response as any
  );
  return await babyrageOk(ema21, sma50, sma200, lastPrice, high);
}

async function main() {
  stocks.forEach(async stock => {
    try {
      await calculate(stock);
      console.log(
        `Buy: ${stock.name} https://www.avanza.se/aktier/om-aktien.html/${stock.api_id}`
      );
    } catch (error) {
      // console.error(error); // Enable to see stocks that not meet requirments.
    }
  });
}
main();
