import Link from "next/link";

import { PageHeader } from "@/components/page-header";

export default function NotFound() {
  return (
    <>
      <PageHeader
        eyebrow="۴۰۴"
        title="این صفحه پیدا نشد"
        description="محصول یا دسته ممکن است هنوز در فروشگاه ثبت نشده باشد."
        image="/images/night-ride.jpg"
      />
      <div className="mx-auto max-w-xl px-5 py-16 text-center">
        <Link href="/shop" className="inline-flex bg-ink px-5 py-3 text-sm text-white">
          بازگشت به فروشگاه
        </Link>
      </div>
    </>
  );
}
