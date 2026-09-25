import { PageHeader } from "@/components/page-header";
import { site } from "@/lib/site";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "درباره موتوتک",
  description: site.description,
  path: "/about",
  image: "/images/helmet-ride.jpg",
});

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow={site.nameEn.toUpperCase()}
        title="درباره موتوتک"
        description={site.slogan}
        image="/images/helmet-ride.jpg"
        imageAlt="موتورسوار با کلاه کاسکت"
      />
      <article className="mx-auto max-w-3xl px-5 py-16">
      <p className="text-sm leading-8 text-graphite">{site.description}</p>
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          ["خودرو", "دوربین ثبت وقایع و تجهیزاتی که رانندگی را ایمن‌تر می‌کند."],
          ["موتورسیکلت", "اینترکام، بلوتوث و دوربین کلاه کاسکت برای مسیر."],
          ["قابل گسترش", "دسته‌های تازه فقط وقتی ساخته می‌شوند که محصول داشته باشند."],
        ].map(([title, copy]) => (
          <section key={title} className="border border-line bg-panel p-4">
            <h2 className="font-semibold">{title}</h2>
            <p className="mt-2 text-sm leading-7 text-graphite">{copy}</p>
          </section>
        ))}
      </div>
    </article>
    </>
  );
}
