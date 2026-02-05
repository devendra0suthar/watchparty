import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-white">WatchParty</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-gray-300 hover:text-white transition-colors font-medium">
              Login
            </Link>
            <Link href="/register" className="bg-purple-600 text-white px-5 py-2.5 rounded-xl hover:bg-purple-700 transition-all hover:scale-105 font-medium">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-16 pb-24">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-500/30 rounded-full px-4 py-2 mb-8">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-purple-300 text-sm font-medium">Watch videos together in real-time</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Watch Together,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-purple-400">
              Anywhere in the World
            </span>
          </h1>

          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Create a room, invite your friends, and enjoy YouTube videos perfectly synchronized.
            Chat, react, and share moments together - no matter the distance.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/register" className="group bg-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-purple-700 transition-all hover:scale-105 flex items-center justify-center gap-2">
              Start Watching Free
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link href="#how-it-works" className="border border-gray-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white/5 transition-all flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              See How It Works
            </Link>
          </div>

          {/* Hero Image/Mockup */}
          <div className="relative mx-auto max-w-4xl">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 to-pink-600/30 blur-3xl rounded-full"></div>
            <div className="relative bg-gray-800/80 backdrop-blur border border-gray-700 rounded-2xl p-4 shadow-2xl">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="ml-4 text-gray-400 text-sm">Movie Night Room</span>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="md:col-span-2 bg-gray-900 rounded-xl aspect-video flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-8 h-8 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                    <p className="text-gray-500">Video Player</p>
                  </div>
                </div>
                <div className="bg-gray-900 rounded-xl p-4 flex flex-col">
                  <p className="text-gray-400 text-sm font-medium mb-3">Live Chat</p>
                  <div className="space-y-2 flex-1">
                    <div className="flex gap-2">
                      <div className="w-6 h-6 bg-purple-600 rounded-full flex-shrink-0"></div>
                      <div className="bg-gray-800 rounded-lg px-3 py-1.5 text-sm text-gray-300">This is amazing!</div>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-6 h-6 bg-pink-600 rounded-full flex-shrink-0"></div>
                      <div className="bg-gray-800 rounded-lg px-3 py-1.5 text-sm text-gray-300">Love this part</div>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex-shrink-0"></div>
                      <div className="bg-gray-800 rounded-lg px-3 py-1.5 text-sm text-gray-300">Haha!</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-gray-800 bg-gray-900/50">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-white mb-1">100%</p>
              <p className="text-gray-400">Free to Use</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-white mb-1">Real-time</p>
              <p className="text-gray-400">Video Sync</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-white mb-1">Unlimited</p>
              <p className="text-gray-400">Watch Rooms</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-white mb-1">Instant</p>
              <p className="text-gray-400">QR Sharing</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Everything You Need for Watch Parties
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Packed with features to make your watch parties unforgettable
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Feature 1 */}
          <div className="group bg-gray-800/50 hover:bg-gray-800 p-8 rounded-2xl border border-gray-700/50 hover:border-purple-500/50 transition-all">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Perfect Video Sync</h3>
            <p className="text-gray-400 leading-relaxed">
              Play, pause, and seek videos in perfect sync. Everyone watches the same moment together.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="group bg-gray-800/50 hover:bg-gray-800 p-8 rounded-2xl border border-gray-700/50 hover:border-purple-500/50 transition-all">
            <div className="w-14 h-14 bg-gradient-to-br from-pink-600 to-pink-700 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Live Chat</h3>
            <p className="text-gray-400 leading-relaxed">
              React and chat in real-time. Share your thoughts instantly with everyone in the room.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="group bg-gray-800/50 hover:bg-gray-800 p-8 rounded-2xl border border-gray-700/50 hover:border-purple-500/50 transition-all">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h2M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">QR Code Sharing</h3>
            <p className="text-gray-400 leading-relaxed">
              Share your room instantly with a QR code. Friends can join with just a scan.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="group bg-gray-800/50 hover:bg-gray-800 p-8 rounded-2xl border border-gray-700/50 hover:border-purple-500/50 transition-all">
            <div className="w-14 h-14 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Friends System</h3>
            <p className="text-gray-400 leading-relaxed">
              Add friends and easily invite them to your watch parties with one click.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="group bg-gray-800/50 hover:bg-gray-800 p-8 rounded-2xl border border-gray-700/50 hover:border-purple-500/50 transition-all">
            <div className="w-14 h-14 bg-gradient-to-br from-yellow-600 to-orange-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Voice Chat</h3>
            <p className="text-gray-400 leading-relaxed">
              Talk with your friends while watching. No need for separate voice apps.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="group bg-gray-800/50 hover:bg-gray-800 p-8 rounded-2xl border border-gray-700/50 hover:border-purple-500/50 transition-all">
            <div className="w-14 h-14 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">YouTube Support</h3>
            <p className="text-gray-400 leading-relaxed">
              Watch any YouTube video together. Just paste the link and start watching.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-gray-900/50 py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-gray-400 text-lg">
              Get started in just 3 simple steps
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white">
                  1
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Create a Room</h3>
                <p className="text-gray-400">
                  Sign up for free and create your watch room in seconds
                </p>
              </div>

              {/* Arrow */}
              <div className="hidden md:flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-600 -mt-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>

              {/* Step 2 */}
              <div className="text-center md:col-start-2">
                <div className="w-16 h-16 bg-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white">
                  2
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Invite Friends</h3>
                <p className="text-gray-400">
                  Share the room link or QR code with your friends
                </p>
              </div>

              {/* Arrow */}
              <div className="hidden md:flex items-center justify-center md:col-start-3 md:row-start-1">
                <svg className="w-8 h-8 text-gray-600 -mt-16 rotate-90 md:rotate-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>

              {/* Step 3 */}
              <div className="text-center md:col-start-3">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white">
                  3
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Watch Together</h3>
                <p className="text-gray-400">
                  Add a video and enjoy synchronized watching with live chat
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-3xl p-12 border border-purple-500/20">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Watch Together?
          </h2>
          <p className="text-gray-300 text-lg mb-8 max-w-xl mx-auto">
            Join thousands of users who are already enjoying synchronized watch parties with friends and family.
          </p>
          <Link href="/register" className="inline-flex items-center gap-2 bg-white text-purple-900 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition-all hover:scale-105">
            Create Your First Room
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-white">WatchParty</span>
            </div>
            <div className="flex items-center gap-6 text-gray-400">
              <Link href="/login" className="hover:text-white transition-colors">Login</Link>
              <Link href="/register" className="hover:text-white transition-colors">Sign Up</Link>
              <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            </div>
            <p className="text-gray-500 text-sm">
              Made with love for movie nights
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
