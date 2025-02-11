import { ethers } from "ethers";
import fs from "fs";
import wallet from "./wallet.config.js";
import dotenv from "dotenv";

dotenv.config();

const contractABI = JSON.parse(fs.readFileSync("contractABI.json", "utf-8"));
const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  contractABI,
  wallet
);

export default contract;
