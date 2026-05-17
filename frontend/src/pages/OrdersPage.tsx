import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageWrapper from '../components/PageWrapper';
import api from '../api/client';
import type { Order } from '../types';

const STATUS_CLASSES: Record<string, string> = {
	pending: 'status-pending',
	confirmed: 'status-confirmed',
	processing: 'status-processing',
	shipped: 'status-shipped',
	delivered: 'status-delivered',
	cancelled: 'status-cancelled'
};

export default function OrdersPage() {
	const [orders, setOrders] = useState<Order[]>([]);
	const [loading, setLoading] = useState(true);
	const [expandedId, setExpandedId] = useState<number | null>(null);
	const [cancelling, setCancelling] = useState<number | null>(null);

	const fetchOrders = () => {
		setLoading(true);
		api
			.get<Order[] | { results: Order[] }>('/orders/')
			.then(({ data }) => {
				setOrders(
					Array.isArray(data)
						? data
						: ((data as { results: Order[] }).results ?? [])
				);
			})
			.finally(() => setLoading(false));
	};

	useEffect(() => {
		fetchOrders();
	}, []);

	const handleCancel = async (orderId: number) => {
		if (!window.confirm('Are you sure you want to cancel this order?')) return;
		setCancelling(orderId);
		try {
			const { data } = await api.patch<Order>(`/orders/${orderId}/cancel/`);
			setOrders((prev) => prev.map((o) => (o.id === data.id ? data : o)));
		} catch {
			alert('Unable to cancel this order at this stage.');
		} finally {
			setCancelling(null);
		}
	};

	return (
		<PageWrapper>
			<div className="max-w-4xl mx-auto px-6 py-16">
				<p className="text-gold-500 text-xs tracking-widest uppercase font-medium mb-2">
					Account
				</p>
				<h1 className="font-serif text-4xl font-light text-stone-800 mb-10">
					My Orders
				</h1>

				{/* Loading skeletons */}
				{loading && (
					<div className="space-y-4">
						{Array.from({ length: 3 }).map((_, i) => (
							<div
								key={i}
								className="h-24 bg-stone-100 animate-pulse"
							/>
						))}
					</div>
				)}

				{/* Empty state */}
				{!loading && orders.length === 0 && (
					<div className="text-center py-24 text-stone-400">
						<svg
							className="w-16 h-16 mx-auto mb-6 opacity-20"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth={0.8}
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"
							/>
						</svg>
						<p className="font-serif text-3xl font-light mb-3">No orders yet</p>
						<p className="text-sm mb-8">
							Your future purchases will appear here.
						</p>
						<Link
							to="/"
							className="btn-gold"
						>
							Explore Collection
						</Link>
					</div>
				)}

				{/* Orders list */}
				{!loading && orders.length > 0 && (
					<div className="space-y-4">
						{orders.map((order, idx) => (
							<motion.div
								key={order.id}
								initial={{ opacity: 0, y: 16 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.3, delay: idx * 0.06 }}
								className="bg-white border border-stone-100 overflow-hidden"
							>
								{/* Order header row — click to expand */}
								<button
									onClick={() =>
										setExpandedId(expandedId === order.id ? null : order.id)
									}
									className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-stone-50 transition-colors"
								>
									<div className="flex items-center gap-6 flex-wrap">
										<div>
											<p className="text-[10px] tracking-widest uppercase text-stone-400 font-medium mb-0.5">
												Order
											</p>
											<p className="font-serif text-lg font-light text-stone-800">
												#{order.id}
											</p>
										</div>
										<div>
											<p className="text-[10px] tracking-widest uppercase text-stone-400 font-medium mb-0.5">
												Date
											</p>
											<p className="text-sm text-stone-600">
												{new Date(order.created_at).toLocaleDateString(
													'en-US',
													{
														year: 'numeric',
														month: 'long',
														day: 'numeric'
													}
												)}
											</p>
										</div>
										<div>
											<p className="text-[10px] tracking-widest uppercase text-stone-400 font-medium mb-0.5">
												Total
											</p>
											<p className="font-serif text-lg font-light text-stone-800">
												$
												{parseFloat(order.total_price).toLocaleString('en-US', {
													minimumFractionDigits: 2
												})}
											</p>
										</div>
										<span
											className={
												STATUS_CLASSES[order.status] ??
												'badge bg-stone-100 text-stone-600'
											}
										>
											{order.status}
										</span>
									</div>
									<svg
										className={`w-4 h-4 text-stone-400 flex-shrink-0 transition-transform duration-200 ${expandedId === order.id ? 'rotate-180' : ''}`}
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										strokeWidth={2}
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M19 9l-7 7-7-7"
										/>
									</svg>
								</button>

								{/* Expanded detail */}
								<motion.div
									initial={false}
									animate={{
										height: expandedId === order.id ? 'auto' : 0,
										opacity: expandedId === order.id ? 1 : 0
									}}
									transition={{ duration: 0.25, ease: 'easeInOut' }}
									className="overflow-hidden"
								>
									<div className="px-6 pb-6 border-t border-stone-100 pt-5 space-y-4">
										{/* Line items */}
										{order.items.map((item) => (
											<div
												key={item.id}
												className="flex gap-4 items-center"
											>
												<div className="w-12 h-12 bg-cream-dark flex-shrink-0 overflow-hidden">
													{item.product_image ? (
														<img
															src={item.product_image}
															alt={item.product_title}
															className="w-full h-full object-cover"
														/>
													) : (
														<div className="w-full h-full bg-stone-100" />
													)}
												</div>
												<div className="flex-1 min-w-0">
													<p className="text-sm font-medium text-stone-700 truncate">
														{item.product_title}
													</p>
													<p className="text-xs text-stone-400">
														Qty {item.quantity} · $
														{parseFloat(item.unit_price).toLocaleString(
															'en-US',
															{ minimumFractionDigits: 2 }
														)}{' '}
														each
													</p>
												</div>
												<p className="font-serif text-base text-stone-800 flex-shrink-0">
													$
													{parseFloat(item.subtotal).toLocaleString('en-US', {
														minimumFractionDigits: 2
													})}
												</p>
											</div>
										))}

										{/* Shipping address */}
										<div className="bg-cream-dark px-4 py-3">
											<p className="text-[10px] tracking-widest uppercase text-stone-400 font-medium mb-1">
												Shipping Address
											</p>
											<p className="text-sm text-stone-600 whitespace-pre-wrap">
												{order.shipping_address}
											</p>
										</div>

										{order.payment && (
											<div className="bg-cream-dark px-4 py-3">
												<p className="text-[10px] tracking-widest uppercase text-stone-400 font-medium mb-1">
													Payment
												</p>
												<p className="text-sm text-stone-600">
													{order.payment.method} · {order.payment.status}
													{order.payment.transaction_id
														? ` · ${order.payment.transaction_id}`
														: ''}
												</p>
											</div>
										)}

										{/* Notes */}
										{order.notes && (
											<div className="bg-cream-dark px-4 py-3">
												<p className="text-[10px] tracking-widest uppercase text-stone-400 font-medium mb-1">
													Notes
												</p>
												<p className="text-sm text-stone-600">{order.notes}</p>
											</div>
										)}

										{/* Cancel action */}
										{['pending', 'confirmed'].includes(order.status) && (
											<button
												onClick={() => handleCancel(order.id)}
												disabled={cancelling === order.id}
												className="text-xs tracking-widest uppercase text-red-400 hover:text-red-600 font-medium transition-colors disabled:opacity-40"
											>
												{cancelling === order.id
													? 'Cancelling…'
													: 'Cancel Order'}
											</button>
										)}
									</div>
								</motion.div>
							</motion.div>
						))}
					</div>
				)}
			</div>
		</PageWrapper>
	);
}
