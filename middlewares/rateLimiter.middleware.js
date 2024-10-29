import dotenv from "dotenv";
dotenv.config();

const RATE_LIMIT = parseInt(process.env.RATE_LIMIT, 10) || 100;
const WINDOW_TIME = parseInt(process.env.WINDOW_TIME, 10) || 60000;

const requestCounts = new Map(); // Tracks IP request counts

const rateLimiter = (req, res, next) => {
	const userIP = req.ip;
	const currentTime = Date.now();

	try {
		/* If IP is not in map, initialize it */
		if (!requestCounts.has(userIP)) {
			requestCounts.set(userIP, { count: 1, startTime: currentTime });
			return next();
		}

		const requestData = requestCounts.get(userIP);
		const elapsedTime = currentTime - requestData.startTime;

		if (elapsedTime < WINDOW_TIME) {
			if (requestData.count < RATE_LIMIT) {
				requestData.count++;
                console.log("requestCounts.size",requestCounts.size)
				console.log(`userIP: ${userIP}, Count: ${requestData.count}, Time: ${new Date(currentTime).toISOString()}`);
				return next();
			} else {
				/* Send 429 if limit exceeded  */
				res.status(429).json({ status: false, message: "Too Many Requests" });
			}
		} else {
			/* Reset count and time if window time has passed */
			requestCounts.set(userIP, { count: 1, startTime: currentTime });
			return next();
		}
	} catch (err) {
		next(err);
	}
};

/* Periodic cleanup of old entries */
setInterval(() => {
	const currentTime = Date.now();
	for (const [ip, value] of requestCounts.entries()) {
		if (currentTime - value.startTime > WINDOW_TIME) {
			requestCounts.delete(ip);
		}
	}
}, WINDOW_TIME);

export default rateLimiter;
