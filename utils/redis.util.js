import redis from "../configs/redis.config.js";

async function saveToRedis(key, value) {
  console.log({ key });
  await redis.set(key, value);
}

async function getFromRedis(key) {
  const value = await redis.get(key);
  return value;
}

async function deleteFromRedis(key) {
  await redis.del(key);
}

export { saveToRedis, getFromRedis, deleteFromRedis };
