import { babyrageOk, fiftyTwoWeekHigh } from './babyrageOk';

describe('When calculating babyRage', () => {
  describe('Given positive trend/SMA/EMA, closing price and inside 52 week interval', () => {
    it('Then return true', async () => {
      expect(await babyrageOk(90, 80, 70, 100, 95)).toBe(true);
    });
  });

  describe('Given ema21 not positive', () => {
    it('Then throw', async () =>
      await expect(babyrageOk(-100, 0, 0, 0, 0)).rejects.toEqual(
        Error('ema21 not positive')
      ));
  });

  describe('Given sma50 not positive', () => {
    it('Then throw', async () =>
      await expect(babyrageOk(100, -100, 0, 0, 0)).rejects.toEqual(
        Error('sma50 not positive')
      ));
  });

  describe('Given sma200 not positive', () => {
    it('Then throw', async () =>
      await expect(babyrageOk(100, 100, -100, 0, 0)).rejects.toEqual(
        Error('sma200 not positive')
      ));
  });

  describe('Given ema21 not over sma50', () => {
    it('Then throw', async () =>
      await expect(babyrageOk(100, 200, 100, 0, 0)).rejects.toEqual(
        Error('ema21 not over sma50')
      ));
  });

  describe('Given sma50 not over sma200', () => {
    it('Then throw', async () =>
      await expect(babyrageOk(200, 100, 200, 0, 0)).rejects.toEqual(
        Error('sma50 not over sma200')
      ));
  });

  describe('Given closing price not over sma200', () => {
    it('Then throw', async () =>
      await expect(babyrageOk(300, 200, 100, 50, 0)).rejects.toEqual(
        Error('closing price not over sma200')
      ));
  });

  describe('Given closing price not over sma50', () => {
    it('Then throw', async () =>
      await expect(babyrageOk(300, 200, 100, 150, 0)).rejects.toEqual(
        Error('closing price not over sma50')
      ));
  });

  describe('Given closing price not over ema21', () => {
    it('Then throw', async () =>
      await expect(babyrageOk(300, 200, 100, 250, 0)).rejects.toEqual(
        Error('closing price not over ema21')
      ));
  });

  describe('Given closing price is 10% lower then high', () => {
    it('Then throw', async () =>
      await expect(babyrageOk(3, 2, 1, 90, 100)).rejects.toEqual(
        Error('Not in 1-5% interval from 52 week high')
      ));
  });
});

describe('When testing for 52 week high', () => {
  describe('Given closing price is 10% lower then high', () => {
    it('Then return false', async () => {
      expect(fiftyTwoWeekHigh(100, 90)).toBe(false);
    });
  });

  describe('Given closing price is 10% higher then high', () => {
    it('Then return false', async () => {
      expect(fiftyTwoWeekHigh(100, 110)).toBe(false);
    });
  });

  describe('Given closing price is 5% lower then high', () => {
    it('Then return true', async () => {
      expect(fiftyTwoWeekHigh(100, 95)).toBe(true);
    });
  });

  describe('Given closing price is 5% higher then high', () => {
    it('Then return true', async () => {
      expect(fiftyTwoWeekHigh(100, 105)).toBe(true);
    });
  });

  describe('Given closing price is equal to high', () => {
    it('Then return true', async () => {
      expect(fiftyTwoWeekHigh(100, 100)).toBe(true);
    });
  });
});
