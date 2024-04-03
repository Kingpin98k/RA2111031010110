import Express from "express";
import AppError from "./utils/appError.js";
import dotenv from "dotenv";
import { globalErrorHandler } from "./controllers/errorController.js";
import CategoryRouter from "./routes/productRoutes.js";
import morgan from "morgan";

const app = Express();

app.use(Express.json({ limit: "32kb" }));
// app.use(morgan("dev"));
dotenv.config({ path: `./.env` });

app.use("/api/v1/categories", CategoryRouter);

app.use(globalErrorHandler);
app.all("*", (req, res, next) => {
	const err = new AppError(`Can't Find ${req.url}`, 404);
	next(err);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
