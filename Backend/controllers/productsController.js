import axios from "axios";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

const COMPANIES = ["AMZ", "FLP", "SNP", "MYN", "AZO"];

export const getTopProducts = catchAsync(async (req, res, next) => {
	const { categoryname } = req.params;
	const { n, page, sortBy, minPrice, maxPrice } = req.query;

	if (!n) {
		return next(
			new AppError("Please provide number of products to fetch", 400)
		);
	}

	if (!categoryname) {
		return next(new AppError("Please provide category name", 400));
	}

	if (n > 10 && !page) {
		return next(new AppError("Please provide page number", 400));
	}

	const promises = COMPANIES.map(async (company) => {
		let url = `${process.env.COMPANY_API}/companies/${company}/categories/${categoryname}/products?top=${n}`;

		if (minPrice) url = url.concat(`&minPrice=${minPrice}`);
		if (maxPrice) url = url.concat(`&maxPrice=${maxPrice}`);

		const response = await axios.get(url, {
			headers: {
				Authorization: `Bearer ${process.env.COMPANY_API_KEY}`,
			},
		});
		return response.data;
	});

	const results = await Promise.all(promises);

	const products = results.flat();

	let paginatedProducts = products;
	if (n && parseInt(n) > 10) {
		const startIndex = (page - 1) * n;
		paginatedProducts = products.slice(startIndex, startIndex + parseInt(n));
	}

	const productsWithIds = paginatedProducts.map((product, index) => ({
		id: `${categoryname}_${index}`,
		...product,
	}));

	res.status(200).json({
		status: "success",
		data: {
			products: productsWithIds,
		},
	});
});

export const getProductById = catchAsync(async (req, res, next) => {
	res.status(200).json({
		status: "success",
		message: "This route is under construction",
	});
});
