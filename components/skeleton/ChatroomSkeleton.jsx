export default function ChatroomSkeleton() {
  return (
    <div className="shadow-inner flex-grow w-9/12 chatroom-hide">
      <div className="flex items-center justify-center h-full">
        <div className="skeleton rounded w-[200px] h-[32px]"></div>
      </div>
    </div>
  );
}
