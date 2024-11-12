import "dotenv/config";
import axios from "axios";
import Period from "./enums/Period";
import Candle from "./models/Candle";
import { createMessageChannel } from "./messages/messageChannel";

const readMarketPrice = async (): Promise<number | null> => {
  try {
    const result = await axios.get(process.env.PRICES_API);
    const data = result.data;
    const { usd } = data.bitcoin;
    return usd;
  } catch (error) {
    console.error("Erro ao buscar o preço de mercado:", error);
    return null;
  }
};

const generateCandles = async () => {
  const messageChannel = await createMessageChannel();

  if (messageChannel) {
    while (true) {
      // const loopTimes = Period.FIVE_MINUTES / Period.TEN_SECONDS;
      const loopTimes = Period.FIVE_MINUTES / Period.THIRTY_SECONDS;
      const candle = new Candle("BTC");

      console.log("---------------------------------------");
      console.log("Generating new candle");

      for (let i = 0; i < loopTimes; i++) {
        const price = await readMarketPrice();
        candle.addValue(price);
        console.log(`Market price #${i + 1} of ${loopTimes} at price ${price}`);
        await new Promise((r) => setTimeout(r, Period.THIRTY_SECONDS));
      }

      candle.closeCandle();
      console.log("Candle close");
      const candleObj = candle.toSimpleObject();
      console.log(candleObj);
      const candleJson = JSON.stringify(candleObj);
      messageChannel.sendToQueue(
        process.env.QUEUE_NAME,
        Buffer.from(candleJson)
      );
      console.log("Candle sent to queue");
    }
  }
};

generateCandles();
