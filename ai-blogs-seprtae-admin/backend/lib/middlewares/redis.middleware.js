import redis from "../../lib/config/redis.js";

const cachedData = (key) => {
  return async (req, res, next) => {
    try {
      const data = await redis.get(key);

      if (data) {
        console.log("response from redis");
        return res.json(JSON.parse(data));  
      }

      next();
    } catch (error) {
      console.error("Redis middleware error:", error);
      next();
    }
  };
};

export default cachedData;
