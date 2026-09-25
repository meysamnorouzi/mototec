import { formatNumber } from "@/lib/format";
import { site } from "@/lib/site";

export function PriceTag({
  price,
  regularPrice,
  size = "md",
}: {
  price: number | null;
  regularPrice: number | null;
  size?: "md" | "lg";
}) {
  if (price == null) {
    return <p className="text-sm text-graphite">برای اطلاع از قیمت تماس بگیرید</p>;
  }

  const onSale = regularPrice != null && regularPrice > price;
  const amountClass = size === "lg" ? "text-3xl" : "text-lg";

  return (
    <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <span className={`font-semibold ${amountClass}`}>
        {formatNumber(price)}
        <span className="ms-1 text-sm font-normal text-graphite">{site.currency}</span>
      </span>
      {onSale ? (
        <span className="text-sm text-metal line-through">{formatNumber(regularPrice)}</span>
      ) : null}
    </p>
  );
}

const stockLabels = {
  instock: "موجود",
  outofstock: "ناموجود",
  onbackorder: "پیش‌سفارش",
} as const;

export function StockBadge({ status }: { status: keyof typeof stockLabels | "unknown" }) {
  if (status === "unknown") return null;
  const tone =
    status === "instock"
      ? "bg-ink text-white"
      : status === "outofstock"
        ? "bg-transparent text-graphite ring-1 ring-line"
        : "bg-panel text-ink ring-1 ring-ink";

  return <span className={`inline-flex px-2 py-1 text-[11px] ${tone}`}>{stockLabels[status]}</span>;
}
