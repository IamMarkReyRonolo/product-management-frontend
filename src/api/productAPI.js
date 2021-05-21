import axios from "axios";
const url = " http://localhost:3000/api/";
axios.defaults.headers.common["auth-token"] =
	"Bearer " + localStorage.getItem("token");

export default class API {
	async getAllProducts(userId) {
		const link = url + `${userId}/products`;
		const products = await axios.get(link);

		console.log("object");
		console.log(products);
		console.log("wasapp");
		// console.log(products.data.products);
		return products.data.products;
	}

	async addProduct(userId, newProduct) {
		const link = url + `${userId}/products`;
		const product = await axios.post(link, newProduct);
		return product.data.result.product;
	}

	async getSpecificProduct(userId, id) {
		const link = url + ` ${userId}/products/${id}`;
		const products = await axios.get(link);
		return products;
	}
	async updateSpecificProduct(userId, id, updates) {
		const link = url + ` ${userId}/products/${id}`;
		const products = await axios.patch(link, updates);
		return products;
	}
	async deleteSpecificProduct(userId, id) {
		const link = url + ` ${userId}/products/${id}`;
		const products = await axios.delete(link);
		return products;
	}
}
