import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import PageWrapper from '../components/PageWrapper';
import api from '../api/client';
import type { Category, Order, Payment, Product, User } from '../types';

type TabKey = 'products' | 'orders' | 'payments' | 'customers';

const tabs: { key: TabKey; label: string }[] = [
	{ key: 'products', label: 'Products' },
	{ key: 'orders', label: 'Orders' },
	{ key: 'payments', label: 'Payments' },
	{ key: 'customers', label: 'Customers' }
];

interface ProductForm {
	id?: number;
	title: string;
	slug: string;
	description: string;
	price: string;
	category: string;
	image_url: string;
	model_3d_url: string;
	material: string;
	weight: string;
	stock: number;
	is_featured: boolean;
}

const initialProductForm: ProductForm = {
	title: '',
	slug: '',
	description: '',
	price: '',
	category: '',
	image_url: '',
	model_3d_url: '',
	material: '18K Gold',
	weight: '',
	stock: 10,
	is_featured: false
};

export default function AdminPage() {
	const [activeTab, setActiveTab] = useState<TabKey>('products');
	const [loading, setLoading] = useState(true);

	const [products, setProducts] = useState<Product[]>([]);
	const [categories, setCategories] = useState<Category[]>([]);
	const [categoryForm, setCategoryForm] = useState({
		name: '',
		slug: '',
		description: ''
	});
	const [productForm, setProductForm] = useState<ProductForm>(initialProductForm);
	const [savingProduct, setSavingProduct] = useState(false);

	const [orders, setOrders] = useState<Order[]>([]);
	const [payments, setPayments] = useState<Payment[]>([]);
	const [customers, setCustomers] = useState<User[]>([]);

	const fetchAll = async () => {
		setLoading(true);
		try {
			const [productsRes, categoriesRes, ordersRes, paymentsRes, customersRes] =
				await Promise.all([
					api.get<Product[] | { results: Product[] }>('/products/'),
					api.get<Category[] | { results: Category[] }>('/categories/'),
					api.get<Order[] | { results: Order[] }>('/orders/'),
					api.get<Payment[] | { results: Payment[] }>('/payments/'),
					api.get<User[] | { results: User[] }>('/customers/')
				]);
			setProducts(
				Array.isArray(productsRes.data)
					? productsRes.data
					: productsRes.data.results ?? []
			);
			setCategories(
				Array.isArray(categoriesRes.data)
					? categoriesRes.data
					: categoriesRes.data.results ?? []
			);
			setOrders(
				Array.isArray(ordersRes.data) ? ordersRes.data : ordersRes.data.results ?? []
			);
			setPayments(
				Array.isArray(paymentsRes.data)
					? paymentsRes.data
					: paymentsRes.data.results ?? []
			);
			setCustomers(
				Array.isArray(customersRes.data)
					? customersRes.data
					: customersRes.data.results ?? []
			);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchAll();
	}, []);

	const activeProduct = useMemo(
		() =>
			productForm.id
				? products.find((product) => product.id === productForm.id) ?? null
				: null,
		[productForm.id, products]
	);

	const startEditProduct = (product: Product) => {
		setProductForm({
			id: product.id,
			title: product.title,
			slug: product.slug,
			description: product.description,
			price: product.price,
			category: product.category ? String(product.category) : '',
			image_url: product.image_url,
			model_3d_url: product.model_3d_url,
			material: product.material,
			weight: product.weight ?? '',
			stock: product.stock,
			is_featured: product.is_featured
		});
	};

	const resetProductForm = () => setProductForm(initialProductForm);

	const submitProduct = async (e: React.FormEvent) => {
		e.preventDefault();
		setSavingProduct(true);
		try {
			const payload = {
				...productForm,
				category: productForm.category ? Number(productForm.category) : null,
				weight: productForm.weight || null
			};
			if (productForm.id) {
				await api.patch(`/products/${activeProduct?.slug ?? ''}/`, payload);
			} else {
				await api.post('/products/', payload);
			}
			await fetchAll();
			resetProductForm();
		} finally {
			setSavingProduct(false);
		}
	};

	const updateOrderStatus = async (orderId: number, status: string) => {
		await api.patch(`/orders/${orderId}/`, { status });
		await fetchAll();
	};

	const updatePaymentStatus = async (paymentId: number, status: string) => {
		await api.patch(`/payments/${paymentId}/admin-update/`, { status });
		await fetchAll();
	};

	const updateCustomer = async (
		customerId: number,
		payload: Partial<Pick<User, 'role' | 'is_active'>>
	) => {
		await api.patch(`/customers/${customerId}/`, payload);
		await fetchAll();
	};

	return (
		<PageWrapper>
			<div className="max-w-7xl mx-auto px-6 py-12">
				<p className="text-gold-500 text-xs tracking-widest uppercase font-medium mb-2">
					Operations
				</p>
				<h1 className="font-serif text-4xl font-light text-stone-800 mb-8">
					Admin Control Center
				</h1>

				<div className="flex flex-wrap gap-2 mb-8">
					{tabs.map((tab) => (
						<button
							key={tab.key}
							onClick={() => setActiveTab(tab.key)}
							className={`px-4 py-2 text-xs uppercase tracking-widest border font-medium ${
								activeTab === tab.key
									? 'bg-forest text-gold-400 border-forest'
									: 'border-stone-200 text-stone-500'
							}`}
						>
							{tab.label}
						</button>
					))}
				</div>

				{loading && <div className="h-20 bg-stone-100 animate-pulse" />}

				{!loading && activeTab === 'products' && (
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
						<form
							onSubmit={submitProduct}
							className="bg-white border border-stone-100 p-5 space-y-3"
						>
							<h2 className="font-serif text-2xl font-light text-stone-800">
								{productForm.id ? 'Edit Product' : 'Create Product'}
							</h2>
							<input
								value={productForm.title}
								onChange={(e) =>
									setProductForm((v) => ({ ...v, title: e.target.value }))
								}
								placeholder="Title"
								className="input-field"
								required
							/>
							<input
								value={productForm.slug}
								onChange={(e) =>
									setProductForm((v) => ({ ...v, slug: e.target.value }))
								}
								placeholder="Slug (optional)"
								className="input-field"
							/>
							<textarea
								value={productForm.description}
								onChange={(e) =>
									setProductForm((v) => ({ ...v, description: e.target.value }))
								}
								placeholder="Description"
								className="input-field min-h-24"
								required
							/>
							<div className="grid grid-cols-2 gap-3">
								<input
									type="number"
									step="0.01"
									value={productForm.price}
									onChange={(e) =>
										setProductForm((v) => ({ ...v, price: e.target.value }))
									}
									placeholder="Price"
									className="input-field"
									required
								/>
								<input
									type="number"
									value={productForm.stock}
									onChange={(e) =>
										setProductForm((v) => ({
											...v,
											stock: Number(e.target.value)
										}))
									}
									placeholder="Stock"
									className="input-field"
									required
								/>
							</div>
							<select
								value={productForm.category}
								onChange={(e) =>
									setProductForm((v) => ({ ...v, category: e.target.value }))
								}
								className="input-field"
							>
								<option value="">No category</option>
								{categories.map((category) => (
									<option
										key={category.id}
										value={category.id}
									>
										{category.name}
									</option>
								))}
							</select>
							<input
								value={productForm.material}
								onChange={(e) =>
									setProductForm((v) => ({ ...v, material: e.target.value }))
								}
								placeholder="Material"
								className="input-field"
							/>
							<input
								value={productForm.weight}
								onChange={(e) =>
									setProductForm((v) => ({ ...v, weight: e.target.value }))
								}
								placeholder="Weight (grams)"
								className="input-field"
							/>
							<input
								value={productForm.image_url}
								onChange={(e) =>
									setProductForm((v) => ({ ...v, image_url: e.target.value }))
								}
								placeholder="Image URL"
								className="input-field"
							/>
							<input
								value={productForm.model_3d_url}
								onChange={(e) =>
									setProductForm((v) => ({ ...v, model_3d_url: e.target.value }))
								}
								placeholder="3D Model URL"
								className="input-field"
							/>
							<label className="flex items-center gap-2 text-xs text-stone-600 uppercase tracking-widest">
								<input
									type="checkbox"
									checked={productForm.is_featured}
									onChange={(e) =>
										setProductForm((v) => ({ ...v, is_featured: e.target.checked }))
									}
								/>
								Featured product
							</label>
							<div className="flex gap-3">
								<button
									disabled={savingProduct}
									className="btn-gold flex-1"
								>
									{savingProduct ? 'Saving…' : productForm.id ? 'Update' : 'Create'}
								</button>
								{productForm.id && (
									<button
										type="button"
										onClick={resetProductForm}
										className="btn-outline"
									>
										Cancel
									</button>
								)}
							</div>
						</form>

						<div className="space-y-3">
							<div className="bg-white border border-stone-100 p-4 space-y-3">
								<p className="font-serif text-xl text-stone-800">Categories</p>
								<div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
									<input
										value={categoryForm.name}
										onChange={(e) =>
											setCategoryForm((v) => ({ ...v, name: e.target.value }))
										}
										placeholder="Name"
										className="input-field"
									/>
									<input
										value={categoryForm.slug}
										onChange={(e) =>
											setCategoryForm((v) => ({ ...v, slug: e.target.value }))
										}
										placeholder="slug"
										className="input-field"
									/>
									<input
										value={categoryForm.description}
										onChange={(e) =>
											setCategoryForm((v) => ({
												...v,
												description: e.target.value
											}))
										}
										placeholder="description"
										className="input-field"
									/>
								</div>
								<button
									onClick={async () => {
										await api.post('/categories/', categoryForm);
										setCategoryForm({ name: '', slug: '', description: '' });
										await fetchAll();
									}}
									className="btn-outline"
								>
									Add Category
								</button>
								<div className="flex flex-wrap gap-2">
									{categories.map((category) => (
										<button
											key={category.id}
											onClick={async () => {
												await api.delete(`/categories/${category.slug}/`);
												await fetchAll();
											}}
											className="text-xs px-3 py-1 border border-stone-200 text-stone-500 hover:text-red-500"
										>
											{category.name} ×
										</button>
									))}
								</div>
							</div>
							{products.map((product) => (
								<motion.div
									key={product.id}
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									className="bg-white border border-stone-100 p-4"
								>
									<div className="flex items-start justify-between gap-4">
										<div>
											<p className="font-serif text-xl text-stone-800">{product.title}</p>
											<p className="text-xs text-stone-500 mt-1">
												${Number(product.price).toLocaleString()} · Stock {product.stock}
											</p>
										</div>
										<div className="flex gap-3 text-xs uppercase tracking-widest">
											<button
												onClick={() => startEditProduct(product)}
												className="text-stone-500 hover:text-gold-600"
											>
												Edit
											</button>
											<button
												onClick={async () => {
													await api.delete(`/products/${product.slug}/`);
													await fetchAll();
												}}
												className="text-red-400 hover:text-red-600"
											>
												Delete
											</button>
										</div>
									</div>
								</motion.div>
							))}
						</div>
					</div>
				)}

				{!loading && activeTab === 'orders' && (
					<div className="space-y-3">
						{orders.map((order) => (
							<div
								key={order.id}
								className="bg-white border border-stone-100 p-4"
							>
								<div className="flex flex-wrap items-center justify-between gap-3">
									<div>
										<p className="font-serif text-xl text-stone-800">Order #{order.id}</p>
										<p className="text-sm text-stone-500">
											{order.user_name} · ${Number(order.total_price).toLocaleString()}
										</p>
									</div>
									<select
										value={order.status}
										onChange={(e) => updateOrderStatus(order.id, e.target.value)}
										className="input-field max-w-44"
									>
										{[
											'pending',
											'confirmed',
											'processing',
											'shipped',
											'delivered',
											'cancelled'
										].map((status) => (
											<option
												key={status}
												value={status}
											>
												{status}
											</option>
										))}
									</select>
								</div>
							</div>
						))}
					</div>
				)}

				{!loading && activeTab === 'payments' && (
					<div className="space-y-3">
						{payments.map((payment) => (
							<div
								key={payment.id}
								className="bg-white border border-stone-100 p-4"
							>
								<div className="flex flex-wrap items-center justify-between gap-3">
									<div>
										<p className="font-serif text-xl text-stone-800">
											Payment #{payment.id}
										</p>
										<p className="text-sm text-stone-500">
											Order #{payment.order} · {payment.user_name} · $
											{Number(payment.amount).toLocaleString()} · {payment.method}
										</p>
									</div>
									<select
										value={payment.status}
										onChange={(e) =>
											updatePaymentStatus(payment.id, e.target.value)
										}
										className="input-field max-w-44"
									>
										{['pending', 'paid', 'failed', 'refunded'].map((status) => (
											<option
												key={status}
												value={status}
											>
												{status}
											</option>
										))}
									</select>
								</div>
							</div>
						))}
					</div>
				)}

				{!loading && activeTab === 'customers' && (
					<div className="space-y-3">
						{customers.map((customer) => (
							<div
								key={customer.id}
								className="bg-white border border-stone-100 p-4"
							>
								<div className="flex flex-wrap items-center justify-between gap-4">
									<div>
										<p className="font-serif text-xl text-stone-800">
											{customer.first_name || customer.last_name
												? `${customer.first_name} ${customer.last_name}`
												: customer.username}
										</p>
										<p className="text-sm text-stone-500">{customer.email}</p>
									</div>
									<div className="flex flex-wrap gap-2">
										<select
											value={customer.role}
											onChange={(e) =>
												updateCustomer(customer.id, {
													role: e.target.value as User['role']
												})
											}
											className="input-field max-w-32"
										>
											<option value="customer">customer</option>
											<option value="admin">admin</option>
										</select>
										<button
											onClick={() =>
												updateCustomer(customer.id, {
													is_active: !customer.is_active
												})
											}
											className="btn-outline"
										>
											{customer.is_active ? 'Disable' : 'Enable'}
										</button>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</PageWrapper>
	);
}
