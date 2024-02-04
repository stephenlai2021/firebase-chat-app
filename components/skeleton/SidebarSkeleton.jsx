export default function SidebarSkeleton() {
  return (
    <div className="shadow-inner h-full p-5 flex flex-col items-center sidebar-hide">
      <div className="skeleton rounded mb-6 w-[22px] h-[22px]"></div>
      <div className="skeleton rounded mb-6 w-[22px] h-[22px]"></div>
      <div className="skeleton mt-auto w-[30px] h-[30px]"></div>
    </div>
  );
}
