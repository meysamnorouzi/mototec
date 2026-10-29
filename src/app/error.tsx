"use client";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-xl px-5 py-24 text-center">
      <h1 className="text-3xl font-semibold">ارتباط با وردپرس برقرار نشد</h1>
      <p className="mt-3 text-sm leading-7 text-graphite">
        دریافت محصولات یا مجله ممکن نشد. نشانی وردپرس و کلید موتوتک را بررسی کنید.
      </p>
      <button type="button" onClick={reset} className="mt-6 bg-ink px-5 py-3 text-sm text-white">
        تلاش دوباره
      </button>
    </div>
  );
}
