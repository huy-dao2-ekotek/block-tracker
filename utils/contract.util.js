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
sendTokens("a");
async function getBlocks() {
  try {
    //get lastest block number in redis
    const lastestBlockNumber = parseInt(
      await getFromRedis("lastestBlockNumber")
    );

    //get events from lastest block
    const events = await contract.queryFilter(
      contractEventName,
      lastestBlockNumber + 1,
      lastestBlockNumber + numberOfBlocks
    );
    //get lastest block number on blockchain
    const lastestOnBlockchain = await provider.getBlockNumber();
    console.log({ lastestOnBlockchain });

    //if no events found, if lastest block number on blockchain is greater than start block number + number of blocks
    // => save block number + number of blocks to redis as lastest block number
    if (events.length === 0) {
      if (lastestBlockNumber + numberOfBlocks <= lastestOnBlockchain) {
        await saveToRedis(
          "lastestBlockNumber",
          lastestBlockNumber + numberOfBlocks
        );
      }
      console.log({ lastestBlockNumber });
      return;
    }

    await Promise.all(
      events.map(async (event, index) => {
        const block = await event.getBlock();
        await saveToRedis(`block:${block.number}`, JSON.stringify(block));
        if (index + 1 === events.length) {
          await saveToRedis("lastestBlockNumber", block.number);
        }
      })
    );
  } catch (error) {
    console.error("Error fetching events:", error);
  }
}

export { sendTokens, getBlocks };
