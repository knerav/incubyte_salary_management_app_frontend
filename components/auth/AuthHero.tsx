export default function AuthHero() {
  return (
    <div className="hidden lg:flex lg:w-3/5 bg-neutral-900 flex-col justify-center px-12 xl:px-16 py-10 relative overflow-hidden">
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-600 opacity-10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-16 w-80 h-80 bg-amber-500 opacity-10 rounded-full blur-3xl pointer-events-none" />

      <div className="mb-10 relative">
        <span className="text-2xl font-bold tracking-tight">
          <span className="text-amber-500">HR</span>
          <span className="text-white">Pulse</span>
        </span>
      </div>

      <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-4 relative">
        Your people,<br />perfectly managed.
      </h1>

      <p className="text-neutral-400 text-base xl:text-lg leading-relaxed mb-10 max-w-md relative">
        Streamline HR operations, track compensation, and gain clear insights
        into your workforce — all from one place.
      </p>

      <div className="grid grid-cols-3 gap-4 relative">
        <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-4">
          <div className="w-8 h-8 rounded-lg bg-amber-600/20 flex items-center justify-center mb-3">
            <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-white text-sm font-semibold mb-1">Employee Records</h3>
          <p className="text-neutral-500 text-xs leading-relaxed">Full employee profiles with job history and compensation in one place.</p>
        </div>

        <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-4">
          <div className="w-8 h-8 rounded-lg bg-amber-600/20 flex items-center justify-center mb-3">
            <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-white text-sm font-semibold mb-1">Salary Insights</h3>
          <p className="text-neutral-500 text-xs leading-relaxed">Visualise pay distribution and spot trends across your organisation.</p>
        </div>

        <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-4">
          <div className="w-8 h-8 rounded-lg bg-amber-600/20 flex items-center justify-center mb-3">
            <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-white text-sm font-semibold mb-1">Org Structure</h3>
          <p className="text-neutral-500 text-xs leading-relaxed">Manage departments and job titles to keep your org clearly structured.</p>
        </div>
      </div>
    </div>
  );
}
