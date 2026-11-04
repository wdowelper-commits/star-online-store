import React, { useState } from 'react';
import { User, MapPin, Plus, Trash2, CheckCircle2, Shield } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { db } from '../../lib/storage';
import { Address } from '../../types';

export const AccountPage: React.FC = () => {
  const { user, setUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses'>('profile');

  // Profile Form State
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileSaved, setProfileSaved] = useState(false);

  // Address State
  const [addresses, setAddresses] = useState<Address[]>(() =>
    user ? db.getCustomerAddresses(user.id) : []
  );
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddrName, setNewAddrName] = useState('');
  const [newAddrPhone, setNewAddrPhone] = useState('');
  const [newAddrLine1, setNewAddrLine1] = useState('');
  const [newAddrCity, setNewAddrCity] = useState('');
  const [newAddrPostal, setNewAddrPostal] = useState('');

  if (!user) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = db.updateProfile(user.id, {
      full_name: fullName.trim(),
      phone: phone.trim(),
    });
    setUser(updated);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    const created = db.createAddress({
      id: `addr_${Date.now()}`,
      customer_id: user.id,
      full_name: newAddrName.trim(),
      phone: newAddrPhone.trim(),
      address_line1: newAddrLine1.trim(),
      city: newAddrCity.trim(),
      state: 'Punjab',
      postal_code: newAddrPostal.trim(),
      is_default: addresses.length === 0,
      created_at: new Date().toISOString(),
    });
    setAddresses(db.getCustomerAddresses(user.id));
    setIsAddingAddress(false);
    setNewAddrName('');
    setNewAddrPhone('');
    setNewAddrLine1('');
    setNewAddrCity('');
    setNewAddrPostal('');
  };

  const handleDeleteAddress = (id: string) => {
    db.deleteAddress(id);
    setAddresses(db.getCustomerAddresses(user.id));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-display">
          My Account
        </h1>
        <p className="text-xs text-slate-500 mt-1">Manage profile information and delivery addresses</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'profile'
              ? 'bg-[#EDE9FF] text-[#6C47FF] dark:bg-[#6C47FF]/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile Info</span>
        </button>

        <button
          onClick={() => setActiveTab('addresses')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'addresses'
              ? 'bg-[#EDE9FF] text-[#6C47FF] dark:bg-[#6C47FF]/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Address Book ({addresses.length})</span>
        </button>
      </div>

      {/* Tab: Profile */}
      {activeTab === 'profile' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 sm:p-8 max-w-xl shadow-xs">
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#6C47FF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address (Read-only)
              </label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+92 300 0000000"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#6C47FF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Account Role & Status
              </label>
              <div className="flex items-center gap-2 text-xs">
                <span className="capitalize font-bold text-[#6C47FF] bg-purple-50 dark:bg-purple-950/40 px-2 py-1 rounded">
                  {user.role}
                </span>
                <span className="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded capitalize font-medium">
                  {user.status}
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="py-2.5 px-6 bg-[#6C47FF] hover:bg-[#5535E8] text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              {profileSaved ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Saved Successfully</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Tab: Addresses */}
      {activeTab === 'addresses' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Saved Shipping Addresses
            </h3>
            <button
              onClick={() => setIsAddingAddress(!isAddingAddress)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#6C47FF] text-white rounded-xl text-xs font-semibold hover:bg-[#5535E8] transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Address</span>
            </button>
          </div>

          {/* New Address Form Modal/Collapse */}
          {isAddingAddress && (
            <form onSubmit={handleAddAddress} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">New Address</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Recipient Name"
                  value={newAddrName}
                  onChange={(e) => setNewAddrName(e.target.value)}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
                <input
                  type="tel"
                  required
                  placeholder="Phone"
                  value={newAddrPhone}
                  onChange={(e) => setNewAddrPhone(e.target.value)}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>
              <input
                type="text"
                required
                placeholder="Street Address, House / Building"
                value={newAddrLine1}
                onChange={(e) => setNewAddrLine1(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="City"
                  value={newAddrCity}
                  onChange={(e) => setNewAddrCity(e.target.value)}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
                <input
                  type="text"
                  required
                  placeholder="Postal Code"
                  value={newAddrPostal}
                  onChange={(e) => setNewAddrPostal(e.target.value)}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingAddress(false)}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#6C47FF] text-white rounded-xl text-xs font-semibold"
                >
                  Save Address
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 relative shadow-xs"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {addr.full_name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">{addr.phone}</p>
                  </div>
                  {addr.is_default && (
                    <span className="text-[10px] bg-[#EDE9FF] text-[#6C47FF] dark:bg-[#6C47FF]/20 font-bold px-2 py-0.5 rounded-full">
                      Default
                    </span>
                  )}
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">
                  <p>{addr.address_line1}</p>
                  {addr.address_line2 && <p>{addr.address_line2}</p>}
                  <p>{addr.city}, {addr.state} {addr.postal_code}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <button
                    onClick={() => handleDeleteAddress(addr.id)}
                    className="text-xs text-slate-400 hover:text-red-600 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
