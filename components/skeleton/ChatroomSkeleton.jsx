import { Skeleton } from "@/components/ui/skeleton"

export default function ChatroomSkeleton() {
  return (
    <div className="flex-grow w-9/12">
      <div className="flex items-center justify-center h-full">
        <Skeleton className="w-[200px] h-[32px]" />
      </div>
    </div>
  );
}
