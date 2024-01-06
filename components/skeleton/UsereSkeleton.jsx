import { Skeleton } from "@/components/ui/skeleton";

import UsersCardSkeleton from "./UsersCardSkeleton";

export default function UsersSkeleton() {
  return (
    <div className="bg-gray-900 w-[300px] h-full flex flex-col pt-4">
      <div>
        {"abcdef".split("").map((i) => (
          <UsersCardSkeleton key={i} />
        ))}
      </div>
      <div className="flex p-4 absolute bottom-0">
        <Skeleton className="w-[30px] h-[30px] rounded-full" />
        {/* <div className="border border-2 flex items-center"> */}
        <div className="flex items-center">
          <Skeleton className="w-[20px] h-[20px] rounded absolute left-[250px]" />
        </div>
      </div>
    </div>
  );
}
