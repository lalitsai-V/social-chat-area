import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-black border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">💬</span>
            </div>
            <span className="text-xl font-bold">ChatBox</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/sign-in"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Real-time Chat,{" "}
              <span className="text-red-600">Made Simple</span>
            </h1>
            <p className="text-xl text-gray-400 mb-8 leading-relaxed">
              A fast, secure, and modern real-time chat application. Connect
              instantly with friends, colleagues, and communities around the
              world.
            </p>

            {/* CTA Buttons */}
            <div className="flex gap-4">
              <Link
                href="/sign-up"
                className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
              >
                Start Chat Now
              </Link>
              <Link
                href="/sign-in"
                className="px-8 py-3 border border-gray-600 text-white rounded-lg hover:border-gray-400 transition-colors font-semibold"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative">
            <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-2xl p-8 text-center">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-lg font-semibold">Join our community</p>
              <p className="text-gray-200 mt-2">
                Thousands of users are already chatting
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-900 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold mb-16 text-center">
            Why Choose ChatBox?
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-black border border-gray-800 rounded-2xl p-8 hover:border-red-600 transition-colors">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold mb-3">Lightning Fast</h3>
              <p className="text-gray-400">
                Real-time messaging with sub-second latency. Your messages
                arrive instantly.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-black border border-gray-800 rounded-2xl p-8 hover:border-red-600 transition-colors">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-bold mb-3">Secure & Private</h3>
              <p className="text-gray-400">
                End-to-end encryption and secure authentication. Your data
                stays safe.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-black border border-gray-800 rounded-2xl p-8 hover:border-red-600 transition-colors">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-bold mb-3">Fully Responsive</h3>
              <p className="text-gray-400">
                Works seamlessly on desktop, tablet, and mobile devices. Chat
                anywhere.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-black border border-gray-800 rounded-2xl p-8 hover:border-red-600 transition-colors">
              <div className="text-4xl mb-4">✨</div>
              <h3 className="text-xl font-bold mb-3">Modern & Clean</h3>
              <p className="text-gray-400">
                Beautiful, intuitive interface with smooth animations and dark
                theme.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Grid */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold mb-16 text-center">
          Powerful Features
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Feature: Real-time Messaging */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <div className="text-3xl">📨</div>
              <div>
                <h3 className="text-xl font-bold mb-2">
                  Real-time Messaging
                </h3>
                <p className="text-gray-400">
                  Messages are delivered instantly using Supabase Realtime so
                  conversations feel live and natural.
                </p>
              </div>
            </div>
          </div>

          {/* Feature: User Profiles */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <div className="text-3xl">👤</div>
              <div>
                <h3 className="text-xl font-bold mb-2">User Profiles</h3>
                <p className="text-gray-400">
                  Create your profile and manage your account. See who's online
                  and start conversations.
                </p>
              </div>
            </div>
          </div>

          {/* Feature: Message Management */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <div className="text-3xl">✏️</div>
              <div>
                <h3 className="text-xl font-bold mb-2">Edit & Delete</h3>
                <p className="text-gray-400">
                  Edit or delete your messages after sending. Full control over
                  your communications.
                </p>
              </div>
            </div>
          </div>

          {/* Feature: Message History */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <div className="text-3xl">📚</div>
              <div>
                <h3 className="text-xl font-bold mb-2">Message History</h3>
                <p className="text-gray-400">
                  All messages are stored in a database so you can resume
                  conversations anytime.
                </p>
              </div>
            </div>
          </div>

          {/* Feature: Emoji Support */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <div className="text-3xl">😊</div>
              <div>
                <h3 className="text-xl font-bold mb-2">Emoji Support</h3>
                <p className="text-gray-400">
                  Express yourself with emojis. Quick emoji picker for fun and
                  expressive messaging.
                </p>
              </div>
            </div>
          </div>

          {/* Feature: Search */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <div className="text-3xl">🔍</div>
              <div>
                <h3 className="text-xl font-bold mb-2">Search Chats</h3>
                <p className="text-gray-400">
                  Quickly find conversations. Search by name or message content
                  across all chats.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-red-600 to-red-700 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div>
              <div className="text-5xl font-bold mb-2">10K+</div>
              <p className="text-lg text-red-100">Active Users</p>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">50M+</div>
              <p className="text-lg text-red-100">Messages Sent</p>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">99.9%</div>
              <p className="text-lg text-red-100">Uptime</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-r from-gray-900 to-black border border-gray-800 rounded-2xl p-12 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Start Chatting?</h2>
          <p className="text-xl text-gray-400 mb-8">
            Join thousands of users and start conversations today
          </p>
          <Link
            href="/sign-up"
            className="inline-block px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
          >
            Get Started for Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-black">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-6 md:mb-0">
              <div className="w-6 h-6 bg-red-600 rounded-lg flex items-center justify-center text-sm">
                💬
              </div>
              <span className="font-bold">ChatBox</span>
            </div>
            <p className="text-gray-400">
              © 2026 ChatBox. A fast, secure, and modern chat application.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
