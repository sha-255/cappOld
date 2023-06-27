const API_KEY =
  "d9821aaef961306f2f68b3f0d0e12b60b0c2b2e270e01966c6bd4735c5aba675";
const AGGREGATE_INDEX = "5";
const UCORRECT_MESSAGE = "INVALID_SUB";
const PRICE_CURRENCY = "USD"; //USD BTC ETH
const wsUrl = new URL("wss://streamer.cryptocompare.com/v2");
wsUrl.searchParams.set("api_key", API_KEY);
const socket = new WebSocket(wsUrl);
const tickersHandlers = new Map();
const subscribedTickers = [];

// subscribedTickers.push(`${AGGREGATE_INDEX}~CCCAGG~${sendedCurrency}~ETH`);
// sendToWebSocet({
//   action: "SubAdd",
//   subs: subscribedTickers
// });

// updateHandler(sendedCurrency);
// unsubscribeFromTicker(sendedCurrency);

socket.addEventListener("message", (eventMessage) => {
  const {
    TYPE: index,
    FROMSYMBOL: currency,
    PRICE: newPrice,
    MESSAGE: returnedMessage,
    PARAMETER: sendedMessage
  } = JSON.parse(eventMessage.data);
  if (UCORRECT_MESSAGE === returnedMessage) {
    const sendedCurrency = (sendedMessage ?? "").toString().split("~")[2];
    updateHandler(sendedCurrency);
    unsubscribeFromTicker(sendedCurrency);
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
    (el) => el === `${AGGREGATE_INDEX}~CCCAGG~${ticker}~${PRICE_CURRENCY}`
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
