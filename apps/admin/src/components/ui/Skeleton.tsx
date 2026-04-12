export const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

export const SkeletonStatValue = () => <Skeleton className="h-8 w-20 mt-1" />;

export const SkeletonTableRows = ({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) => (
  <table className="w-full">
    <tbody className="divide-y divide-gray-200">
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="animate-pulse">
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} className="px-6 py-4">
              <div className={`h-4 bg-gray-200 rounded ${j === cols - 1 ? 'w-12 ml-auto' : j === 0 ? 'w-20' : j === 1 ? 'w-36' : 'w-24'}`} />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
);

export const SkeletonListItems = ({ count = 4 }: { count?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg animate-pulse">
        <div className="space-y-2 flex-1 mr-4">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
    ))}
  </div>
);

export const SkeletonDetailCard = () => (
  <div className="space-y-6 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-9 w-72" />
        <Skeleton className="h-4 w-44" />
      </div>
      <Skeleton className="h-9 w-28 rounded-lg" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[0, 1].map((i) => (
        <div key={i} className="bg-white rounded-lg shadow p-6 space-y-4">
          <Skeleton className="h-5 w-36" />
          {Array.from({ length: 4 }).map((_, j) => (
            <div key={j} className="flex justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-40" />
            </div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonFormCard = ({ fields = 6 }: { fields?: number }) => (
  <div className="space-y-6 animate-pulse">
    <Skeleton className="h-9 w-56" />
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <Skeleton className="h-5 w-32" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
    <div className="flex justify-end gap-3">
      <Skeleton className="h-10 w-24 rounded-lg" />
      <Skeleton className="h-10 w-36 rounded-lg" />
    </div>
  </div>
);

export const SkeletonPageWithStats = ({
  statCount = 4,
  tableRows = 6,
  tableCols = 6,
}: {
  statCount?: number;
  tableRows?: number;
  tableCols?: number;
}) => (
  <div className="space-y-6 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-4 w-44" />
      </div>
    </div>
    {statCount > 0 && (
      <div className="grid grid-cols-1 gap-4" style={{ gridTemplateColumns: `repeat(${statCount}, minmax(0, 1fr))` }}>
        {Array.from({ length: statCount }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>
    )}
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <Skeleton className="h-9 w-64 rounded-lg" />
      </div>
      <SkeletonTableRows rows={tableRows} cols={tableCols} />
    </div>
  </div>
);
