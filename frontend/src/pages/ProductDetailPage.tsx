import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageWrapper from '../components/PageWrapper';
import JewelryViewer from '../components/JewelryViewer';
import type { Product } from '../types';
import api from '../api/client';
import { useCartStore } from '../store/cartStore';

export default function ProductDetailPage() {
	const { slug } = useParams<{ slug: string }>();
	const [product, setProduct] = useState<Product | null>(null);
	const [loading, setLoading] = useState(true);
	const [notFound, setNotFound] = useState(false);
	const [quantity, setQuantity] = useState(1);
	const [added, setAdded] = useState(false);
	const { addItem, setIsOpen } = useCartStore();

	useEffect(() => {
		if (!slug) return;
		setLoading(true);
		api
			.get(`/products/${slug}/`)
			.then(({ data }) => setProduct(data))
			.catch(() => setNotFound(true))
			.finally(() => setLoading(false));
	}, [slug]);

	const handleAddToCart = () => {
		if (!product) return;
		addItem(product, quantity);
		setAdded(true);
		setTimeout(() => setAdded(false), 2000);
		setIsOpen(true);
	};

	if (loading) {
		return (
			<PageWrapper>
				<div className="max-w-7xl mx-auto px-6 py-20">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
						<div className="bg-stone-100 animate-pulse h-[560px]" />
						<div className="space-y-4 pt-8">
							<div className="h-4 bg-stone-100 animate-pulse w-1/3 rounded" />
							<div className="h-10 bg-stone-100 animate-pulse w-3/4 rounded" />
							<div className="h-4 bg-stone-100 animate-pulse w-1/4 rounded" />
							<div className="h-px bg-stone-100 animate-pulse my-6" />
							<div className="h-24 bg-stone-100 animate-pulse rounded" />
						</div>
					</div>
				</div>
			</PageWrapper>
		);
	}

	if (notFound || !product) {
		return (
			<PageWrapper>
				<div className="max-w-7xl mx-auto px-6 py-32 text-center">
					<p className="font-serif text-3xl font-light text-stone-500">
						Product not found
					</p>
					<Link
						to="/"
						className="btn-gold mt-8 inline-flex"
					>
						Return to Collection
					</Link>
				</div>
			</PageWrapper>
		);
	}

	return (
		<PageWrapper>
			<div className="max-w-7xl mx-auto px-6 py-16">
				{/* Breadcrumb */}
				<nav className="flex items-center gap-2 text-xs tracking-widest uppercase text-stone-400 mb-10">
					<Link
						to="/"
						className="hover:text-gold-600 transition-colors"
					>
						Collection
					</Link>
					<span>›</span>
					<span className="text-gold-600">{product.category_name}</span>
					<span>›</span>
					<span className="text-stone-600 truncate">{product.title}</span>
				</nav>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
					{/* 3D Viewer */}
					<motion.div
						initial={{ opacity: 0, x: -30 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
						className="sticky top-24"
					>
						<div className="bg-forest rounded-none overflow-hidden h-[520px] lg:h-[600px]">
							<JewelryViewer variant="ring" />
						</div>
						<p className="text-center text-xs text-stone-400 mt-3 tracking-widest uppercase">
							Drag to rotate · Scroll to zoom
						</p>
					</motion.div>

					{/* Product Info */}
					<motion.div
						initial={{ opacity: 0, x: 30 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
						className="pt-4"
					>
						<p className="text-gold-500 text-xs tracking-widests uppercase font-medium mb-3">
							{product.category_name}
						</p>
						<h1 className="font-serif text-4xl md:text-5xl font-light text-stone-800 leading-snug mb-4">
							{product.title}
						</h1>
						<div className="flex items-center gap-4 mb-6">
							<span className="font-serif text-3xl font-light text-stone-800">
								$
								{parseFloat(product.price).toLocaleString('en-US', {
									minimumFractionDigits: 0
								})}
							</span>
							{product.stock <= 3 && product.stock > 0 && (
								<span className="text-xs text-amber-600 font-medium tracking-widest uppercase">
									Only {product.stock} left
								</span>
							)}
							{product.stock === 0 && (
								<span className="text-xs text-red-500 font-medium tracking-widest uppercase">
									Out of Stock
								</span>
							)}
						</div>

						<hr className="border-stone-100 mb-6" />

						{/* Description */}
						<p className="text-stone-600 text-base leading-relaxed font-light mb-8">
							{product.description}
						</p>

						{/* Specs */}
						<div className="grid grid-cols-2 gap-4 mb-8">
							{[
								{ label: 'Material', value: product.material },
								{
									label: 'Weight',
									value: product.weight ? `${product.weight}g` : '—'
								},
								{ label: 'Category', value: product.category_name },
								{ label: 'Condition', value: 'New' }
							].map(({ label, value }) => (
								<div
									key={label}
									className="bg-cream-dark px-4 py-3"
								>
									<p className="text-[10px] tracking-widest uppercase text-stone-400 font-medium mb-0.5">
										{label}
									</p>
									<p className="text-sm text-stone-700 font-medium">{value}</p>
								</div>
							))}
						</div>

						{/* Qty + Cart */}
						{product.stock > 0 && (
							<div className="flex gap-3 mb-6">
								<div className="flex items-center border border-stone-200 bg-white">
									<button
										onClick={() => setQuantity((q) => Math.max(1, q - 1))}
										className="w-10 h-12 flex items-center justify-center text-stone-500 hover:text-stone-900 transition-colors"
									>
										−
									</button>
									<span className="w-10 text-center text-sm font-medium text-stone-800">
										{quantity}
									</span>
									<button
										onClick={() =>
											setQuantity((q) => Math.min(product.stock, q + 1))
										}
										className="w-10 h-12 flex items-center justify-center text-stone-500 hover:text-stone-900 transition-colors"
									>
										+
									</button>
								</div>
								<motion.button
									onClick={handleAddToCart}
									whileTap={{ scale: 0.97 }}
									className={`flex-1 btn-gold text-[11px] ${added ? 'bg-green-600 text-white hover:bg-green-600' : ''}`}
								>
									{added ? '✓ Added to Cart' : 'Add to Cart'}
								</motion.button>
							</div>
						)}

						{/* Guarantees */}
						<div className="space-y-2 pt-4 border-t border-stone-100">
							{[
								'Certified authentic gold — hallmarked',
								'Free insured shipping worldwide',
								'30-day returns & lifetime polishing'
							].map((line) => (
								<div
									key={line}
									className="flex items-center gap-2 text-xs text-stone-500"
								>
									<span className="text-gold-500">✦</span>
									{line}
								</div>
							))}
						</div>
					</motion.div>
				</div>
			</div>
		</PageWrapper>
	);
}
