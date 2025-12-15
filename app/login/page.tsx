'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

export default function LoginPage() {
    const router = useRouter()
    const supabase = createClient()

    const [isSignup, setIsSignup] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    async function handleAuth(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            if (isSignup) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: { full_name: fullName }
                    }
                })
                if (error) throw error
                // On successful signup, maybe redirect to find or show confirmation
                alert('Signup successful! Check your email to confirm.')
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password
                })
                if (error) throw error
                // On successful login, redirect to Find page
                router.push('/find')
            }
        } catch (err: any) {
            setError(err.message || 'Authentication failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-[#e0f7fa] to-[#b2ebf2] flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <Link href="/">
                        <h1 className="text-5xl font-bold text-[#0a4f5c] mb-2 hover:opacity-80 transition-opacity">
                            PIXEE
                        </h1>
                    </Link>
                    <p className="text-[#158fa8] text-lg">
                        {isSignup ? 'Create your account' : 'Welcome back'}
                    </p>
                </div>

                <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-[#80deea]">
                    <form onSubmit={handleAuth} className="space-y-6">
                        {isSignup && (
                            <div>
                                <label className="block text-[#0a4f5c] text-sm font-bold mb-2">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-[#80deea] text-[#0a4f5c] focus:outline-none focus:ring-2 focus:ring-[#158fa8] transition-all"
                                    placeholder="John Doe"
                                    required={isSignup}
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-[#0a4f5c] text-sm font-bold mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-[#80deea] text-[#0a4f5c] focus:outline-none focus:ring-2 focus:ring-[#158fa8] transition-all"
                                placeholder="name@example.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-[#0a4f5c] text-sm font-bold mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-[#80deea] text-[#0a4f5c] focus:outline-none focus:ring-2 focus:ring-[#158fa8] transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-600 rounded-lg p-3 text-sm text-center">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-[#158fa8] hover:bg-[#0e6b7d] text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Please wait...' : (isSignup ? 'Create Account' : 'Sign In')}
                        </button>

                        <div className="text-center pt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsSignup(!isSignup)
                                    setError('')
                                }}
                                className="text-[#158fa8] font-semibold hover:text-[#0a4f5c] transition-colors"
                            >
                                {isSignup
                                    ? 'Already have an account? Sign In'
                                    : "Don't have an account? Create one"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
