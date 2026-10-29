import { ProductLive } from "@/components/product-live";

export function generateStaticParams() {
  return [{ slug: "_" }];
}

export default function ProductPage() {
  return <ProductLive />;
}
