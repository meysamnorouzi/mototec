import { FaqList } from "@/components/faq-list";
import { HeroSlider } from "@/components/hero-slider";
import { HomeCatalog } from "@/components/home-catalog";
import { homeFaqs, whyMototec } from "@/lib/storefront";

export default function HomePage() {
  return (
    <>
      <HeroSlider />

      <HomeCatalog />

      <section className="mx-auto max-w-6xl px-5 py-8">
        <div className="mb-8 border-t border-ink/15 pt-8">
          <p className="text-xs text-graphite">اعتماد</p>
          <h2 className="mt-2 text-3xl font-semibold">چرا MotoTec؟</h2>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {whyMototec.map((item, index) => (
            <li
              key={item.title}
              className="rise border border-line bg-panel p-5"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <p className="text-xs text-graphite">{String(index + 1).padStart(2, "0")}</p>
              <h3 className="mt-3 text-lg font-semibold leading-8">{item.title}</h3>
              <p className="mt-2 text-sm leading-7 text-graphite">{item.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-8 pb-20">
        <div className="mb-8 border-t border-ink/15 pt-8">
          <p className="text-xs text-graphite">سوالات پرتکرار</p>
          <h2 className="mt-2 text-3xl font-semibold">سوالات متداول</h2>
        </div>
        <FaqList items={[...homeFaqs]} idPrefix="home-faq" />
      </section>
    </>
  );
}
