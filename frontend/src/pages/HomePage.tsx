import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageWrapper from '../components/PageWrapper';
import ProductCard from '../components/ProductCard';
import JewelryViewer from '../components/JewelryViewer';
import type { Product, Category } from '../types';
import api from '../api/client';

const stagger = {
	animate: { transition: { staggerChildren: 0.08 } }
};

export default function HomePage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const [products, setProducts] = useState<Product[]>([]);
	const [categories, setCategories] = useState<Category[]>([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState('');

	const activeCategory = searchParams.get('category') ?? '';

	const fetchProducts = useCallback(async () => {
		setLoading(true);
		try {
			const params: Record<string, string> = {};
			if (activeCategory) params.category = activeCategory;
			if (search) params.search = search;
			const { data } = await api.get('/products/', { params });
			const list: Product[] = Array.isArray(data) ? data : (data.results ?? []);
			setProducts(list);
		} finally {
			setLoading(false);
		}
	}, [activeCategory, search]);

	useEffect(() => {
		api.get('/categories/').then(({ data }) => {
			setCategories(Array.isArray(data) ? data : (data.results ?? []));
		});
	}, []);

	useEffect(() => {
		fetchProducts();
	}, [fetchProducts]);

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		fetchProducts();
	};

	return (
		<PageWrapper>
			{/* Hero */}
			<section className="relative bg-forest min-h-[92vh] flex items-center overflow-hidden">
				<div
					className="absolute inset-0 opacity-10"
					style={{
						backgroundImage:
							'radial-gradient(circle at 30% 50%, #c9a84c 0%, transparent 60%)'
					}}
				/>

				<div className="relative z-10 max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-20">
					{/* Copy */}
					<motion.div
						initial="hidden"
						animate="visible"
						variants={{
							hidden: {},
							visible: { transition: { staggerChildren: 0.15 } }
						}}
					>
						<motion.p
							variants={{
								hidden: { opacity: 0, y: 20 },
								visible: { opacity: 1, y: 0 }
							}}
							className="text-gold-400 text-xs tracking-widest uppercase font-medium mb-6"
						>
							Fine Jewelry — Est. 2024
						</motion.p>
						<motion.h1
							variants={{
								hidden: { opacity: 0, y: 30 },
								visible: { opacity: 1, y: 0 }
							}}
							className="font-serif text-5xl md:text-7xl font-light text-cream leading-[1.1] tracking-wide mb-6"
						>
							Crafted
							<br />
							<em className="text-gold-400">for Eternity</em>
						</motion.h1>
						<motion.p
							variants={{
								hidden: { opacity: 0, y: 20 },
								visible: { opacity: 1, y: 0 }
							}}
							className="text-stone-400 text-base font-light leading-relaxed max-w-md mb-10"
						>
							Each piece is hand-forged by master goldsmiths — a convergence of
							ancient craft and contemporary vision. Discover the Qayyam
							collection.
						</motion.p>
						<motion.div
							variants={{
								hidden: { opacity: 0, y: 20 },
								visible: { opacity: 1, y: 0 }
							}}
							className="flex flex-wrap gap-4"
						>
							<a
								href="#collection"
								className="btn-gold"
							>
								Explore Collection
							</a>
							<button
								onClick={() =>
									window.scrollTo({
										top: window.innerHeight * 0.92,
										behavior: 'smooth'
									})
								}
								className="btn-outline-gold"
							>
								View 3D Pieces
							</button>
						</motion.div>
					</motion.div>

					{/* 3D Viewer */}
					<motion.div
						initial={{ opacity: 0, scale: 0.92 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
						className="h-[480px] lg:h-[560px]"
					>
						<JewelryViewer
							variant="knot"
							className="rounded-none"
						/>
					</motion.div>
				</div>

				{/* Scroll hint */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 1.5 }}
					className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-stone-500"
				>
					<span className="text-[10px] tracking-widest uppercase">Scroll</span>
					<motion.div
						animate={{ y: [0, 6, 0] }}
						transition={{ repeat: Infinity, duration: 1.5 }}
						className="w-px h-8 bg-gold-600"
					/>
				</motion.div>
			</section>

			{/* Collection */}
			<section
				id="collection"
				className="max-w-7xl mx-auto px-6 py-20"
			>
				{/* Section header */}
				<div className="text-center mb-12">
					<p className="text-gold-500 text-xs tracking-widests uppercase font-medium mb-3">
						The Collection
					</p>
					<h2 className="section-heading">Fine Jewelry</h2>
					<span className="gold-bar" />
				</div>

				{/* Search */}
				<form
					onSubmit={handleSearch}
					className="flex gap-0 max-w-md mx-auto mb-10"
				>
					<input
						type="text"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Search pieces…"
						className="input-field flex-1"
					/>
					<button
						type="submit"
						className="btn-gold px-6 text-[11px]"
					>
						Search
					</button>
				</form>

				{/* Category Filter */}
				<div className="flex flex-wrap justify-center gap-2 mb-12">
					<button
						onClick={() => setSearchParams({})}
						className={`text-xs tracking-widest uppercase px-5 py-2.5 border transition-all duration-200 font-medium ${
							!activeCategory
								? 'bg-forest text-gold-400 border-forest'
								: 'border-stone-300 text-stone-600 hover:border-gold-500 hover:text-gold-600'
						}`}
					>
						All
					</button>
					{categories.map((cat) => (
						<button
							key={cat.slug}
							onClick={() => setSearchParams({ category: cat.slug })}
							className={`text-xs tracking-widest uppercase px-5 py-2.5 border transition-all duration-200 font-medium ${
								activeCategory === cat.slug
									? 'bg-forest text-gold-400 border-forest'
									: 'border-stone-300 text-stone-600 hover:border-gold-500 hover:text-gold-600'
							}`}
						>
							{cat.name}
						</button>
					))}
				</div>

				{/* Grid */}
				{loading ? (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{Array.from({ length: 8 }).map((_, i) => (
							<div
								key={i}
								className="bg-stone-100 animate-pulse aspect-[3/4]"
							/>
						))}
					</div>
				) : products.length === 0 ? (
					<div className="text-center py-20 text-stone-400">
						<p className="font-serif text-2xl font-light mb-3">
							No pieces found
						</p>
						<p className="text-sm">Try adjusting your search or filter.</p>
					</div>
				) : (
					<motion.div
						variants={stagger}
						initial="initial"
						animate="animate"
						className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
					>
						{products.map((product) => (
							<ProductCard
								key={product.id}
								product={product}
							/>
						))}
					</motion.div>
				)}
			</section>

			{/* Brand Statement */}
			<section className="bg-forest py-24 text-center px-6">
				<p className="text-gold-400 text-xs tracking-widests uppercase font-medium mb-4">
					Our Philosophy
				</p>
				<h2 className="font-serif text-4xl md:text-5xl font-light text-cream max-w-3xl mx-auto leading-relaxed">
					"Every piece carries the memory of fire, the patience of craft, and
					the permanence of gold."
				</h2>
				<span className="gold-bar mt-8" />
				<p className="text-stone-500 text-sm mt-6 tracking-widest uppercase">
					— The Qayyam Atelier
				</p>
			</section>
		</PageWrapper>
	);
}
