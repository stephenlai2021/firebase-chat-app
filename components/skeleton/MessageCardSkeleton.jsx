import { Skeleton } from "@/components/ui/skeleton";

export default function MessageCardSkeletion() {
  return (
    <div className="">
      <div className="flex mb-4">
        <Skeleton className="w-10 h-10 rounded-full" />
        <Skeleton className="w-[120px] h-[56px] rounded ml-2" />
      </div>    
      <div className="flex justify-end mb-4">
        <Skeleton className="w-10 h-10 rounded-full" />
        <Skeleton className="w-[120px] h-[56px] rounded ml-2" />
      </div>    
    </div>
  );
}
