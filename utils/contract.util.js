import provider from "../configs/provider.config.js";
import contract from "../configs/contract.config.js";
import dotenv from "dotenv";
import { getFromRedis, saveToRedis } from "./redis.util.js";
dotenv.config();

//get env variables
const numberOfBlocks = parseInt(process.env.NUMBER_OF_BLOCKS);
const contractEventName = process.env.CONTRACT_EVENT_NAME;

async function sendTokens(uri) {
  const tx = await contract.deployConcertTicket(uri.toString());
  console.log({ name: "Transaction's information", metadata: tx });
  await tx.wait();
  console.log("Transaction confirmed!");
}
// sendTokens("a");
async function getBlocks() {
  try {
    //get latest block number in redis
    const latestBlockNumber = parseInt(await getFromRedis("latestBlockNumber"));

    //get events from lastest block
    const events = await contract.queryFilter(
      contractEventName,
      latestBlockNumber + 1,
      latestBlockNumber + numberOfBlocks
    );
    //get latest block number on blockchain
    const latestOnBlockchain = await provider.getBlockNumber();
    console.log({ latestOnBlockchain });

    //if no events found, if latest block number on blockchain is greater than latest block number in redis + number of blocks
    // => save latest block number + number of blocks to redis as latest block number
    if (events.length === 0) {
      if (latestBlockNumber + numberOfBlocks <= latestOnBlockchain) {
        await saveToRedis(
          "latestBlockNumber",
          latestBlockNumber + numberOfBlocks
        );
      }
      console.log({ latestBlockNumber });
      return;
    }

    await Promise.all(
      events.map(async (event, index) => {
        const block = await event.getBlock();
        await saveToRedis(`block:${block.number}`, JSON.stringify(block));
        if (index + 1 === events.length) {
          await saveToRedis("latestBlockNumber", block.number);
        }
      })
    );
  } catch (error) {
    console.error("Error fetching events:", error);
  }
}

export { sendTokens, getBlocks };
