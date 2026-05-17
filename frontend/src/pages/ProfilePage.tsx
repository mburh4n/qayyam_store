import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import PageWrapper from '../components/PageWrapper';
import api from '../api/client';
import { useAuthStore } from '../store/authStore';
import type { Address } from '../types';

interface ProfileForm {
	first_name: string;
	last_name: string;
	email: string;
	phone: string;
	address: string;
}

interface AddressForm {
	label: string;
	full_name: string;
	phone: string;
	address_line_1: string;
	address_line_2: string;
	city: string;
	state: string;
	postal_code: string;
	country: string;
	is_default: boolean;
}

const initialAddressForm: AddressForm = {
	label: 'Home',
	full_name: '',
	phone: '',
	address_line_1: '',
	address_line_2: '',
	city: '',
	state: '',
	postal_code: '',
	country: 'Pakistan',
	is_default: false
};

export default function ProfilePage() {
	const { user, setUser } = useAuthStore();
	const [profile, setProfile] = useState<ProfileForm>({
		first_name: user?.first_name ?? '',
		last_name: user?.last_name ?? '',
		email: user?.email ?? '',
		phone: user?.phone ?? '',
		address: user?.address ?? ''
	});
	const [savingProfile, setSavingProfile] = useState(false);
	const [profileMessage, setProfileMessage] = useState('');

	const [addresses, setAddresses] = useState<Address[]>([]);
	const [addressForm, setAddressForm] = useState<AddressForm>(initialAddressForm);
	const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
	const [loadingAddresses, setLoadingAddresses] = useState(true);
	const [savingAddress, setSavingAddress] = useState(false);

	const fetchAddresses = async () => {
		setLoadingAddresses(true);
		try {
			const { data } = await api.get<Address[] | { results: Address[] }>('/addresses/');
			setAddresses(Array.isArray(data) ? data : data.results ?? []);
		} finally {
			setLoadingAddresses(false);
		}
	};

	useEffect(() => {
		fetchAddresses();
	}, []);

	const handleProfileSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSavingProfile(true);
		setProfileMessage('');
		try {
			const { data } = await api.patch('/auth/profile/', profile);
			setUser(data);
			setProfileMessage('Profile updated successfully.');
		} catch {
			setProfileMessage('Unable to update profile.');
		} finally {
			setSavingProfile(false);
		}
	};

	const resetAddressForm = () => {
		setAddressForm(initialAddressForm);
		setEditingAddressId(null);
	};

	const handleAddressSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSavingAddress(true);
		try {
			if (editingAddressId) {
				await api.patch(`/addresses/${editingAddressId}/`, addressForm);
			} else {
				await api.post('/addresses/', addressForm);
			}
			await fetchAddresses();
			resetAddressForm();
		} finally {
			setSavingAddress(false);
		}
	};

	const editAddress = (address: Address) => {
		setEditingAddressId(address.id);
		setAddressForm({
			label: address.label,
			full_name: address.full_name,
			phone: address.phone,
			address_line_1: address.address_line_1,
			address_line_2: address.address_line_2,
			city: address.city,
			state: address.state,
			postal_code: address.postal_code,
			country: address.country,
			is_default: address.is_default
		});
	};

	return (
		<PageWrapper>
			<div className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-1 lg:grid-cols-2 gap-10">
				<motion.section
					initial={{ opacity: 0, y: 18 }}
					animate={{ opacity: 1, y: 0 }}
					className="bg-white border border-stone-100 p-6"
				>
					<p className="text-gold-500 text-xs tracking-widest uppercase font-medium mb-2">
						Account
					</p>
					<h1 className="font-serif text-3xl font-light text-stone-800 mb-6">
						Profile Management
					</h1>
					<form
						onSubmit={handleProfileSubmit}
						className="space-y-4"
					>
						<div className="grid grid-cols-2 gap-3">
							<input
								value={profile.first_name}
								onChange={(e) =>
									setProfile((v) => ({ ...v, first_name: e.target.value }))
								}
								placeholder="First name"
								className="input-field"
							/>
							<input
								value={profile.last_name}
								onChange={(e) =>
									setProfile((v) => ({ ...v, last_name: e.target.value }))
								}
								placeholder="Last name"
								className="input-field"
							/>
						</div>
						<input
							type="email"
							value={profile.email}
							onChange={(e) => setProfile((v) => ({ ...v, email: e.target.value }))}
							placeholder="Email"
							className="input-field"
						/>
						<input
							value={profile.phone}
							onChange={(e) => setProfile((v) => ({ ...v, phone: e.target.value }))}
							placeholder="Phone"
							className="input-field"
						/>
						<textarea
							value={profile.address}
							onChange={(e) =>
								setProfile((v) => ({ ...v, address: e.target.value }))
							}
							placeholder="Default address notes"
							className="input-field min-h-24"
						/>
						{profileMessage && (
							<p className="text-xs text-stone-500 bg-stone-50 border border-stone-100 px-3 py-2">
								{profileMessage}
							</p>
						)}
						<button
							disabled={savingProfile}
							className="btn-gold w-full"
						>
							{savingProfile ? 'Saving…' : 'Save Profile'}
						</button>
					</form>
				</motion.section>

				<motion.section
					initial={{ opacity: 0, y: 18 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.08 }}
					className="bg-white border border-stone-100 p-6"
				>
					<h2 className="font-serif text-3xl font-light text-stone-800 mb-6">
						Shipment Addresses
					</h2>
					<form
						onSubmit={handleAddressSubmit}
						className="space-y-3 mb-7"
					>
						<input
							value={addressForm.label}
							onChange={(e) =>
								setAddressForm((v) => ({ ...v, label: e.target.value }))
							}
							placeholder="Label (Home / Office)"
							className="input-field"
							required
						/>
						<div className="grid grid-cols-2 gap-3">
							<input
								value={addressForm.full_name}
								onChange={(e) =>
									setAddressForm((v) => ({ ...v, full_name: e.target.value }))
								}
								placeholder="Full name"
								className="input-field"
								required
							/>
							<input
								value={addressForm.phone}
								onChange={(e) =>
									setAddressForm((v) => ({ ...v, phone: e.target.value }))
								}
								placeholder="Phone"
								className="input-field"
								required
							/>
						</div>
						<input
							value={addressForm.address_line_1}
							onChange={(e) =>
								setAddressForm((v) => ({
									...v,
									address_line_1: e.target.value
								}))
							}
							placeholder="Address line 1"
							className="input-field"
							required
						/>
						<input
							value={addressForm.address_line_2}
							onChange={(e) =>
								setAddressForm((v) => ({
									...v,
									address_line_2: e.target.value
								}))
							}
							placeholder="Address line 2 (optional)"
							className="input-field"
						/>
						<div className="grid grid-cols-2 gap-3">
							<input
								value={addressForm.city}
								onChange={(e) =>
									setAddressForm((v) => ({ ...v, city: e.target.value }))
								}
								placeholder="City"
								className="input-field"
								required
							/>
							<input
								value={addressForm.state}
								onChange={(e) =>
									setAddressForm((v) => ({ ...v, state: e.target.value }))
								}
								placeholder="State"
								className="input-field"
							/>
						</div>
						<div className="grid grid-cols-2 gap-3">
							<input
								value={addressForm.postal_code}
								onChange={(e) =>
									setAddressForm((v) => ({ ...v, postal_code: e.target.value }))
								}
								placeholder="Postal code"
								className="input-field"
								required
							/>
							<input
								value={addressForm.country}
								onChange={(e) =>
									setAddressForm((v) => ({ ...v, country: e.target.value }))
								}
								placeholder="Country"
								className="input-field"
								required
							/>
						</div>
						<label className="flex items-center gap-2 text-xs text-stone-600 uppercase tracking-widest">
							<input
								type="checkbox"
								checked={addressForm.is_default}
								onChange={(e) =>
									setAddressForm((v) => ({ ...v, is_default: e.target.checked }))
								}
							/>
							Set as default
						</label>
						<div className="flex gap-3">
							<button
								disabled={savingAddress}
								className="btn-gold flex-1"
							>
								{savingAddress
									? 'Saving…'
									: editingAddressId
										? 'Update Address'
										: 'Add Address'}
							</button>
							{editingAddressId && (
								<button
									type="button"
									onClick={resetAddressForm}
									className="btn-outline"
								>
									Cancel
								</button>
							)}
						</div>
					</form>

					{loadingAddresses ? (
						<div className="h-20 bg-stone-100 animate-pulse" />
					) : (
						<div className="space-y-3 max-h-72 overflow-y-auto pr-1">
							{addresses.map((address) => (
								<div
									key={address.id}
									className="border border-stone-100 p-4"
								>
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<p className="font-medium text-stone-700">{address.label}</p>
											{address.is_default && (
												<span className="badge bg-forest text-gold-400 text-[10px]">
													Default
												</span>
											)}
										</div>
										<div className="flex gap-3 text-xs uppercase tracking-widest">
											<button
												onClick={() => editAddress(address)}
												className="text-stone-500 hover:text-gold-600"
											>
												Edit
											</button>
											<button
												onClick={() => api.delete(`/addresses/${address.id}/`).then(fetchAddresses)}
												className="text-red-400 hover:text-red-600"
											>
												Delete
											</button>
										</div>
									</div>
									<p className="text-sm text-stone-500 mt-2 whitespace-pre-wrap">
										{address.formatted}
									</p>
								</div>
							))}
							{addresses.length === 0 && (
								<p className="text-sm text-stone-400">
									No addresses yet. Add one to speed up checkout.
								</p>
							)}
						</div>
					)}
				</motion.section>
			</div>
		</PageWrapper>
	);
}
