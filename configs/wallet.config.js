import { ethers } from "ethers";
import provider from "./provider.config.js";
import dotenv from "dotenv";

dotenv.config();

const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

export default wallet;
