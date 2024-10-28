import express from "express";
import rateLimiter from "./middlewares/rateLimiter.middleware.js";
import dotenv from "dotenv";
import cluster from "node:cluster";
import { availableParallelism } from "node:os";
import process from "node:process";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

const numCPUs = availableParallelism();

if (cluster.isPrimary) {
	console.log(`Primary ${process.pid} is running`);
	for (let i = 0; i < numCPUs; i++) {
		cluster.fork();
	}
	cluster.on("exit", (worker, code, signal) => {
		console.log(`worker ${worker.process.pid} died`);
	});
} else {
	app.get("/", rateLimiter, (req, res) => {
		res.status(200).send({ status: true, message: "server is working fine" });
	});

	app.get("/unlimited", (req, res) => {
		res.status(200).send({ status: true, message: "This route does not have rate limiting" });
	});

	app.use(function (req, res, next) {
		res.status(404).send("Sorry, can't find that!");
	});

	app.use((err, req, res, next) => {
		res.status(err.statusCode || 500).json({
			status: false,
			message: err.message ?? "Something went wrong",
		});
	});

	console.log(`Worker ${process.pid} started`);

	app.listen(PORT, () => {
		console.log(`Server is running on port ${PORT}`);
	});
}
