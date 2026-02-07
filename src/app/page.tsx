import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-hidden">
      {/* Navigation */}
      <nav className="relative z-10 container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-white">WatchParty</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-gray-300 hover:text-white transition-colors font-medium px-4 py-2">
              Login
            </Link>
            <Link href="/register" className="bg-purple-600 text-white px-5 py-2.5 rounded-xl hover:bg-purple-500 transition-all font-medium shadow-lg shadow-purple-600/25">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative container mx-auto px-4 pt-12 pb-24">
        {/* Background glow effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-purple-600/15 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute top-40 left-1/4 w-[400px] h-[400px] bg-pink-600/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-5 py-2 mb-8 backdrop-blur-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400"></span>
            </span>
            <span className="text-purple-300 text-sm font-medium">Watch videos together in real-time</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-[1.1] tracking-tight">
            Watch Together,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400">
              Anywhere in the World
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Create a room, invite your friends, and enjoy videos perfectly synchronized.
            Chat, voice call, screen share, and react together — no matter the distance.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
            <Link href="/register" className="group bg-gradient-to-r from-purple-600 to-purple-500 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-purple-500 hover:to-purple-400 transition-all shadow-xl shadow-purple-600/25 flex items-center justify-center gap-2">
              Start Watching Free
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link href="#how-it-works" className="border border-gray-700 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white/5 hover:border-gray-600 transition-all flex items-center justify-center gap-2">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              See How It Works
            </Link>
          </div>

          {/* Hero Mockup */}
          <div className="relative mx-auto max-w-4xl">
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-purple-600/20 blur-3xl rounded-3xl pointer-events-none"></div>
            <div className="relative bg-gray-900/90 backdrop-blur-xl border border-gray-800 rounded-2xl p-5 shadow-2xl shadow-black/50">
              {/* Window chrome */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                <div className="flex-1 mx-4 bg-gray-800 rounded-lg px-4 py-1.5 text-gray-500 text-sm text-center">
                  watchparty.app/room/movie-night
                </div>
              </div>
              {/* App content mockup */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="md:col-span-2 bg-gray-950 rounded-xl aspect-video flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-transparent"></div>
                  <div className="text-center relative z-10">
                    <div className="w-16 h-16 bg-white/10 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-3 border border-white/20">
                      <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                    <p className="text-gray-500 text-sm">Synced Video Player</p>
                  </div>
                  {/* Progress bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
                    <div className="h-full w-[35%] bg-purple-500 rounded-r"></div>
                  </div>
                </div>
                <div className="bg-gray-950 rounded-xl p-4 flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-gray-400 text-sm font-semibold">Live Chat</p>
                    <span className="text-xs text-green-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                      3 online
                    </span>
                  </div>
                  <div className="space-y-2.5 flex-1">
                    <div className="flex gap-2 items-start">
                      <div className="w-6 h-6 bg-purple-600 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold">A</div>
                      <div className="bg-gray-800/80 rounded-lg px-3 py-1.5 text-sm text-gray-300">This scene is amazing!</div>
                    </div>
                    <div className="flex gap-2 items-start">
                      <div className="w-6 h-6 bg-pink-600 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold">M</div>
                      <div className="bg-gray-800/80 rounded-lg px-3 py-1.5 text-sm text-gray-300">I know right!</div>
                    </div>
                    <div className="flex gap-2 items-start">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold">J</div>
                      <div className="bg-gray-800/80 rounded-lg px-3 py-1.5 text-sm text-gray-300">Wait for it...</div>
                    </div>
                  </div>
                  <div className="mt-3 bg-gray-800 rounded-lg px-3 py-2 text-sm text-gray-500 border border-gray-700/50">
                    Type a message...
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-gray-800/50 bg-gray-900/30">
        <div className="container mx-auto px-4 py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-1">
              <p className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">100%</p>
              <p className="text-gray-500 text-sm font-medium">Free to Use</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Real-time</p>
              <p className="text-gray-500 text-sm font-medium">Video Sync</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Unlimited</p>
              <p className="text-gray-500 text-sm font-medium">Watch Rooms</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Instant</p>
              <p className="text-gray-500 text-sm font-medium">QR Sharing</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <p className="text-purple-400 font-semibold text-sm uppercase tracking-wider mb-3">Features</p>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Everything You Need for
            <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400"> Watch Parties</span>
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Packed with features to make every watch party unforgettable
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
          {[
            {
              icon: (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
              gradient: 'from-purple-500 to-purple-700',
              title: 'Perfect Video Sync',
              desc: 'Play, pause, and seek in perfect sync. Everyone watches the same moment together.',
            },
            {
              icon: (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              ),
              gradient: 'from-pink-500 to-pink-700',
              title: 'Live Chat',
              desc: 'React and chat in real-time with typing indicators. Share your thoughts instantly.',
            },
            {
              icon: (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              ),
              gradient: 'from-amber-500 to-orange-600',
              title: 'Voice Chat',
              desc: 'Talk with your friends while watching. No need for separate voice apps.',
            },
            {
              icon: (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              ),
              gradient: 'from-emerald-500 to-emerald-700',
              title: 'Screen Sharing',
              desc: 'Share any browser tab to watch movies, shows, or content from any site together.',
            },
            {
              icon: (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h2M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              ),
              gradient: 'from-blue-500 to-blue-700',
              title: 'QR Code Sharing',
              desc: 'Share your room instantly with a QR code. Friends can join with just a scan.',
            },
            {
              icon: (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              ),
              gradient: 'from-violet-500 to-violet-700',
              title: 'Friends System',
              desc: 'Add friends and easily invite them to your watch parties with one click.',
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="group bg-gray-900 hover:bg-gray-800/80 p-7 rounded-2xl border border-gray-800 hover:border-gray-700 transition-all duration-300"
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-500 leading-relaxed text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-gray-900/50 border-y border-gray-800/50 py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-purple-400 font-semibold text-sm uppercase tracking-wider mb-3">How It Works</p>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Get Started in <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">3 Steps</span>
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Connector line */}
              <div className="hidden md:block absolute top-10 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600"></div>

              <div className="text-center relative">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white shadow-xl shadow-purple-600/25 relative z-10">
                  1
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Create a Room</h3>
                <p className="text-gray-500 text-sm">
                  Sign up for free and create your watch room in seconds
                </p>
              </div>

              <div className="text-center relative">
                <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-pink-700 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white shadow-xl shadow-pink-600/25 relative z-10">
                  2
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Invite Friends</h3>
                <p className="text-gray-500 text-sm">
                  Share the room link or QR code with your friends
                </p>
              </div>

              <div className="text-center relative">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white shadow-xl shadow-blue-600/25 relative z-10">
                  3
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Watch Together</h3>
                <p className="text-gray-500 text-sm">
                  Add a video and enjoy synchronized watching with live chat
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="relative max-w-4xl mx-auto text-center overflow-hidden rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/80 to-pink-900/80"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-600/30 via-transparent to-transparent"></div>
          <div className="relative p-12 md:p-16 border border-purple-500/20 rounded-3xl">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Watch Together?
            </h2>
            <p className="text-gray-300 text-lg mb-8 max-w-xl mx-auto">
              Join users who are already enjoying synchronized watch parties with friends and family.
            </p>
            <Link href="/register" className="inline-flex items-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition-all shadow-xl">
              Create Your First Room
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800/50">
        <div className="container mx-auto px-4 py-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-lg font-bold text-white">WatchParty</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <Link href="/login" className="hover:text-white transition-colors">Login</Link>
              <Link href="/register" className="hover:text-white transition-colors">Sign Up</Link>
              <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            </div>
            <p className="text-gray-600 text-sm">
              Made with love for movie nights
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
