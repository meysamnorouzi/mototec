import type { Category, Product } from "./types";

/** ترتیب نمایش دسته‌های ویترین؛ دسته‌های خالی از درخت حذف می‌شوند. */
export const storefrontCategoryOrder = [
  "dashcam",
  "helmet-bluetooth",
  "smart-motorcycle",
  "phone-power",
  "security",
  "travel-gear",
] as const;

export const knownBrands = ["AZDOME", "Lingdu", "Maxto"] as const;

export const whyMototec = [
  {
    title: "انتخاب تخصصی محصولات",
    text: "فقط تجهیزاتی که برای خودرو و موتور کاربرد واقعی دارند، در فروشگاه می‌آیند.",
  },
  {
    title: "تضمین اصالت کالا",
    text: "کالا از مسیر معتبر تأمین می‌شود و مشخصات با همان مدل موجود در انبار هم‌خوان است.",
  },
  {
    title: "ارسال سریع",
    text: "پس از تأیید سفارش، ارسال در کوتاه‌ترین زمان ممکن انجام می‌شود.",
  },
  {
    title: "پشتیبانی قبل و بعد از خرید",
    text: "برای انتخاب مدل مناسب و بعد از تحویل، می‌توانید مستقیم با ما مشورت کنید.",
  },
] as const;

export const homeFaqs = [
  {
    question: "محصولات MotoTec گارانتی دارند؟",
    answer:
      "بله. شرایط گارانتی هر کالا در صفحه همان محصول نوشته می‌شود. قبل از خرید می‌توانید از پشتیبانی هم جزئیات را بپرسید.",
  },
  {
    question: "امکان مشاوره قبل از خرید هست؟",
    answer:
      "بله. نوع کلاه، مدل موتور یا خودرو و نیازتان را بگویید تا مدل مناسب‌تر را پیشنهاد کنیم.",
  },
  {
    question: "ارسال به شهرستان دارید؟",
    answer: "بله. ارسال به شهرستان انجام می‌شود؛ زمان و هزینه را هنگام ثبت سفارش اعلام می‌کنیم.",
  },
  {
    question: "چطور بفهمم یک اینترکام به کلاه من می‌خورد؟",
    answer:
      "بیشتر اینترکام‌ها روی کلاه Full Face، Modular و بعضی مدل‌های باز نصب می‌شوند. مدل کلاه را بگویید تا سازگاری را چک کنیم.",
  },
  {
    question: "دوربین‌های ثبت وقایع بدون اینترنت هم کار می‌کنند؟",
    answer:
      "بله. فیلم روی کارت حافظه ذخیره می‌شود. اینترنت فقط برای بعضی امکانات مثل انتقال فایل به موبایل یا به‌روزرسانی لازم است.",
  },
] as const;

/** اسلاگ‌های قدیمی وردپرس → اسلاگ ویترین فعلی */
const categoryAliases: Record<string, (typeof storefrontCategoryOrder)[number]> = {
  "helmet-gear": "helmet-bluetooth",
};

export function orderedStorefrontCategories(tree: Category[]): Category[] {
  const bySlug = new Map(tree.map((category) => [category.slug, category]));
  for (const [from, to] of Object.entries(categoryAliases)) {
    const legacy = bySlug.get(from);
    if (legacy && !bySlug.has(to)) bySlug.set(to, legacy);
  }

  const ordered = storefrontCategoryOrder
    .map((slug) => bySlug.get(slug))
    .filter((category): category is Category => Boolean(category));
  const seen = new Set(ordered.map((category) => category.slug));
  return [...ordered, ...tree.filter((category) => !seen.has(category.slug))];
}

export function productBrands(products: Product[]): string[] {
  const fromProducts = products
    .map((product) => product.brand.trim())
    .filter(Boolean);
  const merged = [...knownBrands, ...fromProducts];
  const seen = new Set<string>();
  const brands: string[] = [];
  for (const brand of merged) {
    const key = brand.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    brands.push(brand);
  }
  return brands.filter((brand) =>
    fromProducts.some((item) => item.toLowerCase() === brand.toLowerCase()),
  );
}

export function featuredProducts(products: Product[], limit = 8): Product[] {
  const marked = products.filter((product) => product.featured);
  const pool = marked.length > 0 ? marked : products;
  return pool.slice(0, Math.min(Math.max(limit, 4), 8));
}

export function newestProducts(products: Product[], limit = 8): Product[] {
  return [...products]
    .sort((a, b) => {
      if (a.modified === b.modified) return b.id - a.id;
      return a.modified < b.modified ? 1 : -1;
    })
    .slice(0, limit);
}
