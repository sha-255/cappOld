const API_KEY =
  "d9821aaef961306f2f68b3f0d0e12b60b0c2b2e270e01966c6bd4735c5aba675";

const tickersHandlers = new Map();
//TODO: refactor to URLSerch params.

const socket = new WebSocket(
  `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`
);

const AGGREGATE_INDEX = "5";

const subscribedTickers = [];

socket.addEventListener("message", (e) => {
  const {
    TYPE: type,
    FROMSYMBOL: currency,
    PRICE: newPrice
  } = JSON.parse(e.data);
  if (type !== AGGREGATE_INDEX || newPrice === undefined) {
    return;
  }
  const handlers = tickersHandlers.get(currency) ?? [];
  handlers.forEach((fn) => fn(newPrice));
});

const subscribeToTickerOnWs = (ticker) => {
  subscribedTickers.push(`5~CCCAGG~${ticker}~USD`);
  sendToWebSocet({
    action: "SubAdd",
    subs: subscribedTickers
  });
};

const unsubscribeFromTickerOnWs = (ticker) => {
  const removeTicer = subscribedTickers.find(
    (el) => el === `5~CCCAGG~${ticker}~USD`
  );
  sendToWebSocet({
    action: "SubRemove",
    subs: removeTicer
  });
};

const sendToWebSocet = (obj) => {
  const message = JSON.stringify(obj);
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(message);
    return;
  }
  socket.addEventListener(
    "open",
    () => {
      socket.send(message);
    },
    { once: true }
  );
};

export const subscribeToTicker = (ticker, cb) => {
  const subscribers = tickersHandlers.get(ticker) || [];
  tickersHandlers.set(ticker, [...subscribers, cb]);
  subscribeToTickerOnWs(ticker);
};

export const unsubscribeFromTicker = (ticker) => {
  tickersHandlers.delete(ticker);
  unsubscribeFromTickerOnWs(ticker);
};
