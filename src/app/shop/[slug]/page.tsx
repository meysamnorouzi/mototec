import { ShopLive } from "@/components/shop-live";

export function generateStaticParams() {
  return [{ slug: "_" }];
}

export default function ShopCategoryPage() {
  return <ShopLive />;
}
