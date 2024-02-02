export default function BottomMenuSkeleton() {
  return (
    <div className="mt-auto hidden users-mobile h-[64px]">
      <div className="w-1/3 flex justify-center items-center h-full">
        <div className="skeleton w-[24px] h-[24px]"></div>
      </div>
      <div className="w-1/3 flex justify-center items-center h-full">
        <div className="skeleton w-[24px] h-[24px]"></div>
      </div>
      <div className="w-1/3 flex justify-center items-center h-full">
        <div className="skeleton w-[24px] h-[24px]"></div>
      </div>
    </div>
  );
}
