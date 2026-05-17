import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';

export default function Navbar() {
	const navigate = useNavigate();
	const { user, accessToken, logout } = useAuthStore();
	const { items, setIsOpen } = useCartStore();
	const [menuOpen, setMenuOpen] = useState(false);

	const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

	const handleLogout = () => {
		logout();
		navigate('/');
	};

	const navLinks = [
		{ label: 'Rings', path: '/?category=rings' },
		{ label: 'Earrings', path: '/?category=earrings' },
		{ label: 'Bracelets', path: '/?category=bracelets' },
		{ label: 'Necklaces', path: '/?category=necklaces' }
	];

	return (
		<header className="sticky top-0 z-40 bg-cream/95 backdrop-blur-sm border-b border-stone-200">
			<div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
				{/* Logo */}
				<Link
					to="/"
					className="flex-shrink-0"
				>
					<span className="font-serif text-2xl font-light tracking-[0.18em] text-stone-900">
						QAYYAM
					</span>
					<span className="block w-full h-px bg-gold-500 mt-0.5" />
				</Link>

				{/* Desktop Nav */}
				<nav className="hidden md:flex items-center gap-8">
					{navLinks.map((l) => (
						<Link
							key={l.label}
							to={l.path}
							className="text-xs tracking-widest uppercase text-stone-600 hover:text-gold-600 transition-colors duration-200 font-medium"
						>
							{l.label}
						</Link>
					))}
				</nav>

				{/* Actions */}
				<div className="flex items-center gap-4">
					{accessToken ? (
						<div className="hidden md:flex items-center gap-4">
							<Link
								to="/orders"
								className="text-xs tracking-widest uppercase text-stone-600 hover:text-gold-600 transition-colors duration-200 font-medium"
							>
								Orders
							</Link>
							<Link
								to="/profile"
								className="text-xs tracking-widest uppercase text-stone-600 hover:text-gold-600 transition-colors duration-200 font-medium"
							>
								Profile
							</Link>
							{user?.role === 'admin' && (
								<Link
									to="/admin"
									className="text-xs tracking-widest uppercase text-stone-600 hover:text-gold-600 transition-colors duration-200 font-medium"
								>
									Admin
								</Link>
							)}
							<span className="text-stone-300">|</span>
							<span className="text-xs text-stone-500">
								{user?.first_name || user?.username}
							</span>
							<button
								onClick={handleLogout}
								className="text-xs tracking-widest uppercase text-stone-500 hover:text-red-600 transition-colors duration-200 font-medium"
							>
								Sign Out
							</button>
						</div>
					) : (
						<Link
							to="/login"
							className="hidden md:block text-xs tracking-widest uppercase text-stone-600 hover:text-gold-600 transition-colors duration-200 font-medium"
						>
							Sign In
						</Link>
					)}

					{/* Cart */}
					<button
						onClick={() => setIsOpen(true)}
						className="relative p-2 text-stone-700 hover:text-gold-600 transition-colors"
						aria-label="Open cart"
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
								d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"
							/>
						</svg>
						<AnimatePresence>
							{itemCount > 0 && (
								<motion.span
									key="badge"
									initial={{ scale: 0 }}
									animate={{ scale: 1 }}
									exit={{ scale: 0 }}
									className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-gold-500 text-stone-900 text-[10px] font-bold flex items-center justify-center"
								>
									{itemCount}
								</motion.span>
							)}
						</AnimatePresence>
					</button>

					{/* Mobile Hamburger */}
					<button
						className="md:hidden p-2 text-stone-700"
						onClick={() => setMenuOpen((v) => !v)}
						aria-label="Toggle menu"
					>
						<svg
							className="w-5 h-5"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth={1.5}
						>
							{menuOpen ? (
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M6 18L18 6M6 6l12 12"
								/>
							) : (
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"
								/>
							)}
						</svg>
					</button>
				</div>
			</div>

			{/* Mobile Menu */}
			<AnimatePresence>
				{menuOpen && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: 'auto', opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.25 }}
						className="md:hidden overflow-hidden border-t border-stone-200 bg-cream"
					>
						<div className="px-6 py-4 flex flex-col gap-4">
							{navLinks.map((l) => (
								<Link
									key={l.label}
									to={l.path}
									onClick={() => setMenuOpen(false)}
									className="text-xs tracking-widest uppercase text-stone-700 font-medium"
								>
									{l.label}
								</Link>
							))}
							<hr className="border-stone-200" />
							{accessToken ? (
								<>
									<Link
										to="/orders"
										onClick={() => setMenuOpen(false)}
										className="text-xs tracking-widest uppercase text-stone-700 font-medium"
									>
										Orders
									</Link>
									<Link
										to="/profile"
										onClick={() => setMenuOpen(false)}
										className="text-xs tracking-widest uppercase text-stone-700 font-medium"
									>
										Profile
									</Link>
									{user?.role === 'admin' && (
										<Link
											to="/admin"
											onClick={() => setMenuOpen(false)}
											className="text-xs tracking-widest uppercase text-stone-700 font-medium"
										>
											Admin
										</Link>
									)}
									<button
										onClick={() => {
											handleLogout();
											setMenuOpen(false);
										}}
										className="text-left text-xs tracking-widest uppercase text-red-600 font-medium"
									>
										Sign Out
									</button>
								</>
							) : (
								<Link
									to="/login"
									onClick={() => setMenuOpen(false)}
									className="text-xs tracking-widest uppercase text-stone-700 font-medium"
								>
									Sign In
								</Link>
							)}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</header>
	);
}
