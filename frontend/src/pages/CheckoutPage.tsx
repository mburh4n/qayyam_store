import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PageWrapper from '../components/PageWrapper';
import api from '../api/client';
import { useCartStore } from '../store/cartStore';
import type { Address, Order } from '../types';

export default function CheckoutPage() {
	const navigate = useNavigate();
	const { items, clearCart } = useCartStore();
	const [shippingAddress, setShippingAddress] = useState('');
	const [addresses, setAddresses] = useState<Address[]>([]);
	const [selectedAddressId, setSelectedAddressId] = useState<number | ''>('');
	const [notes, setNotes] = useState('');
	const [paymentMethod, setPaymentMethod] = useState<
		'card' | 'cod' | 'bank_transfer' | 'wallet'
	>('card');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

	const total = items.reduce(
		(sum, i) => sum + parseFloat(i.product.price) * i.quantity,
		0
	);

	useEffect(() => {
		api
			.get<Address[] | { results: Address[] }>('/addresses/')
			.then(({ data }) => {
				const list = Array.isArray(data) ? data : data.results ?? [];
				setAddresses(list);
				const defaultAddress = list.find((address) => address.is_default);
				if (defaultAddress) {
					setSelectedAddressId(defaultAddress.id);
					setShippingAddress(defaultAddress.formatted);
				}
			})
			.catch(() => {
				setAddresses([]);
			});
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!shippingAddress.trim() && !selectedAddressId) {
			setError('Please enter your shipping address.');
			return;
		}
		setLoading(true);
		setError('');
		try {
			const payload = {
				items: items.map((i) => ({
					product_id: i.product.id,
					quantity: i.quantity
				})),
				shipping_address: shippingAddress,
				address_id: selectedAddressId || undefined,
				payment_method: paymentMethod,
				notes
			};
			const { data } = await api.post<Order>('/orders/', payload);
			setConfirmedOrder(data);
			clearCart();
		} catch (err: unknown) {
			const msg = (err as { response?: { data?: { detail?: string } } })
				?.response?.data?.detail;
			setError(msg ?? 'Failed to place order. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	if (confirmedOrder) {
		return (
			<PageWrapper>
				<div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-20">
					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.5 }}
						className="text-center max-w-md"
					>
						<motion.div
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							transition={{ type: 'spring', damping: 12, delay: 0.2 }}
							className="w-20 h-20 rounded-full bg-gold-100 flex items-center justify-center mx-auto mb-6"
						>
							<svg
								className="w-10 h-10 text-gold-600"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								strokeWidth={1.5}
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M4.5 12.75l6 6 9-13.5"
								/>
							</svg>
						</motion.div>
						<p className="text-gold-500 text-xs tracking-widest uppercase font-medium mb-2">
							Order Confirmed
						</p>
						<h1 className="font-serif text-4xl font-light text-stone-800 mb-3">
							Thank You
						</h1>
						<p className="text-stone-500 font-light leading-relaxed mb-2">
							Your order{' '}
							<span className="font-medium text-stone-700">
								#{confirmedOrder.id}
							</span>{' '}
							has been placed and is being prepared with care.
						</p>
						<p className="text-stone-400 text-sm mb-8">
							A confirmation will be sent to your account.
						</p>
						<div className="p-4 bg-cream-dark mb-8 text-left">
							<p className="text-[10px] tracking-widest uppercase text-stone-400 font-medium mb-1">
								Order Total
							</p>
							<p className="font-serif text-2xl font-light text-stone-800">
								$
								{parseFloat(confirmedOrder.total_price).toLocaleString(
									'en-US',
									{ minimumFractionDigits: 2 }
								)}
							</p>
						</div>
						<div className="flex flex-col sm:flex-row gap-3 justify-center">
							<button
								onClick={() => navigate('/orders')}
								className="btn-gold"
							>
								View My Orders
							</button>
							<button
								onClick={() => navigate('/')}
								className="btn-outline"
							>
								Continue Shopping
							</button>
						</div>
					</motion.div>
				</div>
			</PageWrapper>
		);
	}

	if (items.length === 0) {
		return (
			<PageWrapper>
				<div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6">
					<div className="text-center">
						<p className="font-serif text-3xl font-light text-stone-500 mb-6">
							Your cart is empty
						</p>
						<Link
							to="/"
							className="btn-gold"
						>
							Browse Collection
						</Link>
					</div>
				</div>
			</PageWrapper>
		);
	}

	return (
		<PageWrapper>
			<div className="max-w-6xl mx-auto px-6 py-16">
				<p className="text-gold-500 text-xs tracking-widest uppercase font-medium mb-2">
					Complete Your Order
				</p>
				<h1 className="font-serif text-4xl font-light text-stone-800 mb-10">
					Checkout
				</h1>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
					{/* ── Shipping Form ── */}
					<div>
						<h2 className="font-serif text-2xl font-light text-stone-700 mb-6">
							Shipping Details
						</h2>
						<form
							onSubmit={handleSubmit}
							className="space-y-5"
						>
							{addresses.length > 0 && (
								<div>
									<label className="block text-xs tracking-widest uppercase text-stone-500 font-medium mb-1.5">
										Saved Address
									</label>
									<select
										value={selectedAddressId}
										onChange={(e) => {
											const addressId = e.target.value ? Number(e.target.value) : '';
											setSelectedAddressId(addressId);
											const selected = addresses.find(
												(address) => address.id === addressId
											);
											if (selected) setShippingAddress(selected.formatted);
										}}
										className="input-field"
									>
										<option value="">Use manual address entry</option>
										{addresses.map((address) => (
											<option
												key={address.id}
												value={address.id}
											>
												{address.label} - {address.city}
											</option>
										))}
									</select>
								</div>
							)}
							<div>
								<label className="block text-xs tracking-widest uppercase text-stone-500 font-medium mb-1.5">
									Shipping Address *
								</label>
								<textarea
									value={shippingAddress}
									onChange={(e) => {
										setShippingAddress(e.target.value);
										setError('');
									}}
									rows={4}
									placeholder="Street address, city, country, postal code…"
									required
									disabled={Boolean(selectedAddressId)}
									className="w-full border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 placeholder-stone-400 outline-none focus:border-gold-500 transition-colors duration-200 resize-none"
								/>
							</div>

							<div>
								<label className="block text-xs tracking-widest uppercase text-stone-500 font-medium mb-1.5">
									Payment Method
								</label>
								<select
									value={paymentMethod}
									onChange={(e) =>
										setPaymentMethod(
											e.target.value as
												| 'card'
												| 'cod'
												| 'bank_transfer'
												| 'wallet'
										)
									}
									className="input-field"
								>
									<option value="card">Card (Mock Gateway)</option>
									<option value="cod">Cash on Delivery</option>
									<option value="bank_transfer">Bank Transfer</option>
									<option value="wallet">Wallet</option>
								</select>
							</div>

							<div>
								<label className="block text-xs tracking-widest uppercase text-stone-500 font-medium mb-1.5">
									Order Notes{' '}
									<span className="normal-case text-stone-400">(optional)</span>
								</label>
								<textarea
									value={notes}
									onChange={(e) => setNotes(e.target.value)}
									rows={2}
									placeholder="Gift wrapping, special instructions…"
									className="w-full border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 placeholder-stone-400 outline-none focus:border-gold-500 transition-colors duration-200 resize-none"
								/>
							</div>

							<AnimatePresence>
								{error && (
									<motion.p
										initial={{ opacity: 0, y: -6 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0 }}
										className="text-xs text-red-600 bg-red-50 border border-red-100 px-3 py-2"
									>
										{error}
									</motion.p>
								)}
							</AnimatePresence>

							<div className="p-4 bg-gold-50 border border-gold-100 text-xs text-gold-800 space-y-1">
								<p className="font-semibold tracking-widest uppercase text-[10px]">
									Mock Checkout
								</p>
								<p>
									No payment details required. This is a demonstration order —
									your selection will be confirmed immediately.
								</p>
							</div>

							<button
								type="submit"
								disabled={loading}
								className="w-full btn-gold"
							>
								{loading ? 'Placing Order…' : 'Place Order'}
							</button>
						</form>
					</div>

					{/* ── Order Summary ── */}
					<div>
						<h2 className="font-serif text-2xl font-light text-stone-700 mb-6">
							Order Summary
						</h2>
						<div className="bg-white border border-stone-100 p-6 space-y-5">
							{/* Items */}
							{items.map((item) => (
								<div
									key={item.product.id}
									className="flex gap-4 pb-5 border-b border-stone-50 last:border-0 last:pb-0"
								>
									<div className="w-16 h-16 flex-shrink-0 bg-cream-dark overflow-hidden">
										{item.product.image_url ? (
											<img
												src={item.product.image_url}
												alt={item.product.title}
												className="w-full h-full object-cover"
											/>
										) : (
											<div className="w-full h-full bg-stone-100" />
										)}
									</div>
									<div className="flex-1 min-w-0">
										<p className="font-serif text-base font-light text-stone-800 truncate">
											{item.product.title}
										</p>
										<p className="text-xs text-stone-400 mt-0.5">
											{item.product.material}
										</p>
										<div className="flex items-center justify-between mt-2">
											<p className="text-xs text-stone-400">
												Qty {item.quantity}
											</p>
											<p className="font-serif text-base text-stone-800">
												$
												{(
													parseFloat(item.product.price) * item.quantity
												).toLocaleString('en-US', { minimumFractionDigits: 2 })}
											</p>
										</div>
									</div>
								</div>
							))}

							{/* Totals */}
							<div className="pt-2 space-y-2 border-t border-stone-100">
								<div className="flex justify-between text-sm text-stone-500">
									<span>Subtotal</span>
									<span>
										$
										{total.toLocaleString('en-US', {
											minimumFractionDigits: 2
										})}
									</span>
								</div>
								<div className="flex justify-between text-sm text-stone-500">
									<span>Shipping</span>
									<span className="text-green-600 font-medium">
										Complimentary
									</span>
								</div>
								<div className="flex justify-between text-sm text-stone-500">
									<span>Taxes</span>
									<span>Included</span>
								</div>
								<div className="flex justify-between font-serif text-xl font-light text-stone-800 pt-3 border-t border-stone-100">
									<span>Total</span>
									<span>
										$
										{total.toLocaleString('en-US', {
											minimumFractionDigits: 2
										})}
									</span>
								</div>
							</div>

							{/* Guarantees */}
							<div className="pt-3 space-y-2 border-t border-stone-50">
								{[
									'Certified authentic gold — hallmarked',
									'Free insured shipping worldwide',
									'30-day returns & lifetime polishing'
								].map((line) => (
									<div
										key={line}
										className="flex items-center gap-2 text-xs text-stone-400"
									>
										<span className="text-gold-500 flex-shrink-0">✦</span>
										{line}
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		</PageWrapper>
	);
}
