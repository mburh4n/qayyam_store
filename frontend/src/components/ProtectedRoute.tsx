import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
	children: ReactNode;
	adminOnly?: boolean;
}

export default function ProtectedRoute({
	children,
	adminOnly = false
}: ProtectedRouteProps) {
	const { accessToken, user } = useAuthStore();
	const location = useLocation();

	if (!accessToken) {
		return (
			<Navigate
				to="/login"
				state={{ from: location }}
				replace
			/>
		);
	}
	if (adminOnly && user?.role !== 'admin') {
		return (
			<Navigate
				to="/"
				replace
			/>
		);
	}
	return <>{children}</>;
}
