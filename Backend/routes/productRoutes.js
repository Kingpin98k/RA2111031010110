import { Router } from "express";
import {
	getProductById,
	getTopProducts,
} from "../controllers/productsController.js";

const router = Router();

// Route for getting top products in a category
router.get("/:categoryname/products", getTopProducts);

// Route for getting product by ID
router.get("/:categoryname/products/:productid", getProductById);

export default router;
