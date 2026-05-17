import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../store/cartStore';

export default function CartDrawer() {
	const navigate = useNavigate();
	const { items, isOpen, setIsOpen, removeItem, updateQuantity, clearCart } =
		useCartStore();

	const total = items.reduce(
		(sum, i) => sum + parseFloat(i.product.price) * i.quantity,
		0
	);
	const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

	const handleCheckout = useCallback(() => {
		setIsOpen(false);
		navigate('/checkout');
	}, [setIsOpen, navigate]);

	return (
		<AnimatePresence>
			{isOpen && (
				<>
					{/* Overlay */}
					<motion.div
						key="overlay"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.25 }}
						className="fixed inset-0 z-40 bg-stone-900/60 backdrop-blur-sm"
						onClick={() => setIsOpen(false)}
					/>

					{/* Drawer */}
					<motion.aside
						key="drawer"
						initial={{ x: '100%' }}
						animate={{ x: 0 }}
						exit={{ x: '100%' }}
						transition={{ type: 'spring', damping: 30, stiffness: 300 }}
						className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-cream shadow-2xl flex flex-col"
					>
						{/* Header */}
						<div className="flex items-center justify-between px-6 py-5 border-b border-stone-200">
							<div>
								<h2 className="font-serif text-2xl font-light text-stone-800">
									Your Cart
								</h2>
								<p className="text-xs text-stone-400 mt-0.5">
									{itemCount} {itemCount === 1 ? 'item' : 'items'}
								</p>
							</div>
							<button
								onClick={() => setIsOpen(false)}
								className="p-2 text-stone-400 hover:text-stone-700 transition-colors"
								aria-label="Close cart"
							>
								<svg
									className="w-5 h-5"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									strokeWidth={1.5}
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</button>
						</div>

						{/* Items */}
						<div className="flex-1 overflow-y-auto px-6 py-4">
							{items.length === 0 ? (
								<div className="flex flex-col items-center justify-center h-full text-center gap-4 text-stone-400">
									<svg
										className="w-16 h-16 opacity-30"
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
									<p className="font-serif text-xl font-light">
										Your cart is empty
									</p>
									<button
										onClick={() => setIsOpen(false)}
										className="btn-outline text-[11px]"
									>
										Continue Shopping
									</button>
								</div>
							) : (
								<div className="space-y-6">
									<AnimatePresence>
										{items.map((item) => (
											<motion.div
												key={item.product.id}
												initial={{ opacity: 0, x: 20 }}
												animate={{ opacity: 1, x: 0 }}
												exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
												transition={{ duration: 0.25 }}
												className="flex gap-4 pb-6 border-b border-stone-100 last:border-0"
											>
												{/* Product Image */}
												<div className="w-20 h-20 flex-shrink-0 bg-cream-dark overflow-hidden">
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

												{/* Info */}
												<div className="flex-1 min-w-0">
													<p className="text-[10px] tracking-widest uppercase text-gold-600 font-medium">
														{item.product.category_name}
													</p>
													<p className="font-serif text-base font-light text-stone-800 leading-snug truncate">
														{item.product.title}
													</p>
													<p className="text-xs text-stone-400 mt-0.5">
														{item.product.material}
													</p>

													<div className="flex items-center justify-between mt-3">
														{/* Qty controls */}
														<div className="flex items-center gap-2 border border-stone-200">
															<button
																onClick={() =>
																	updateQuantity(
																		item.product.id,
																		item.quantity - 1
																	)
																}
																className="w-7 h-7 flex items-center justify-center text-stone-500 hover:text-stone-900 transition-colors text-sm"
															>
																−
															</button>
															<span className="text-xs w-5 text-center font-medium">
																{item.quantity}
															</span>
															<button
																onClick={() =>
																	updateQuantity(
																		item.product.id,
																		item.quantity + 1
																	)
																}
																className="w-7 h-7 flex items-center justify-center text-stone-500 hover:text-stone-900 transition-colors text-sm"
															>
																+
															</button>
														</div>

														<div className="flex items-center gap-3">
															<span className="font-serif text-base">
																$
																{(
																	parseFloat(item.product.price) * item.quantity
																).toLocaleString()}
															</span>
															<button
																onClick={() => removeItem(item.product.id)}
																className="text-stone-300 hover:text-red-500 transition-colors"
																aria-label="Remove item"
															>
																<svg
																	className="w-4 h-4"
																	fill="none"
																	viewBox="0 0 24 24"
																	stroke="currentColor"
																	strokeWidth={1.5}
																>
																	<path
																		strokeLinecap="round"
																		strokeLinejoin="round"
																		d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
																	/>
																</svg>
															</button>
														</div>
													</div>
												</div>
											</motion.div>
										))}
									</AnimatePresence>

									<button
										onClick={clearCart}
										className="text-xs text-stone-400 hover:text-red-500 transition-colors tracking-widest uppercase"
									>
										Clear Cart
									</button>
								</div>
							)}
						</div>

						{/* Footer */}
						{items.length > 0 && (
							<div className="px-6 py-6 border-t border-stone-200 bg-white">
								<div className="flex items-center justify-between mb-1">
									<span className="text-xs tracking-widest uppercase text-stone-500 font-medium">
										Subtotal
									</span>
									<span className="font-serif text-2xl font-light">
										$
										{total.toLocaleString('en-US', {
											minimumFractionDigits: 2
										})}
									</span>
								</div>
								<p className="text-xs text-stone-400 mb-5">
									Shipping & taxes calculated at checkout
								</p>
								<button
									onClick={handleCheckout}
									className="w-full btn-gold"
								>
									Proceed to Checkout
								</button>
							</div>
						)}
					</motion.aside>
				</>
			)}
		</AnimatePresence>
	);
}
