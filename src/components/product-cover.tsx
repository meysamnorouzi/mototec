import type { Product } from "@/lib/types";

export function ProductCover({ product, className = "" }: { product: Product; className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-ink text-white ${className}`}>
      <div className="absolute inset-0 blueprint opacity-30" />
      <div className="absolute -bottom-10 -start-8 h-40 w-40 rotate-45 border border-white/15" />
      <div className="relative flex h-full flex-col justify-between p-5">
        <p className="text-[11px] tracking-[0.28em] text-white/60">{product.brand.toUpperCase()}</p>
        <div>
          <p className="text-3xl font-semibold tracking-tight">{product.model}</p>
          <p className="mt-2 max-w-[16rem] text-sm leading-6 text-white/70">{product.categories[0]?.name}</p>
        </div>
      </div>
    </div>
  );
}
