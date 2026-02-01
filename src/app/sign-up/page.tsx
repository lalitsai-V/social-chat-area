"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authService } from "@/lib/auth/service";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const validateForm = () => {
    if (!email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!password.trim()) {
      setError("Password is required");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }
    return true;
  };

  async function handleSignUp(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    const { error } = await authService.signUp(email, password);

    if (error) {
      setError(error.message || "Failed to sign up");
      setLoading(false);
      return;
    }

    // Sign in after successful signup
    const { error: signInError } = await authService.signIn(email, password);

    if (signInError) {
      setError(signInError.message || "Failed to sign in after signup");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8">
          {/* Logo and Title */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">💬</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">ChatBox</h1>
              <p className="text-xs text-gray-400">Create your account</p>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-red-600 bg-opacity-20 border border-red-600 text-red-200 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="block text-gray-300 font-medium mb-2 text-sm">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all placeholder-gray-500"
                placeholder="you@example.com"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-gray-300 font-medium mb-2 text-sm">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all placeholder-gray-500"
                placeholder="At least 6 characters"
                disabled={loading}
              />
              <p className="text-xs text-gray-400 mt-1">
                Must be at least 6 characters long
              </p>
            </div>

            <div>
              <label className="block text-gray-300 font-medium mb-2 text-sm">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all placeholder-gray-500"
                placeholder="••••••"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 text-white font-semibold py-3 rounded-lg hover:bg-red-700 disabled:bg-gray-700 disabled:text-gray-500 transition-colors mt-6"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-900 text-gray-400">Already have an account?</span>
            </div>
          </div>

          {/* Sign In Link */}
          <Link
            href="/sign-in"
            className="w-full block text-center px-4 py-3 border border-gray-700 text-gray-300 font-semibold rounded-lg hover:bg-gray-800 hover:border-red-600 hover:text-red-400 transition-all"
          >
            Sign In
          </Link>

          {/* Footer */}
          <p className="text-center text-xs text-gray-500 mt-6">
            By creating an account, you agree to our Terms of Service
          </p>

          {/* Back to Home */}
          <Link
            href="/"
            className="block text-center text-xs text-gray-400 hover:text-gray-300 mt-4 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
