'use client'

import api, { addressApi } from '@/lib/api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import type { Address } from '@/lib/types'

function AddressCard({
  address,
  onEdit,
  onDelete,
}: {
  address: Address
  onEdit: (a: Address) => void
  onDelete: (id: number) => void
}) {
  return (
    <div className="rounded-xl border border-gray-200 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          {address.label && (
            <span className="mb-1 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
              {address.label}
            </span>
          )}
          {address.is_default && (
            <span className="ml-1 mb-1 inline-block rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
              Default
            </span>
          )}
          <p className="text-sm font-medium text-gray-900">{address.full_name}</p>
          <p className="text-sm text-gray-500">{address.line1}{address.line2 ? `, ${address.line2}` : ''}</p>
          <p className="text-sm text-gray-500">{address.city}, {address.state} {address.postal_code}</p>
          <p className="text-sm text-gray-500">{address.country}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onEdit(address)} className="text-xs text-indigo-600 hover:underline">Edit</button>
          <button onClick={() => onDelete(address.id)} className="text-xs text-red-500 hover:underline">Delete</button>
        </div>
      </div>
    </div>
  )
}

type AddressFormData = {
  label: string
  full_name: string
  phone: string
  line1: string
  line2: string
  city: string
  state: string
  postal_code: string
  country: string
  is_default: boolean
}

const emptyForm: AddressFormData = {
  label: '', full_name: '', phone: '', line1: '', line2: '',
  city: '', state: '', postal_code: '', country: 'US', is_default: false,
}

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession()
  const qc = useQueryClient()
  const user = session?.user

  // Profile form
  const [profileForm, setProfileForm] = useState({ name: user?.name ?? '' })
  const [passwordForm, setPasswordForm] = useState({ current: '', password: '', password_confirmation: '' })
  const [profileMsg, setProfileMsg] = useState('')
  const [passwordMsg, setPasswordMsg] = useState('')

  const updateProfile = useMutation({
    mutationFn: (data: { name: string }) => api.put('/auth/profile', data),
    onSuccess: async () => {
      await updateSession()
      setProfileMsg('Profile updated.')
      setTimeout(() => setProfileMsg(''), 3000)
    },
  })

  const changePassword = useMutation({
    mutationFn: (data: typeof passwordForm) => api.put('/auth/password', data),
    onSuccess: () => {
      setPasswordForm({ current: '', password: '', password_confirmation: '' })
      setPasswordMsg('Password changed.')
      setTimeout(() => setPasswordMsg(''), 3000)
    },
    onError: () => setPasswordMsg('Failed. Check your current password.'),
  })

  // Addresses
  const { data: addresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => addressApi.list().then((r) => r.data.data as Address[]),
  })

  const [showAddressForm, setShowAddressForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [addrForm, setAddrForm] = useState<AddressFormData>(emptyForm)

  const saveAddress = useMutation({
    mutationFn: () =>
      editingAddress
        ? addressApi.update(editingAddress.id, addrForm)
        : addressApi.create(addrForm),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['addresses'] })
      setShowAddressForm(false)
      setEditingAddress(null)
      setAddrForm(emptyForm)
    },
  })

  const deleteAddress = useMutation({
    mutationFn: (id: number) => addressApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['addresses'] }),
  })

  const openEdit = (addr: Address) => {
    setEditingAddress(addr)
    setAddrForm({
      label: addr.label ?? '',
      full_name: addr.full_name,
      phone: addr.phone ?? '',
      line1: addr.line1,
      line2: addr.line2 ?? '',
      city: addr.city,
      state: addr.state,
      postal_code: addr.postal_code,
      country: addr.country,
      is_default: addr.is_default,
    })
    setShowAddressForm(true)
  }

  const addrFields: Array<{ key: keyof AddressFormData; label: string; col?: number }> = [
    { key: 'full_name', label: 'Full Name', col: 2 },
    { key: 'label', label: 'Label (optional)', col: 2 },
    { key: 'phone', label: 'Phone (optional)', col: 2 },
    { key: 'line1', label: 'Street Address', col: 2 },
    { key: 'line2', label: 'Apt, suite, etc.', col: 2 },
    { key: 'city', label: 'City' },
    { key: 'state', label: 'State' },
    { key: 'postal_code', label: 'ZIP Code' },
    { key: 'country', label: 'Country' },
  ]

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">Profile</h1>

      <div className="space-y-8">
        {/* Profile */}
        <section className="rounded-2xl border border-gray-100 bg-white p-6">
          <h2 className="mb-4 font-semibold text-gray-900">Personal Information</h2>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Name</label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ name: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Email</label>
              <input
                type="email"
                value={user?.email ?? ''}
                disabled
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-400"
              />
            </div>
          </div>
          {profileMsg && <p className="mt-2 text-sm text-green-600">{profileMsg}</p>}
          <button
            onClick={() => updateProfile.mutate(profileForm)}
            disabled={updateProfile.isPending}
            className="mt-4 rounded-lg bg-gray-900 px-5 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-40"
          >
            {updateProfile.isPending ? 'Saving…' : 'Save changes'}
          </button>
        </section>

        {/* Password */}
        <section className="rounded-2xl border border-gray-100 bg-white p-6">
          <h2 className="mb-4 font-semibold text-gray-900">Change Password</h2>
          <div className="space-y-3">
            {[
              { key: 'current', label: 'Current Password' },
              { key: 'password', label: 'New Password' },
              { key: 'password_confirmation', label: 'Confirm New Password' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="mb-1 block text-xs font-medium text-gray-500">{label}</label>
                <input
                  type="password"
                  value={passwordForm[key as keyof typeof passwordForm]}
                  onChange={(e) => setPasswordForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            ))}
          </div>
          {passwordMsg && (
            <p className={`mt-2 text-sm ${passwordMsg.includes('Failed') ? 'text-red-600' : 'text-green-600'}`}>
              {passwordMsg}
            </p>
          )}
          <button
            onClick={() => changePassword.mutate(passwordForm)}
            disabled={changePassword.isPending}
            className="mt-4 rounded-lg bg-gray-900 px-5 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-40"
          >
            {changePassword.isPending ? 'Saving…' : 'Change password'}
          </button>
        </section>

        {/* Addresses */}
        <section className="rounded-2xl border border-gray-100 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Saved Addresses</h2>
            <button
              onClick={() => { setEditingAddress(null); setAddrForm(emptyForm); setShowAddressForm(true) }}
              className="text-sm text-indigo-600 hover:underline"
            >
              + Add address
            </button>
          </div>

          {(!addresses || addresses.length === 0) && !showAddressForm && (
            <p className="text-sm text-gray-400">No saved addresses yet.</p>
          )}

          <div className="space-y-3">
            {addresses?.map((addr) => (
              <AddressCard
                key={addr.id}
                address={addr}
                onEdit={openEdit}
                onDelete={(id) => deleteAddress.mutate(id)}
              />
            ))}
          </div>

          {showAddressForm && (
            <div className="mt-4 rounded-xl border border-gray-200 p-5">
              <h3 className="mb-3 font-medium text-gray-900">
                {editingAddress ? 'Edit Address' : 'New Address'}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {addrFields.map(({ key, label, col }) => (
                  <div key={key} className={col === 2 ? 'col-span-2' : ''}>
                    <label className="mb-1 block text-xs font-medium text-gray-500">{label}</label>
                    <input
                      type="text"
                      value={addrForm[key] as string}
                      onChange={(e) => setAddrForm((f) => ({ ...f, [key]: e.target.value }))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                ))}
                <div className="col-span-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_default"
                    checked={addrForm.is_default}
                    onChange={(e) => setAddrForm((f) => ({ ...f, is_default: e.target.checked }))}
                  />
                  <label htmlFor="is_default" className="text-sm text-gray-600">Set as default address</label>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => saveAddress.mutate()}
                  disabled={saveAddress.isPending}
                  className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-40"
                >
                  {saveAddress.isPending ? 'Saving…' : 'Save'}
                </button>
                <button
                  onClick={() => { setShowAddressForm(false); setEditingAddress(null); setAddrForm(emptyForm) }}
                  className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
