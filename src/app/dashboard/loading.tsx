export default function DashboardLoading() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-6">
        <div className="h-8 w-40 bg-gray-100 rounded animate-pulse" />
        <div className="h-9 w-36 bg-gray-100 rounded animate-pulse" />
      </div>
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-16 bg-gray-50 border border-gray-100 rounded-lg animate-pulse" />
      ))}
    </div>
  );
}
