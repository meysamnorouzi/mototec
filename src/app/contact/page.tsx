import { PageHeader } from "@/components/page-header";
import { optionalContact, site } from "@/lib/site";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "تماس با موتوتک",
  description: `سفارش و استعلام موجودی موتوتک از طریق ${site.phoneDisplay}`,
  path: "/contact",
  image: "/images/dashcam-road.jpg",
});

export default function ContactPage() {
  const channels = [
    optionalContact.whatsapp ? ["واتساپ", optionalContact.whatsapp] : null,
    optionalContact.instagram ? ["اینستاگرام", optionalContact.instagram] : null,
    optionalContact.telegram ? ["تلگرام", optionalContact.telegram] : null,
    optionalContact.email ? ["ایمیل", `mailto:${optionalContact.email}`] : null,
  ].filter((item): item is [string, string] => item != null);

  return (
    <>
      <PageHeader
        eyebrow="تماس"
        title="برای سفارش و موجودی زنگ بزنید"
        description="قیمت، موجودی و جزئیات ارسال از همین شماره پاسخ داده می‌شود."
        image="/images/dashcam-road.jpg"
        imageAlt="جاده از دید دوربین ثبت وقایع"
      />
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 lg:grid-cols-2">
      <div>
        <a href={`tel:${site.phoneTel}`} className="inline-flex bg-ink px-6 py-4 text-2xl text-white">
          {site.phoneDisplay}
        </a>
        <dl className="mt-8 space-y-4 text-sm">
          {optionalContact.address ? (
            <div>
              <dt className="text-graphite">آدرس</dt>
              <dd className="mt-1">{optionalContact.address}</dd>
            </div>
          ) : null}
          {optionalContact.hours ? (
            <div>
              <dt className="text-graphite">ساعت پاسخگویی</dt>
              <dd className="mt-1">{optionalContact.hours}</dd>
            </div>
          ) : null}
        </dl>
        {channels.length > 0 ? (
          <ul className="mt-6 flex flex-wrap gap-2">
            {channels.map(([label, href]) => (
              <li key={label}>
                <a href={href} className="inline-flex border border-line bg-panel px-3 py-2 text-sm hover:border-ink">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <form action={`sms:${site.phoneTel}`} className="border border-line bg-panel p-6">
        <h2 className="text-xl font-semibold">پیام کوتاه</h2>
        <p className="mt-2 text-sm leading-7 text-graphite">با ارسال، پیام‌رسان گوشی باز می‌شود تا متن را برای موتوتک بفرستید.</p>
        <label className="mt-6 block text-sm" htmlFor="body">
          متن پیام
        </label>
        <textarea
          id="body"
          name="body"
          rows={6}
          defaultValue="سلام، درباره محصولات موتوتک سؤال دارم."
          className="mt-2 w-full border border-line bg-paper px-3 py-3 text-sm outline-none"
        />
        <button type="submit" className="mt-4 bg-ink px-5 py-3 text-sm text-white">
          آماده‌سازی پیام
        </button>
      </form>
    </div>
    </>
  );
}
