const SkeletonCard = () => {
  return (
    <div className="glass-card rounded-xl p-4 animate-pulse">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl skeleton" />
          <div>
            <div className="h-5 w-32 skeleton rounded mb-2" />
            <div className="h-4 w-40 skeleton rounded" />
          </div>
        </div>
        <div className="h-6 w-20 skeleton rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 skeleton rounded" />
          <div>
            <div className="h-3 w-8 skeleton rounded mb-1" />
            <div className="h-4 w-16 skeleton rounded" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 skeleton rounded" />
          <div>
            <div className="h-3 w-12 skeleton rounded mb-1" />
            <div className="h-4 w-24 skeleton rounded" />
          </div>
        </div>
      </div>
      <div className="h-3 w-32 skeleton rounded mt-3" />
    </div>
  );
};

export default SkeletonCard;
