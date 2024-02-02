export default function UsersCardSkeleton() {
  return (
    <div className="flex items-center p-4 users-mobile">
      <div className="flex-shrink-0 mr-4">
        <div className="skeleton w-12 h-12 rounded-full"></div>
      </div>

      <div className="flex-1 flex-col space-y-1">
        <div className="flex justify-between">
          <div className="skeleton w-[60px] h-[24px] rounded"></div>
          <div className="skeleton w-[80px] h-[16px] rounded"></div>
        </div>
        <div className="skeleton w-[150px] h-[18px] rounded"></div>
      </div>
    </div>
  );
}
