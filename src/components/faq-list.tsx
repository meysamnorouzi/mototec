import type { Faq } from "@/lib/types";

export function FaqList({ items, idPrefix = "faq" }: { items: Faq[]; idPrefix?: string }) {
  if (items.length === 0) return null;

  return (
    <div className="divide-y divide-line border border-line bg-panel">
      {items.map((item, index) => (
        <details key={`${item.question}-${index}`} className="group px-5 py-4 open:bg-paper/60" name={idPrefix}>
          <summary className="cursor-pointer list-none text-sm font-medium leading-7 marker:content-none [&::-webkit-details-marker]:hidden">
            <span className="flex items-start justify-between gap-4">
              <span>{item.question}</span>
              <span className="mt-0.5 text-graphite transition group-open:rotate-45" aria-hidden>
                +
              </span>
            </span>
          </summary>
          <p className="mt-3 max-w-3xl text-sm leading-8 text-graphite">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
