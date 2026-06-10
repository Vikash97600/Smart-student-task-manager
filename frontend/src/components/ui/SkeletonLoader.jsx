export function Skeleton({ className = '' }) {
  return <div className={`skeleton ${className}`} />;
}

export function StatCardSkeleton() {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex justify-between mb-4">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-10 w-10 rounded-xl" />
      </div>
      <Skeleton className="h-8 w-16 mt-2" />
      <Skeleton className="h-3 w-24 mt-2" />
    </div>
  );
}

export function TaskCardSkeleton() {
  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-start gap-3">
        <Skeleton className="w-5 h-5 rounded mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-3 w-full mb-3" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => <StatCardSkeleton key={i} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6">
          <Skeleton className="h-6 w-40 mb-4" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
        <div className="glass rounded-2xl p-6">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/30">
        <div className="flex gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-4 flex-1" />)}
        </div>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 border-b border-gray-100/50 dark:border-gray-700/20">
          <div className="flex gap-4">
            <Skeleton className="h-4 flex-[2]" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 flex-1" />
          </div>
        </div>
      ))}
    </div>
  );
}
