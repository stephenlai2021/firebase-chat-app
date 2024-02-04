/* components */
import UsersCardSkeleton from "./UsersCardSkeleton";
import SidebarSkeleton from "./SidebarSkeleton";
import BottomMenuSkeleton from "./BottomMenuSkeleton";

export default function UsersSkeleton() {
  return (
    <div className="flex users-mobile shadow-inner">
      <SidebarSkeleton />
      <div className="w-[300px] h-full flex flex-col pt-">
        <div className="h-[60px] flex items-center pl-[15px]">
          <div className="skeleton rounded w-[110px] h-[28px]"></div>
        </div>

        <div className="pt-2">
          {"abcd".split("").map((i) => (
            <UsersCardSkeleton key={i} />
          ))}
        </div>
        <BottomMenuSkeleton />
      </div>
    </div>
  );
}
