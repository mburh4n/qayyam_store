import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';

import { useAuthStore } from './store/authStore';
import api from './api/client';

export default function App() {
	const location = useLocation();
	const { accessToken, setUser, logout } = useAuthStore();

	useEffect(() => {
		if (accessToken) {
			api
				.get('/auth/profile/')
				.then((res) => setUser(res.data))
				.catch(() => logout());
		}
	}, [accessToken, setUser, logout]);

	return (
		<div className="min-h-screen bg-cream">
			<Navbar />
			<CartDrawer />
			<AnimatePresence mode="wait">
				<Routes
					location={location}
					key={location.pathname}
				>
					<Route
						path="/"
						element={<HomePage />}
					/>
					<Route
						path="/product/:slug"
						element={<ProductDetailPage />}
					/>
					<Route
						path="/login"
						element={<LoginPage />}
					/>
					<Route
						path="/register"
						element={<RegisterPage />}
					/>
					<Route
						path="/checkout"
						element={
							<ProtectedRoute>
								<CheckoutPage />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/orders"
						element={
							<ProtectedRoute>
								<OrdersPage />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/profile"
						element={
							<ProtectedRoute>
								<ProfilePage />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/admin"
						element={
							<ProtectedRoute adminOnly>
								<AdminPage />
							</ProtectedRoute>
						}
					/>
				</Routes>
			</AnimatePresence>
		</div>
	);
}
