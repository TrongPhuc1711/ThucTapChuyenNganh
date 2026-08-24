export function SkeletonLine({ className = "" }) {
  return <div className={`skeleton h-4 rounded-lg ${className}`} />;
}

export function SkeletonCard({ className = "" }) {
  return (
    <div className={`bg-white rounded-2xl border border-coffee-100/50 p-5 space-y-4 ${className}`}>
      <div className="skeleton h-40 rounded-xl" />
      <div className="space-y-2">
        <div className="skeleton h-4 w-3/4 rounded-lg" />
        <div className="skeleton h-3 w-1/2 rounded-lg" />
      </div>
      <div className="flex justify-between items-center">
        <div className="skeleton h-5 w-20 rounded-lg" />
        <div className="skeleton h-8 w-16 rounded-lg" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div className="space-y-3 p-5">
      {/* Header */}
      <div className="flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="skeleton h-4 flex-1 rounded-lg" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-2">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="skeleton h-5 flex-1 rounded-lg" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-6 animate-pulse-soft">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-coffee-100/50 p-5">
            <div className="flex items-center gap-4">
              <div className="skeleton w-12 h-12 rounded-xl" />
              <div className="space-y-2 flex-1">
                <div className="skeleton h-6 w-16 rounded-lg" />
                <div className="skeleton h-3 w-24 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Content */}
      <div className="bg-white rounded-2xl border border-coffee-100/50 p-5">
        <div className="skeleton h-6 w-40 rounded-lg mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-12 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
