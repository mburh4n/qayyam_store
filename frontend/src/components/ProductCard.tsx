import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Product } from '../types';
import { useCartStore } from '../store/cartStore';

interface ProductCardProps {
	product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
	const { addItem, setIsOpen } = useCartStore();

	const handleAddToCart = (e: React.MouseEvent) => {
		e.preventDefault();
		addItem(product, 1);
		setIsOpen(true);
	};

	return (
		<motion.article
			initial={{ opacity: 0, y: 24 }}
			animate={{ opacity: 1, y: 0 }}
			whileHover={{ y: -4 }}
			transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
			className="group bg-white border border-stone-100 overflow-hidden"
		>
			<Link
				to={`/product/${product.slug}`}
				className="block"
			>
				{/* Image */}
				<div className="relative overflow-hidden bg-cream-dark aspect-square">
					{product.image_url ? (
						<img
							src={product.image_url}
							alt={product.title}
							className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
							loading="lazy"
						/>
					) : (
						<div className="w-full h-full flex items-center justify-center text-stone-300">
							<svg
								className="w-16 h-16"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={0.5}
									d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
								/>
							</svg>
						</div>
					)}
					{product.is_featured && (
						<span className="absolute top-3 left-3 badge bg-forest text-gold-400 text-[10px]">
							Featured
						</span>
					)}
				</div>

				{/* Info */}
				<div className="p-5">
					<p className="text-xs tracking-widest uppercase text-gold-600 font-medium mb-1">
						{product.category_name}
					</p>
					<h3 className="font-serif text-xl font-light text-stone-800 leading-snug mb-1 group-hover:text-gold-700 transition-colors">
						{product.title}
					</h3>
					<p className="text-xs text-stone-400 mb-3 font-light">
						{product.material}
					</p>
					<div className="flex items-center justify-between">
						<span className="font-serif text-lg text-stone-800">
							$
							{parseFloat(product.price).toLocaleString('en-US', {
								minimumFractionDigits: 0
							})}
						</span>
						<span className="text-xs tracking-widest uppercase text-stone-500 group-hover:text-gold-600 transition-colors">
							View →
						</span>
					</div>
				</div>
			</Link>

			{/* Add to Cart */}
			<div className="px-5 pb-5">
				<button
					onClick={handleAddToCart}
					disabled={product.stock === 0}
					className="w-full btn-gold text-[11px]"
				>
					{product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
				</button>
			</div>
		</motion.article>
	);
}
