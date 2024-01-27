import MessageCardSkeleton from "./MessageCardSkeleton";

export default function MessageSkeleton() {
  return (
    <div>
      {/* <div className="border-2 border-red-300"> */}
      <div className="">
        {"ab".split("").map((i) => (
          <MessageCardSkeleton key={i} />
        ))}
      </div>
            
    </div>
  );
}
