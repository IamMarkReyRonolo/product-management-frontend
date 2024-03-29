<template>
	<div class="customers">
		<div class="text-center mt-4">
			<v-snackbar v-model="snackbar" :timeout="timeout">
				{{ text }}

				<template v-slot:action="{ attrs }">
					<v-btn color="blue" text v-bind="attrs" @click="snackbar = false">
						Close
					</v-btn>
				</template>
			</v-snackbar>
		</div>

		<div class="headings">
			<h1 class="display-2 font-weight-bold">MY CUSTOMERS</h1>
			<v-spacer></v-spacer>
			<v-btn color="dark" light class="editButton" @click="editAccount">
				Edit
			</v-btn>
			<v-dialog v-model="dialog" persistent max-width="600px">
				<template v-slot:activator="{ on, attrs }">
					<v-btn
						color="dark"
						dark
						v-bind="attrs"
						v-on="on"
						@click="setFormEmpty()"
					>
						Add Customer
					</v-btn>
				</template>
				<v-card dark>
					<form
						action=""
						@submit.prevent="addCustomer"
						enctype="multipart/form-data"
					>
						<v-card-title>
							<span class="headline">Add Customer</span>
						</v-card-title>
						<v-card-text>
							<v-container>
								<v-row>
									<v-col cols="12">
										<v-text-field
											label="First Name*"
											required
											v-model="customer.customer_firstname"
										></v-text-field>
									</v-col>

									<v-col cols="12">
										<v-text-field
											label="Last Name*"
											required
											v-model="customer.customer_lastname"
										></v-text-field>
									</v-col>

									<v-col cols="12">
										<v-text-field
											label="Phone*"
											required
											type="number"
											v-model="customer.customer_phone"
										></v-text-field>
									</v-col>
									<v-col cols="12">
										<v-text-field
											label="Email*"
											required
											v-model="customer.customer_email"
										></v-text-field>
									</v-col>
								</v-row>
							</v-container>
							<small>*indicates required field</small>
						</v-card-text>
						<v-card-actions>
							<v-spacer></v-spacer>
							<v-btn color="white darken-4" text @click="dialog = false">
								Cancel
							</v-btn>
							<!-- <v-btn color="white darken-4" text type="submit">
								Add Product
							</v-btn> -->

							<v-btn
								:disabled="dialog2"
								:loading="dialog2"
								class="white--text"
								color="white darken-4"
								text
								type="submit"
							>
								Add Customer
							</v-btn>
							<v-dialog v-model="dialog2" hide-overlay persistent width="300">
								<v-card color="white" light>
									<v-card-text>
										<p mt-5>Adding Customer. Please wait.</p>
										<v-progress-linear
											indeterminate
											color="black"
											class="mb-0 mt-5"
										></v-progress-linear>
									</v-card-text>
								</v-card>
							</v-dialog>
						</v-card-actions>
					</form>
				</v-card>
			</v-dialog>
		</div>

		<div class="contents">
			<div v-if="load" class="loading">
				<v-sheet
					:color="`grey ${theme.isDark ? 'darken-2' : 'lighten-4'}`"
					class="pa-3"
				>
					<v-row>
						<v-col v-for="n in 12" :key="n" cols="3">
							<v-skeleton-loader
								class="mx-auto"
								height="250"
								width="250"
								type="card"
							></v-skeleton-loader>
						</v-col>
					</v-row>
				</v-sheet>
			</div>

			<div v-if="error" class="error">
				{{ redirectError() }}
			</div>

			<div v-if="fetched">
				<v-container v-if="customers.length != 0">
					<div class="legend">
						<div class="legendCon">
							<div class="con">
								<div class="normal"></div>
								<p>Good</p>
							</div>
							<div class="con">
								<div class="warning"></div>
								<p>Less than 2 days to expire</p>
							</div>
							<div class="con">
								<div class="error"></div>
								<p>Expired</p>
							</div>
						</div>
					</div>
					<div class="searchCon">
						<v-text-field
							label="Search"
							placeholder="Search"
							solo
							dense
							v-model="search"
						></v-text-field>
					</div>
					<v-row>
						<v-col
							v-for="customer in filteredCustomers"
							:key="customer.id"
							cols="3"
						>
							<v-card
								class="mx-auto"
								max-width="344"
								outlined
								dark
								:class="checkDate(customer.profiles)"
							>
								<v-list-item three-line>
									<v-list-item-content>
										<div class="overline mb-4">
											{{ customer.profiles.length }} Profiles
										</div>
										<v-list-item-title class="overline mb-2">
											{{ customer.customer_firstname }}
											{{ customer.customer_lastname }}
										</v-list-item-title>
										<v-list-item-subtitle>
											{{ customer.customer_phone }}</v-list-item-subtitle
										>
									</v-list-item-content>

									<v-list-item-avatar tile size="70" color="grey">
										<img
											src="https://www.kindpng.com/picc/m/421-4212275_transparent-default-avatar-png-avatar-img-png-download.png"
											alt=""
									/></v-list-item-avatar>
								</v-list-item>

								<v-card-actions>
									<v-btn
										outlined
										rounded
										text
										light
										class="white mb-2 ml-2"
										:userId="userId"
										:to="`/customers/${customer.id}`"
									>
										View Customer
									</v-btn>
									<div class="icoCon" v-show="edit">
										<div class="ico">
											<v-dialog
												transition="dialog-bottom-transition"
												max-width="600"
											>
												<template v-slot:activator="{ on, attrs }">
													<v-btn
														color="success"
														fab
														x-small
														dark
														v-bind="attrs"
														v-on="on"
														@click="setDefaultValues(customer)"
														><v-icon>mdi-pencil</v-icon></v-btn
													>
												</template>

												<template v-slot:default="dialog">
													<v-card dark>
														<form
															action=""
															@submit.prevent="updateCustomer(customer.id)"
															enctype="multipart/form-data"
														>
															<v-card-title>
																<span class="headline">Update Customer</span>
															</v-card-title>
															<v-card-text>
																<v-container>
																	<v-row>
																		<v-col cols="12">
																			<v-text-field
																				label="First Name*"
																				required
																				v-model="newCustomer.customer_firstname"
																			></v-text-field>
																		</v-col>

																		<v-col cols="12">
																			<v-text-field
																				label="Last Name*"
																				required
																				v-model="newCustomer.customer_lastname"
																			></v-text-field>
																		</v-col>

																		<v-col cols="12">
																			<v-text-field
																				label="Phone*"
																				required
																				type="number"
																				v-model="newCustomer.customer_phone"
																			></v-text-field>
																		</v-col>
																		<v-col cols="12">
																			<v-text-field
																				label="Email*"
																				required
																				v-model="newCustomer.customer_email"
																			></v-text-field>
																		</v-col>
																	</v-row>
																</v-container>
																<small>*indicates required field</small>
															</v-card-text>
															<v-card-actions>
																<v-spacer></v-spacer>
																<v-btn
																	color="white darken-4"
																	text
																	@click="dialog.value = false"
																>
																	Cancel
																</v-btn>

																<v-btn
																	:disabled="dialog3"
																	:loading="dialog3"
																	class="white--text"
																	color="white darken-4"
																	text
																	type="submit"
																>
																	Save Customer
																</v-btn>
																<v-dialog
																	v-model="dialog3"
																	hide-overlay
																	persistent
																	width="300"
																>
																	<v-card color="white" light>
																		<v-card-text>
																			<p mt-5>
																				Updating customer. Please wait.
																			</p>
																			<v-progress-linear
																				indeterminate
																				color="black"
																				class="mb-0 mt-5"
																			></v-progress-linear>
																		</v-card-text>
																	</v-card>
																</v-dialog>
															</v-card-actions>
														</form>
													</v-card>
												</template>
											</v-dialog>
										</div>

										<div class="ico">
											<v-dialog persistent max-width="290">
												<template v-slot:activator="{ on, attrs }">
													<v-btn
														color="error"
														fab
														x-small
														dark
														v-bind="attrs"
														v-on="on"
													>
														<v-icon dark>
															mdi-minus
														</v-icon>
													</v-btn>
												</template>

												<template v-slot:default="dialog">
													<v-card dark>
														<v-card-title class="headline">
															Delete Customer?
														</v-card-title>
														<v-card-text
															>Deleting this customer will delete all records
															including profiles related to this</v-card-text
														>
														<v-card-actions>
															<v-spacer></v-spacer>
															<v-btn
																color="white darken-1"
																text
																@click="dialog.value = false"
															>
																Cancel
															</v-btn>

															<v-btn
																:disabled="dialog5"
																:loading="dialog5"
																class="white--text"
																color="red darken-1"
																text
																type="submit"
																@click="deleteCustomer(customer.id, dialog)"
															>
																Delete
															</v-btn>
															<v-dialog
																v-model="dialog5"
																hide-overlay
																persistent
																width="300"
															>
																<v-card color="white" light>
																	<v-card-text>
																		<p mt-5>Deleting customer. Please wait.</p>
																		<v-progress-linear
																			indeterminate
																			color="black"
																			class="mb-0 mt-5"
																		></v-progress-linear>
																	</v-card-text>
																</v-card>
															</v-dialog>
														</v-card-actions>
													</v-card>
												</template>
											</v-dialog>
										</div>
									</div>
								</v-card-actions>
							</v-card>
						</v-col>
					</v-row>
				</v-container>

				<div class="emptyContainer" v-if="customers.length == 0">
					<v-img src="../assets/emptyCustomer.svg" width="350px"></v-img>
					<h2>
						No customers yet? Don't give up! You can do this!
					</h2>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import customerAPI from "../api/customerAPI";

	export default {
		name: "Customers",
		props: { userId: Number },
		data: () => ({
			load: false,
			fetched: null,
			error: null,
			customers: [],
			dialog: false,
			dialog2: false,
			dialog3: false,
			dialog4: false,
			dialog5: false,
			edit: false,
			timeout: 2000,
			snackbar: false,
			text: "",
			result: {},
			customer: {
				customer_firstname: "",
				customer_lastname: "",
				customer_phone: "",
				customer_email: "",
			},
			newCustomer: {
				customer_firstname: "",
				customer_lastname: "",
				customer_phone: "",
				customer_email: "",
			},
			search: "",
		}),
		methods: {
			redirectError() {
				console.log(this.error.message);
				if (this.error.message == "Request failed with status code 404") {
					this.$router.push("/notfound");
				} else if (
					this.error.message == "Request failed with status code 401"
				) {
					this.$router.push("/accessdenied");
				} else if (this.error.message == "Network Error") {
					this.text = this.error.message;
					this.timeout = 5000;
					this.snackbar = true;
				}
			},
			setFormEmpty() {
				this.newCustomer = {
					customer_firstname: "",
					customer_lastname: "",
					customer_phone: "",
					customer_email: "",
				};
			},
			setDefaultValues(customer) {
				this.newCustomer = customer;
			},
			checkDate(profiles) {
				let er = false;
				let warn = false;

				profiles.forEach((profile) => {
					if (Date.now() > new Date(profile.subscription_expires)) {
						er = true;
					}
				});

				profiles.forEach((profile) => {
					if (
						(new Date(profile.subscription_expires) - Date.now()) / 86400000 <=
						2
					) {
						warn = true;
					}
				});

				if (er) {
					return "error";
				} else if (warn) {
					return "warning";
				}
			},
			async addCustomer() {
				try {
					this.dialog2 = true;
					this.result = await customerAPI.prototype.addCustomer(
						this.userId,
						this.customer
					);
					this.text = "Successfully added customer";
					this.dialog2 = false;
					this.dialog = false;
					this.snackbar = true;
					this.getCustomers();
				} catch (error) {
					this.dialog2 = false;
					if (error.message == "Network Error") {
						this.text = error.message;
					} else {
						this.text = "Error adding customer.";
					}

					this.snackbar = true;
				}
			},
			async getCustomers() {
				this.error = this.fetched = null;
				this.load = true;
				try {
					this.customers = await customerAPI.prototype.getAllCustomers(
						this.userId
					);
					this.customers.sort((a, b) => a.id - b.id);
					this.load = false;
					this.fetched = this.customers;
				} catch (error) {
					this.error = error;
				}
			},
			editAccount() {
				this.edit = !this.edit;
			},
			async updateCustomer(id) {
				// const formData = new FormData();

				// formData.append("product_name", this.productName);
				// formData.append("product_image", this.productImage);
				try {
					this.dialog3 = true;

					await customerAPI.prototype.updateSpecificCustomer(
						this.userId,
						id,
						this.newCustomer
					);
					this.text = "Successfully updated customer";
					this.dialog3 = false;
					this.dialog = false;
					this.snackbar = true;
					this.getCustomers();
				} catch (error) {
					this.dialog3 = false;
					if (error.message == "Network Error") {
						this.text = error.message;
					} else {
						this.text = "Error updating customer.";
					}

					this.snackbar = true;
				}
			},
			async deleteCustomer(id, dialog) {
				try {
					this.dialog5 = true;
					await customerAPI.prototype.deleteSpecificCustomer(this.userId, id);
					dialog.value = false;
					this.text = "Successfully deleted customer";
					this.dialog5 = false;
					this.snackbar = true;
					this.getCustomers();
				} catch (error) {
					this.dialog5 = false;
					if (error.message == "Network Error") {
						this.text = error.message;
					} else {
						this.text = "Error deleting customer.";
					}
					this.snackbar = true;
				}
			},
		},
		inject: {
			theme: {
				default: { isDark: false },
			},
		},
		async created() {
			await this.getCustomers();
			this.customers = this.customers.sort((customer1, customer2) => {
				let min1 = new Date(
					customer1.profiles[0].subscription_expires
				).getTime();

				for (let i = 1; i < customer1.profiles.length; i++) {
					if (
						min1 >
						new Date(customer1.profiles[0].subscription_expires).getTime()
					) {
						min1 = new Date(
							customer1.profiles[0].subscription_expires
						).getTime();
					}
				}

				let min2 = new Date(
					customer2.profiles[0].subscription_expires
				).getTime();

				for (let i = 1; i < customer2.profiles.length; i++) {
					if (
						min2 >
						new Date(customer2.profiles[i].subscription_expires).getTime()
					) {
						min2 = new Date(
							customer2.profiles[i].subscription_expires
						).getTime();
					}
				}

				return min1 < min2 ? -1 : 1;
			});
		},

		computed: {
			filteredCustomers: function() {
				return this.customers.filter((customer) => {
					let name =
						customer.customer_firstname + " " + customer.customer_lastname;
					return name.toLowerCase().includes(this.search.toLowerCase());
				});
			},
		},
	};
</script>

<style scoped>
	.customers {
		width: 90%;
		margin: auto;
	}

	.headings {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin: 40px auto;
	}

	.editButton {
		margin: 0px 10px;
	}

	.icoCon {
		display: flex;
		margin-left: auto;
	}
	.ico {
		margin: 0px 5px;
	}

	.loading {
		font-weight: bold;
		text-align: center;
		font-size: 20px;
		padding: 20px;
		margin: 50px auto;
		width: 90%;
	}

	.emptyContainer {
		margin: auto;
		text-align: center;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 20px;
	}

	.emptyContainer h2 {
		padding: 20px;
		font-size: 20px;
	}

	.searchCon {
		width: 300px;
		margin: auto;
		margin-bottom: 40px;
		text-align: center;
	}

	.legend {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		width: 500px;
		margin-left: auto;
		margin-top: -20px;
	}

	.legend .normal,
	.legend .warning,
	.legend .error {
		width: 8px;
		height: 8px;
		padding: 8px;
		border-radius: 100%;
		border: 1px solid grey;
		margin: 5px;
		cursor: pointer;
	}

	.legendCon {
		display: flex;
	}

	.legend .normal {
		background-color: #e1e1e1;
		border: 1px solid grey;
	}

	.con {
		display: flex;
		justify-content: flex-start;
		align-items: center;
	}

	.con p {
		margin: 5px;
		font-size: 12px;
	}
</style>
