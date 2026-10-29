export function LiveNotice({ status }: { status: "loading" | "error" }) {
  return (
    <div className="mx-auto max-w-6xl px-5 py-16 text-center">
      <p className="text-lg font-medium">
        {status === "loading" ? "در حال خواندن از موتوتک…" : "ارتباط با فروشگاه برقرار نشد"}
      </p>
      {status === "error" ? (
        <p className="mt-2 text-sm text-graphite">صفحه را یک‌بار تازه کنید. اگر ادامه داشت، افزونه موتوتک هدلس را دوباره روی وردپرس بگذارید.</p>
      ) : null}
    </div>
  );
}
