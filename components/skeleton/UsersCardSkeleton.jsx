import { Skeleton } from "@/components/ui/skeleton";

export default function UsersCardSkeleton() {
  return (
    <div className={`flex items-center p-4`}>
      {/* Avatar on the left */}
      <div className="flex-shrink-0 mr-4">
        <Skeleton className="w-12 h-12 rounded-full" />
      </div>

      {/* Name on the right */}
      <div className="flex flex-col space-y-1">
        <Skeleton className="w-[80px] h-[24px] rounded" />
        <Skeleton className="w-[50px] h-[18px] rounded" />
      </div>
    </div>
  );
}
