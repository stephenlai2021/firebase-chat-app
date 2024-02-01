export default function MessageCardSkeletion() {
  return (
    <div className="">
      <div className="flex mb-4">
        <div className="skeleton w-10 h-10 rounded-full"></div>
        <div className="skeleton w-[120px] h-[56px] rounded ml-2"></div>
      </div>    
      <div className="flex justify-end mb-4">
        <div className="skeleton w-10 h-10 rounded-full"></div>
        <div className="skeleton w-[120px] h-[56px] rounded ml-2"></div>
      </div>    
    </div>
  );
}
