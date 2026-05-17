import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageWrapper from '../components/PageWrapper';
import api from '../api/client';
import { useAuthStore } from '../store/authStore';

export default function LoginPage() {
	const navigate = useNavigate();
	const location = useLocation();
	const { setTokens, setUser } = useAuthStore();
	const from =
		(location.state as { from?: { pathname: string } })?.from?.pathname ?? '/';

	const [form, setForm] = useState({ username: '', password: '' });
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
		setError('');
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError('');
		try {
			const { data: tokens } = await api.post('/token/', form);
			setTokens(tokens.access, tokens.refresh);
			const { data: user } = await api.get('/auth/profile/', {
				headers: { Authorization: `Bearer ${tokens.access}` }
			});
			setUser(user);
			navigate(from, { replace: true });
		} catch (err: unknown) {
			setError('Invalid username or password. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<PageWrapper>
			<div className="min-h-[calc(100vh-4rem)] flex">
				{/* Left panel */}
				<div className="hidden lg:flex w-1/2 bg-forest flex-col justify-center items-center px-16">
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
						className="text-center"
					>
						<span className="font-serif text-5xl font-light tracking-[0.2em] text-cream">
							QAYYAM
						</span>
						<span className="block w-full h-px bg-gold-500 mt-2 mb-8" />
						<p className="font-serif text-2xl font-light text-stone-400 italic leading-relaxed max-w-sm">
							"Where gold meets intention, and craft becomes legacy."
						</p>
					</motion.div>
				</div>

				{/* Form */}
				<div className="flex-1 flex items-center justify-center px-6 py-20 bg-cream">
					<motion.div
						initial={{ opacity: 0, y: 24 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
						className="w-full max-w-sm"
					>
						<p className="text-gold-500 text-xs tracking-widests uppercase font-medium mb-2">
							Welcome back
						</p>
						<h1 className="font-serif text-4xl font-light text-stone-800 mb-8">
							Sign In
						</h1>

						<form
							onSubmit={handleSubmit}
							className="space-y-4"
						>
							<div>
								<label className="block text-xs tracking-widests uppercase text-stone-500 font-medium mb-1.5">
									Username
								</label>
								<input
									type="text"
									name="username"
									value={form.username}
									onChange={handleChange}
									placeholder="your_username"
									required
									className="input-field"
								/>
							</div>
							<div>
								<label className="block text-xs tracking-widests uppercase text-stone-500 font-medium mb-1.5">
									Password
								</label>
								<input
									type="password"
									name="password"
									value={form.password}
									onChange={handleChange}
									placeholder="••••••••"
									required
									className="input-field"
								/>
							</div>

							{error && (
								<motion.p
									initial={{ opacity: 0, y: -6 }}
									animate={{ opacity: 1, y: 0 }}
									className="text-xs text-red-600 bg-red-50 border border-red-100 px-3 py-2"
								>
									{error}
								</motion.p>
							)}

							<button
								type="submit"
								disabled={loading}
								className="w-full btn-gold mt-2"
							>
								{loading ? 'Signing in…' : 'Sign In'}
							</button>
						</form>

						<p className="text-sm text-stone-400 mt-6 text-center">
							No account?{' '}
							<Link
								to="/register"
								className="text-gold-600 hover:text-gold-500 font-medium transition-colors"
							>
								Create one
							</Link>
						</p>

						{/* Demo credentials */}
						<div className="mt-8 p-4 bg-stone-50 border border-stone-100 text-xs text-stone-400 space-y-1">
							<p className="font-medium text-stone-500 uppercase tracking-widest text-[10px] mb-2">
								Demo Credentials
							</p>
							<p>
								Customer:{' '}
								<span className="text-stone-600 font-mono">
									customer / cust1234
								</span>
							</p>
							<p>
								Admin:{' '}
								<span className="text-stone-600 font-mono">
									admin / admin1234
								</span>
							</p>
						</div>
					</motion.div>
				</div>
			</div>
		</PageWrapper>
	);
}
