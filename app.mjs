import express from "express";
import rateLimiter from "./middlewares/rateLimiter.middleware.mjs";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", rateLimiter, (req, res) => {
	res.send("Server is working fine");
});

app.get("/unlimited", (req, res) => {
	res.send("This route does not have rate limiting");
});

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
