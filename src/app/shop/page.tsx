import { ShopLive } from "@/components/shop-live";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "فروشگاه",
  description: "تجهیزات هوشمند، اکسسوری و لوازم کاربردی خودرو و موتورسیکلت در فروشگاه موتوتک.",
  path: "/shop",
  image: "/images/night-ride.jpg",
});

export default function ShopPage() {
  return <ShopLive />;
}
