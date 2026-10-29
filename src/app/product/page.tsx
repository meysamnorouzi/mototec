import { ProductLive } from "@/components/product-live";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "محصول",
  description: "محصولات موتوتک",
  path: "/product",
  image: "/images/night-ride.jpg",
});

export default function ProductShellPage() {
  return <ProductLive />;
}
