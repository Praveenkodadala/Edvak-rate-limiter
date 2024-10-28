import dotenv from "dotenv";
dotenv.config();

const RATE_LIMIT = parseInt(process.env.RATE_LIMIT, 10) || 100;
const WINDOW_TIME = parseInt(process.env.WINDOW_TIME, 10) || 60000;

const requestCounts = new Map();

const rateLimiter = (req, res, next) => {
	const userIP = req.ip;
	console.log(`User IP: ${userIP}`);
	const currentTime = Date.now();
	console.log("requestCounts map", requestCounts);

	requestCounts.forEach((data, ip) => {
		if (currentTime - data.startTime > WINDOW_TIME) {
			requestCounts.delete(ip);
		}
	});

	if (!requestCounts.has(userIP)) {
		requestCounts.set(userIP, { count: 1, startTime: currentTime });
		next();
	} else {
		const requestData = requestCounts.get(userIP);
		const elapsedTime = currentTime - requestData.startTime;

		if (elapsedTime < WINDOW_TIME) {
			if (requestData.count < RATE_LIMIT) {
				requestData.count++;
				console.log(`userIP: ${userIP}, Count: ${requestData.count}, Time: ${new Date(currentTime).toISOString()}`);
				next();
			} else {
				res.status(429).json({ status: false, message: "Too Many Requests" });
			}
		} else {
			requestCounts.set(userIP, { count: 1, startTime: currentTime });
			next();
		}
	}
};

export default rateLimiter;
