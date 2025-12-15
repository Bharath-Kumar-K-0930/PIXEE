import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#e0f7fa] to-[#b2ebf2] flex items-center justify-center p-8">
      <div className="max-w-4xl w-full text-center">
        <div className="mb-12 animate-fade-in">
          <h1 className="text-7xl font-bold text-[#158fa8] mb-6 tracking-tight">
            PIXEE
          </h1>
          <p className="text-2xl text-[#0a4f5c] mb-4">
            Upload a selfie → Find your memories instantly
          </p>
          <p className="text-lg text-[#158fa8]/80">
            AI-powered face recognition runs on your device. Privacy first.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
          <Link
            href="/login"
            className="group relative px-8 py-4 bg-[#158fa8] text-white rounded-full font-semibold text-lg hover:bg-[#0e6b7d] transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 w-full sm:w-auto"
          >
            <span className="flex items-center justify-center gap-2">
              Get Started Free
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </Link>

          <Link
            href="/admin"
            className="px-8 py-4 border-2 border-[#158fa8] text-[#0a4f5c] rounded-full font-semibold text-lg hover:bg-[#e0f7fa] hover:border-[#0e6b7d] transition-all duration-300 w-full sm:w-auto"
          >
            Admin Panel
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-[#0a4f5c]">
          <div className="bg-white/80 backdrop-blur-lg rounded-xl p-6 border border-[#80deea] shadow-sm">
            <div className="text-3xl mb-3">🔒</div>
            <h3 className="font-semibold text-lg mb-2">Privacy First</h3>
            <p className="text-sm text-[#158fa8]">All face recognition runs on your device. No data sent to servers.</p>
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-xl p-6 border border-[#80deea] shadow-sm">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="font-semibold text-lg mb-2">Instant Results</h3>
            <p className="text-sm text-[#158fa8]">Find your photos among 500+ event images in seconds.</p>
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-xl p-6 border border-[#80deea] shadow-sm">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="font-semibold text-lg mb-2">Smart Matching</h3>
            <p className="text-sm text-[#158fa8]">Advanced AI detects faces with high accuracy.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
