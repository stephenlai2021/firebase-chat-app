/* components */
import UsersCardSkeleton from "./UsersCardSkeleton";
import SidebarSkeleton from "./SidebarSkeleton";

export default function UsersSkeleton() {
  return (
    <div className="flex users-mobile">
      <SidebarSkeleton />
      <div className="w-[300px] h-full flex flex-col pt-">
        {/* title */}
        <div className="h-[60px] flex items-center pl-[15px]">
          <div className="skeleton rounded w-[110px] h-[28px]"></div>
        </div>
        
        {"abcdef".split("").map((i) => (
          <UsersCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
