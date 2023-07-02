import { getCoinsNames, subscribeToTicker, unsubscribeFromTicker } from "./api";

getCoinsNames;
subscribeToTicker;
unsubscribeFromTicker;

const ports = [];

self.onconnect = (initEvent) => {
  const port = initEvent.source;
  ports.push(port);
  port.onmessage = (e) => {
    e;
    //do
    ports.forEach((p) => p.postMessage(/*do*/));
  };
};
