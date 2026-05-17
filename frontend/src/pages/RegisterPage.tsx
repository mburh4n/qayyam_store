import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageWrapper from '../components/PageWrapper';
import api from '../api/client';
import { useAuthStore } from '../store/authStore';

interface FormData {
	username: string;
	email: string;
	first_name: string;
	last_name: string;
	password: string;
	password_confirm: string;
}

export default function RegisterPage() {
	const navigate = useNavigate();
	const { setTokens, setUser } = useAuthStore();
	const [form, setForm] = useState<FormData>({
		username: '',
		email: '',
		first_name: '',
		last_name: '',
		password: '',
		password_confirm: ''
	});
	const [errors, setErrors] = useState<
		Partial<FormData> & { general?: string }
	>({});
	const [loading, setLoading] = useState(false);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
		setErrors((err) => ({
			...err,
			[e.target.name]: undefined,
			general: undefined
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (form.password !== form.password_confirm) {
			setErrors({ password_confirm: 'Passwords do not match.' });
			return;
		}
		setLoading(true);
		try {
			await api.post('/auth/register/', form);
			const { data: tokens } = await api.post('/token/', {
				username: form.username,
				password: form.password
			});
			setTokens(tokens.access, tokens.refresh);
			const { data: user } = await api.get('/auth/profile/', {
				headers: { Authorization: `Bearer ${tokens.access}` }
			});
			setUser(user);
			navigate('/');
		} catch (err: unknown) {
			const detail = (err as { response?: { data?: Record<string, string[]> } })
				?.response?.data;
			if (detail) {
				const mapped: Partial<FormData> = {};
				for (const [k, v] of Object.entries(detail)) {
					(mapped as Record<string, string>)[k] = Array.isArray(v)
						? v[0]
						: String(v);
				}
				setErrors(mapped);
			} else {
				setErrors({ general: 'Registration failed. Please try again.' });
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<PageWrapper>
			<div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-20 bg-cream">
				<motion.div
					initial={{ opacity: 0, y: 24 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="w-full max-w-md"
				>
					<p className="text-gold-500 text-xs tracking-widests uppercase font-medium mb-2">
						Join Qayyam
					</p>
					<h1 className="font-serif text-4xl font-light text-stone-800 mb-8">
						Create Account
					</h1>

					<form
						onSubmit={handleSubmit}
						className="space-y-4"
					>
						<div className="grid grid-cols-2 gap-4">
							{(['first_name', 'last_name'] as const).map((field) => (
								<div key={field}>
									<label className="block text-xs tracking-widests uppercase text-stone-500 font-medium mb-1.5">
										{field === 'first_name' ? 'First Name' : 'Last Name'}
									</label>
									<input
										type="text"
										name={field}
										value={form[field]}
										onChange={handleChange}
										className="input-field"
									/>
								</div>
							))}
						</div>

						{(
							[
								{ name: 'username', label: 'Username', type: 'text' },
								{ name: 'email', label: 'Email Address', type: 'email' },
								{ name: 'password', label: 'Password', type: 'password' },
								{
									name: 'password_confirm',
									label: 'Confirm Password',
									type: 'password'
								}
							] as const
						).map(({ name, label, type }) => (
							<div key={name}>
								<label className="block text-xs tracking-widests uppercase text-stone-500 font-medium mb-1.5">
									{label}
								</label>
								<input
									type={type}
									name={name}
									value={form[name]}
									onChange={handleChange}
									required
									className="input-field"
								/>
								{errors[name] && (
									<p className="text-xs text-red-500 mt-1">{errors[name]}</p>
								)}
							</div>
						))}

						{errors.general && (
							<motion.p
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								className="text-xs text-red-600 bg-red-50 border border-red-100 px-3 py-2"
							>
								{errors.general}
							</motion.p>
						)}

						<button
							type="submit"
							disabled={loading}
							className="w-full btn-gold mt-2"
						>
							{loading ? 'Creating account…' : 'Create Account'}
						</button>
					</form>

					<p className="text-sm text-stone-400 mt-6 text-center">
						Already have an account?{' '}
						<Link
							to="/login"
							className="text-gold-600 hover:text-gold-500 font-medium transition-colors"
						>
							Sign in
						</Link>
					</p>
				</motion.div>
			</div>
		</PageWrapper>
	);
}
