import dotenv from "dotenv";
dotenv.config();

const RATE_LIMIT = parseInt(process.env.RATE_LIMIT, 10) || 100;
const WINDOW_TIME = parseInt(process.env.WINDOW_TIME, 10) || 60000;

const requestCounts = new Map(); //create new Map

const rateLimiter = (req, res, next) => {
	const userIP = req.ip;
	const currentTime = Date.now();

    console.log('requestCounts map', requestCounts)

	try {
		// Clean up expired entries from the map
		requestCounts.forEach((data, ip) => {
			if (currentTime - data.startTime > WINDOW_TIME) {
				requestCounts.delete(ip);
			}
		});

		// If user IP is not in the map, add it with initial count
		if (!requestCounts.has(userIP)) {
			requestCounts.set(userIP, { count: 1, startTime: currentTime });
			return next();
		}

		// Retrieve request data for the IP and check rate limits
		const requestData = requestCounts.get(userIP);
		const elapsedTime = currentTime - requestData.startTime;

		if (elapsedTime < WINDOW_TIME) {
			if (requestData.count < RATE_LIMIT) {
				requestData.count++;
				console.log(`userIP: ${userIP}, Count: ${requestData.count}, Time: ${new Date(currentTime).toISOString()}`);
				return next();
			} else {
				const err = new Error("Too Many Requests");
				err.statusCode = 429;
				throw err;
			}
		} else {
			// Reset count and start time if the time window has passed
			requestCounts.set(userIP, { count: 1, startTime: currentTime });
			return next();
		}
	} catch (err) {
		next(err);
	}
};

export default rateLimiter;
