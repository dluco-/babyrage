// GET DATA
// CALCULATE

import response from './mock/response.json';

const { technicalAnalysis, lastPrice } = response;

const ema21 = technicalAnalysis.filter(
  x => x.type === 'ema' && x.timeFrame === 21
);

const sma50 = technicalAnalysis.filter(
  x => x.type === 'sma' && x.timeFrame === 50
);

const sma200 = technicalAnalysis.filter(
  x => x.type === 'sma' && x.timeFrame === 200
);

const ema21trend = ema21[0].dataPoints[ema21[0].dataPoints.length - 1][1];
const sma50trend = sma50[0].dataPoints[sma50[0].dataPoints.length - 1][1];
const sma200trend = sma200[0].dataPoints[sma200[0].dataPoints.length - 1][1];

if (ema21trend <= 0) throw new Error('ema21 not positive');
if (sma50trend <= 0) throw new Error('sma50 not positive');
if (sma200trend <= 0) throw new Error('sma200 not positive');

if (ema21trend <= sma50trend) throw new Error('ema21 not over sma50');
if (sma50trend <= sma200trend) throw new Error('sma50 not over sma200');

if (lastPrice <= ema21trend) throw new Error('ema21 not over closing price');
if (lastPrice <= sma50trend) throw new Error('sma50 not over closing price');
if (lastPrice <= sma200trend) throw new Error('sma200 not over closing price');

console.log(
  'ema21trend',
  ema21trend,
  'sma50trend',
  sma50trend,
  'sma200trend',
  sma200trend
);
