'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import { toast } from 'sonner'
import { authApi } from '@/lib/api'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const email = searchParams.get('email') ?? ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) {
      toast.error('Passwords do not match.')
      return
    }
    setLoading(true)
    try {
      await authApi.resetPassword({ token, email, password, password_confirmation: confirm })
      toast.success('Password reset! You can now sign in.')
      router.push('/auth/login')
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Invalid or expired reset link.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  if (!token || !email) {
    return (
      <div className="text-center">
        <p className="text-sm text-red-600">Invalid reset link. Please request a new one.</p>
        <Link href="/auth/forgot-password" className="mt-4 block text-sm font-medium text-indigo-600 hover:underline">
          Request reset link
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
          New password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          placeholder="At least 8 characters"
        />
      </div>

      <div>
        <label htmlFor="confirm" className="mb-1 block text-sm font-medium text-gray-700">
          Confirm password
        </label>
        <input
          id="confirm"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          placeholder="Repeat your new password"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-gray-900 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
      >
        {loading ? 'Resetting…' : 'Reset password'}
      </button>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-2xl font-bold text-gray-900">Reset your password</h1>
        <p className="mb-6 text-sm text-gray-500">Enter and confirm your new password below.</p>
        <Suspense fallback={<div className="h-40 animate-pulse rounded-xl bg-gray-100" />}>
          <ResetPasswordForm />
        </Suspense>
        <p className="mt-6 text-center text-sm text-gray-500">
          <Link href="/auth/login" className="font-medium text-indigo-600 hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
