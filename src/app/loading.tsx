export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <div className="h-8 w-40 animate-pulse bg-line" />
      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="aspect-[4/5] animate-pulse border border-line bg-panel" />
        ))}
      </div>
    </div>
  );
}
