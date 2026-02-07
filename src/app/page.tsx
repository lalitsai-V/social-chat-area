import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ChatBox - Real-time Chat Made Simple",
  description: "A fast, secure, and modern real-time chat application. Connect instantly with friends and colleagues.",
};

export default function Home() {
  return (
    <div className="min-h-screen relative">
      {/* Video Background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/chvid.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/30"></div>

      {/* Content Wrapper */}
      <div className="relative z-10 text-slate-900 overflow-hidden min-h-screen">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">💬</span>
            </div>
            <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
              ChatBox
            </span>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <Link
              href="/sign-in"
              className="hidden md:block text-slate-600 hover:text-blue-600 transition-colors font-medium"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="px-4 md:px-6 py-2 md:py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all font-semibold text-xs md:text-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-24">
        <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
          {/* Left Content - Slide In From Left */}
          <div className="space-y-6 md:space-y-8 animate-slideInLeft">
            <div className="space-y-3 md:space-y-4">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
                Real-time Chat,{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Made Simple
                </span>
              </h1>
              <p className="text-base md:text-lg lg:text-xl text-slate-600 leading-relaxed">
                A fast, secure, and modern real-time chat application. Connect instantly with friends, colleagues, and communities.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-2 md:pt-4">
              <Link
                href="/sign-up"
                className="px-6 md:px-8 py-2.5 md:py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all font-semibold flex items-center justify-center gap-2 text-sm md:text-base"
              >
                Start Chat Now
                <span>→</span>
              </Link>
              <Link
                href="/sign-in"
                className="px-6 md:px-8 py-2.5 md:py-3.5 border-2 border-slate-300 text-slate-900 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-all font-semibold text-sm md:text-base text-center"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Right Visual - Slide In From Right */}
          <div className="relative hidden md:block animate-slideInRight">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl opacity-10 blur-3xl"></div>
            <div className="relative bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-8 md:p-12 text-center text-white shadow-2xl">
              <div className="text-6xl md:text-7xl mb-4 md:mb-6">💬</div>
              <p className="text-lg md:text-2xl font-bold mb-2">Join Our Community</p>
              <p className="text-blue-100 text-sm md:text-lg">
                Thousands of users are already chatting
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12 md:mb-16 space-y-2 md:space-y-4 scroll-slide-down">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">Why Choose ChatBox?</h2>
            <p className="text-base md:text-lg lg:text-xl text-white/80">Powerful features designed for seamless communication</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {/* Feature 1 - Slide from Left */}
            <div className="group relative p-6 md:p-8 rounded-2xl border border-white/30 bg-white/10 backdrop-blur-sm hover:border-blue-300 hover:shadow-lg hover:bg-blue-600 hover:text-white transition-all scroll-slide-left" style={{ animationDelay: "0.1s" }}>
              <div className="text-4xl md:text-5xl mb-3 md:mb-4">⚡</div>
              <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-white">Lightning Fast</h3>
              <p className="text-sm md:text-base text-white/80">Real-time messaging with sub-second latency.</p>
            </div>

            <div className="group relative p-6 md:p-8 rounded-2xl border border-white/30 bg-white/10 backdrop-blur-sm hover:border-blue-300 hover:shadow-lg hover:bg-blue-600 hover:text-white transition-all scroll-slide-right" style={{ animationDelay: "0.2s" }}>
              <div className="text-4xl md:text-5xl mb-3 md:mb-4">🔒</div>
              <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-white">Secure & Private</h3>
              <p className="text-sm md:text-base text-white/80">End-to-end encryption and secure authentication.</p>
            </div>

            <div className="group relative p-6 md:p-8 rounded-2xl border border-white/30 bg-white/10 backdrop-blur-sm hover:border-blue-300 hover:shadow-lg hover:bg-blue-600 hover:text-white transition-all scroll-slide-left" style={{ animationDelay: "0.3s" }}>
              <div className="text-4xl md:text-5xl mb-3 md:mb-4">📱</div>
              <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-white">Fully Responsive</h3>
              <p className="text-sm md:text-base text-white/80">Works on desktop, tablet, and mobile devices.</p>
            </div>

            <div className="group relative p-6 md:p-8 rounded-2xl border border-white/30 bg-white/10 backdrop-blur-sm hover:border-blue-300 hover:shadow-lg hover:bg-blue-600 hover:text-white transition-all scroll-slide-right" style={{ animationDelay: "0.4s" }}>
              <div className="text-4xl md:text-5xl mb-3 md:mb-4">✨</div>
              <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-white">Modern & Clean</h3>
              <p className="text-sm md:text-base text-white/80">Beautiful, intuitive interface with smooth animations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Grid */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-24">
        <div className="text-center mb-12 md:mb-16 space-y-2 md:space-y-4 scroll-slide-down">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">Powerful Features</h2>
          <p className="text-base md:text-lg text-slate-600">Everything you need for great conversations</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 md:gap-8">
          {/* Feature: Real-time Messaging - Slide from Left */}
          <div className="p-6 md:p-8 rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-blue-50 hover:shadow-lg transition-all scroll-slide-left" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-start gap-3 md:gap-4">
              <div className="text-4xl md:text-5xl flex-shrink-0">📨</div>
              <div>
                <h3 className="text-lg md:text-xl font-bold mb-1 md:mb-2 text-slate-900">Real-time Messaging</h3>
                <p className="text-sm md:text-base text-slate-600">Messages are delivered instantly using Supabase Realtime.</p>
              </div>
            </div>
          </div>

          {/* Feature: User Profiles - Slide from Right */}
          <div className="p-6 md:p-8 rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-blue-50 hover:shadow-lg transition-all scroll-slide-right" style={{ animationDelay: "0.2s" }}>
            <div className="flex items-start gap-3 md:gap-4">
              <div className="text-4xl md:text-5xl flex-shrink-0">👤</div>
              <div>
                <h3 className="text-lg md:text-xl font-bold mb-1 md:mb-2 text-slate-900">User Profiles</h3>
                <p className="text-sm md:text-base text-slate-600">Create your profile and manage your account easily.</p>
              </div>
            </div>
          </div>

          {/* Feature: Message Management - Slide from Left */}
          <div className="p-6 md:p-8 rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-blue-50 hover:shadow-lg transition-all scroll-slide-left" style={{ animationDelay: "0.3s" }}>
            <div className="flex items-start gap-3 md:gap-4">
              <div className="text-4xl md:text-5xl flex-shrink-0">✏️</div>
              <div>
                <h3 className="text-lg md:text-xl font-bold mb-1 md:mb-2 text-slate-900">Edit & Delete</h3>
                <p className="text-sm md:text-base text-slate-600">Full control over your communications with easy management.</p>
              </div>
            </div>
          </div>

          {/* Feature: Message History - Slide from Right */}
          <div className="p-6 md:p-8 rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-blue-50 hover:shadow-lg transition-all scroll-slide-right" style={{ animationDelay: "0.4s" }}>
            <div className="flex items-start gap-3 md:gap-4">
              <div className="text-4xl md:text-5xl flex-shrink-0">📚</div>
              <div>
                <h3 className="text-lg md:text-xl font-bold mb-1 md:mb-2 text-slate-900">Message History</h3>
                <p className="text-sm md:text-base text-slate-600">Resume conversations anytime with message persistence.</p>
              </div>
            </div>
          </div>

          {/* Feature: Emoji Support - Slide from Left */}
          <div className="p-6 md:p-8 rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-blue-50 hover:shadow-lg transition-all scroll-slide-left" style={{ animationDelay: "0.5s" }}>
            <div className="flex items-start gap-3 md:gap-4">
              <div className="text-4xl md:text-5xl flex-shrink-0">😊</div>
              <div>
                <h3 className="text-lg md:text-xl font-bold mb-1 md:mb-2 text-slate-900">Emoji Support</h3>
                <p className="text-sm md:text-base text-slate-600">Express yourself with quick emoji picker integration.</p>
              </div>
            </div>
          </div>

          {/* Feature: Image Support - Slide from Right */}
          <div className="p-6 md:p-8 rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-blue-50 hover:shadow-lg transition-all scroll-slide-right" style={{ animationDelay: "0.6s" }}>
            <div className="flex items-start gap-3 md:gap-4">
              <div className="text-4xl md:text-5xl flex-shrink-0">🖼️</div>
              <div>
                <h3 className="text-lg md:text-xl font-bold mb-1 md:mb-2 text-slate-900">Image Sharing</h3>
                <p className="text-sm md:text-base text-slate-600">Share images and media with easy upload and preview.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid sm:grid-cols-3 gap-6 md:gap-12 text-center">
            <div className="space-y-2 scroll-slide-up" style={{ animationDelay: "0.1s" }}>
              <div className="text-4xl md:text-5xl font-bold">10K+</div>
              <p className="text-base md:text-lg text-blue-100">Active Users</p>
            </div>
            <div className="space-y-2 scroll-slide-up" style={{ animationDelay: "0.2s" }}>
              <div className="text-4xl md:text-5xl font-bold">50M+</div>
              <p className="text-base md:text-lg text-blue-100">Messages Sent</p>
            </div>
            <div className="space-y-2 scroll-slide-up" style={{ animationDelay: "0.3s" }}>
              <div className="text-4xl md:text-5xl font-bold">99.9%</div>
              <p className="text-base md:text-lg text-blue-100">Uptime Guarantee</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-24">
        <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 rounded-3xl p-8 md:p-16 text-center overflow-hidden border border-blue-700/30 scroll-slide-up">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-3xl"></div>
          <div className="relative space-y-4 md:space-y-6">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">Ready to Start Chatting?</h2>
            <p className="text-base md:text-lg lg:text-xl text-blue-100">
              Join thousands of users and start conversations today. It's free and easy to get started.
            </p>
            <Link
              href="/sign-up"
              className="inline-block px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-2xl hover:from-blue-700 hover:to-blue-800 transition-all font-semibold text-base md:text-lg"
            >
              Get Started for Free
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-8 md:mt-0">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold">
                💬
              </div>
              <span className="font-bold text-slate-900 text-sm md:text-base">ChatBox</span>
            </div>
            <p className="text-xs md:text-sm text-slate-600 text-center md:text-right">
              © 2026 ChatBox. A fast, secure, and modern chat application.
            </p>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}
