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
      </div>
    </div>
  );
}
