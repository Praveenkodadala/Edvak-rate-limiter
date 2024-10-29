import express from "express";
import rateLimiter from "./middlewares/rateLimiter.middleware.js";
import dotenv from "dotenv";
import morgan from "morgan";
import cluster from "node:cluster";
import { availableParallelism } from "node:os";
import process from "node:process";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const numCPUs = availableParallelism();

if (cluster.isPrimary) {
	console.log("no of CPUs :", numCPUs);
	console.log(`Primary ${process.pid} is running`);

	for (let i = 0; i < numCPUs; i++) {
		cluster.fork();
	}

	cluster.on("exit", (worker, code, signal) => {
		console.log(`Worker ${worker.process.pid} exited with code ${code} and signal ${signal}`);
		console.log("Starting a new worker...");
		cluster.fork();
	});
} else {
	app.use(morgan(":method :url :status :res[content-length] - :response-time ms"));

	app.use(rateLimiter);

	app.get("/", (req, res) => {
		res.status(200).send({ status: true, message: "Server is working fine" });
	});

	app.use((req, res) => {
		res.status(404).send("Sorry, can't find that!");
	});

	app.use((err, req, res, next) => {
		console.error("Error encountered:", err);
		res.status(err.statusCode || 500).json({
			status: false,
			message: err.message ?? "Something went wrong",
		});
	});

	app.listen(PORT, () => {
		console.log(`Server is running on port ${PORT}`);
		console.log(`Worker ${process.pid} started`);
	});
}
