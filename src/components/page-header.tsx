import { Breadcrumbs } from "@/components/breadcrumbs";

export function PageHeader({
  eyebrow,
  title,
  description,
  image,
  imageAlt = "",
  crumbs,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  image: string;
  imageAlt?: string;
  crumbs?: { href?: string; label: string }[];
}) {
  return (
    <header className="relative isolate min-h-[58vh] overflow-hidden bg-ink text-white md:min-h-[78vh]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image} alt={imageAlt} className="drift absolute inset-0 h-full w-full object-cover opacity-70" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/10" />
      <div className="relative mx-auto flex min-h-[58vh] max-w-6xl flex-col justify-end px-4 py-10 md:min-h-[78vh] md:px-5 md:py-20">
        {crumbs ? (
          <div className="mb-6 text-white/80 [&_a]:text-white/80 [&_a:hover]:text-white [&_span]:text-white">
            <Breadcrumbs items={crumbs} />
          </div>
        ) : null}
        <p className="rise text-xs text-white/70">{eyebrow}</p>
        <h1 className="rise mt-3 max-w-3xl text-3xl font-semibold leading-tight sm:text-4xl md:text-6xl" style={{ animationDelay: "80ms" }}>
          {title}
        </h1>
        {description ? (
          <p className="rise mt-4 max-w-2xl text-sm leading-8 text-white/80 md:text-base" style={{ animationDelay: "140ms" }}>
            {description}
          </p>
        ) : null}
      </div>
    </header>
  );
}
