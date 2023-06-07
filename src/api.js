const API_KEY =
  "4302c479b9cec17604db7af005cb60a54b9d1079a8b58fd18ba964bc6d16826d";

const tickersHandlers = new Map();

//TODO: refactor to URLSerch params.
const loadTickers = async () => {
  if (tickersHandlers.size === 0) {
    return;
  }
  const f = await fetch(
    `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${[
      ...tickersHandlers.keys()
    ].join(",")}&tsyms=USD&api_key=${API_KEY}`
  );
  return await f.json().then((rawData) => {
    const updatedPrices = Object.fromEntries(
      Object.entries(rawData).map(([key, value]) => [key, value.USD])
    );
    Object.entries(updatedPrices).forEach(([currency, newPrice]) => {
      const handlers = tickersHandlers.get(currency) ?? [];
      handlers.forEach((fn) => fn(newPrice));
    });
  });
};

export const subscribeToTicker = (ticker, cb) => {
  const subscribers = tickersHandlers.get(ticker) || [];
  tickersHandlers.set(ticker, [...subscribers, cb]);
};

export const unsubscribeFromTicker = (ticker) => {
  tickersHandlers.delete(ticker);
};

setInterval(loadTickers, 5000);

window.tickers = tickersHandlers;
