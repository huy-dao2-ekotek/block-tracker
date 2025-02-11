import { getBlocks } from "./utils/contract.util.js";

setInterval(() => {
  try {
    getBlocks();
  } catch (error) {
    console.error(error);
  }
}, 4000);
