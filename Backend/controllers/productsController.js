import axios from "axios";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

const COMPANIES = ["AMZ", "FLP", "SNP", "MYN", "AZO"];

export const getTopProducts = catchAsync(async (req, res, next) => {
	const { categoryname } = req.params;
	let { n, page, sortBy, minPrice, maxPrice } = req.query;

	if (!n) {
		return next(
			new AppError("Please provide number of products to fetch", 400)
		);
	}

	if (!categoryname) {
		return next(new AppError("Please provide category name", 400));
	}

	const topPerPage = Math.ceil(n / COMPANIES.length) || 1;
	if (n > 10 && !page) {
		return next(new AppError("Please provide page number", 400));
	}

	const promises = COMPANIES.map(async (company, index) => {
		let url = `${process.env.COMPANY_API}/companies/${company}/categories/${categoryname}/products?top=${topPerPage}`;

		if (minPrice) url = url.concat(`&minPrice=${minPrice}`);
		if (maxPrice) url = url.concat(`&maxPrice=${maxPrice}`);

		const response = await axios.get(url, {
			headers: {
				Authorization: `Bearer ${process.env.COMPANY_API_KEY}`,
			},
		});
		return response.data.map((product) => ({
			...product,
			productid: Buffer.from(product.productName + "/_/" + company).toString(
				"base64"
			),
			company: company,
		}));
	});

	let results = await Promise.all(promises);
	let products = results.flat();

	if (sortBy) {
		const sortField = sortBy.toLowerCase();
		const sortOrder = sortField.startsWith("-") ? -1 : 1;
		const field = sortField.startsWith("-")
			? sortField.substring(1)
			: sortField;

		products.sort((a, b) => {
			if (a[field] < b[field]) return -1 * sortOrder;
			if (a[field] > b[field]) return 1 * sortOrder;
			return 0;
		});
	}

	if (n < products.length) {
		products = products.slice(0, n);
	}

	let paginatedProducts = products;
	if (n > 10 && page) {
		const startIndex = (page - 1) * 10;
		const endIndex = startIndex + 10;

		paginatedProducts = paginatedProducts.slice(startIndex, endIndex);
	}

	res.status(200).json({
		status: "success",
		data: {
			products: paginatedProducts,
		},
	});
});

export const getProductById = catchAsync(async (req, res, next) => {
	const { categoryname, productid } = req.params;
	const decodedData = Buffer.from(productid, "base64").toString("utf-8");
	const [productName, company] = decodedData.split("/_/");

	const url = `${process.env.COMPANY_API}/companies/${company}/categories/${categoryname}/products`;
});
