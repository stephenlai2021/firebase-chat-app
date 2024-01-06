import ChatroomSkeleton from "./ChatroomSkeleton";
import UsersSkeleton from "./UsereSkeleton";

export default function LoadingSkeleton() {
  return (
    <div className="flex h-screen">
      <UsersSkeleton />
      <ChatroomSkeleton />
    </div>
  );
}
