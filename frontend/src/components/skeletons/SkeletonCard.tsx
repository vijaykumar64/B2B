import { Skeleton } from '../ui/skeleton';

export function SkeletonCard() {
  return (
    <div className="rounded-[2.5rem] border-2 border-border overflow-hidden bg-card">
      {/* Image area */}
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="p-5 space-y-3">
        {/* Logo + title row */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
        {/* Badges row */}
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        {/* Description lines */}
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        {/* Button */}
        <Skeleton className="h-10 w-full rounded-xl mt-2" />
      </div>
    </div>
  );
}
