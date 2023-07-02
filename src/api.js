const API_KEY =
  "ce476ecfd457397cabdbb30bc3d81e711eedd88c6cd371baaeb9c1827f10408d";
const AGGREGATE_INDEX = "5";
const UNCORRECT_MESSAGE = "INVALID_SUB";
const PRICE_CURRENCY = "USD";
const wsUrl = new URL("wss://streamer.cryptocompare.com/v2");
wsUrl.searchParams.set("api_key", API_KEY);
const socket = new WebSocket(wsUrl);
const tickersHandlers = new Map();
const subscribedTickers = [];

socket.addEventListener("message", (eventMessage) => {
  const {
    TYPE: index,
    FROMSYMBOL: currency,
    PRICE: newPrice,
    MESSAGE: sentMessage,
    PARAMETER: returnedMessage
  } = JSON.parse(eventMessage.data);
  console.log(sentMessage);
  if (returnedMessage === UNCORRECT_MESSAGE) {
    const requestCurrency = (sentMessage ?? "").toString().split("~")[2];
    updateHandler(requestCurrency, undefined);
    unsubscribeFromTicker(requestCurrency);
    console.log("uncorrect");
  }
  if (index !== AGGREGATE_INDEX || newPrice === undefined) return;
  updateHandler(currency, newPrice);
});

const updateHandler = (currency, newPrice) => {
  const handlers = tickersHandlers.get(currency) ?? [];
  handlers.forEach((fn) => fn(newPrice));
};

const subscribeToTickerOnWs = (ticker) => {
  subscribedTickers.push(
    `${AGGREGATE_INDEX}~CCCAGG~${ticker}~${PRICE_CURRENCY}`
  );
  sendToWebSocet({
    action: "SubAdd",
    subs: subscribedTickers
  });
};

const unsubscribeFromTickerOnWs = (ticker) => {
  const removeTicer = subscribedTickers.find(
    (el) =>
      el === `${AGGREGATE_INDEX}~CCCAGG~${ticker}~${PRICE_CURRENCY}` &&
      ticker !== "ETH"
  );
  const idx = subscribedTickers.findIndex((el) => el === removeTicer);
  subscribedTickers.splice(idx, 1);
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

export const getCoinsNames = async () => {
  const url = new URL("https://min-api.cryptocompare.com/data/all/coinlist");
  url.searchParams.set("summary", true);
  const data = async () => {
    const f = await fetch(url);
    return await f.json();
  };
  const tmp = await data();
  return Object.keys(tmp.Data);
};

export const subscribeToTicker = (ticker, callback) => {
  const subscribers = tickersHandlers.get(ticker) || [];
  tickersHandlers.set(ticker, [...subscribers, callback]);
  subscribeToTickerOnWs(ticker);
};

export const unsubscribeFromTicker = (ticker) => {
  tickersHandlers.delete(ticker);
  unsubscribeFromTickerOnWs(ticker);
};
