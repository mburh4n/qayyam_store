export interface User {
	id: number;
	username: string;
	email: string;
	first_name: string;
	last_name: string;
	role: 'admin' | 'customer';
	phone: string;
	address: string;
	is_active: boolean;
	date_joined: string;
}

export interface Category {
	id: number;
	name: string;
	slug: string;
	description: string;
	product_count: number;
}

export interface Product {
	id: number;
	title: string;
	slug: string;
	description: string;
	price: string;
	category: number | null;
	category_name: string;
	image_url: string;
	model_3d_url: string;
	material: string;
	weight: string | null;
	stock: number;
	is_featured: boolean;
	created_at: string;
}

export interface OrderItem {
	id: number;
	product: number;
	product_title: string;
	product_image: string;
	quantity: number;
	unit_price: string;
	subtotal: string;
}

export interface Order {
	id: number;
	user: number;
	user_name: string;
	status: string;
	total_price: string;
	shipping_address: string;
	notes: string;
	items: OrderItem[];
	payment?: Payment;
	created_at: string;
	updated_at: string;
}

export interface Address {
	id: number;
	user: number;
	label: string;
	full_name: string;
	phone: string;
	address_line_1: string;
	address_line_2: string;
	city: string;
	state: string;
	postal_code: string;
	country: string;
	is_default: boolean;
	formatted: string;
	created_at: string;
	updated_at: string;
}

export interface Payment {
	id: number;
	order: number;
	user: number;
	user_name: string;
	amount: string;
	currency: string;
	method: 'card' | 'cod' | 'bank_transfer' | 'wallet';
	status: 'pending' | 'paid' | 'failed' | 'refunded';
	transaction_id: string;
	provider: string;
	notes: string;
	paid_at: string | null;
	created_at: string;
	updated_at: string;
}

export interface CartItem {
	product: Product;
	quantity: number;
}

export interface PaginatedResponse<T> {
	count: number;
	next: string | null;
	previous: string | null;
	results: T[];
}
