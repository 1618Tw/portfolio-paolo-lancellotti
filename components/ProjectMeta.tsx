import type { Work } from "@/lib/types";

export function ProjectMeta({ work }: { work: Work }) {
  const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="grid grid-cols-[80px_1fr] gap-4 py-1 text-sm">
      <dt className="text-neutral-500">{label}</dt>
      <dd>{value}</dd>
    </div>
  );

  const visit = work.visitSite ? (
    <a
      href={work.visitSite}
      target="_blank"
      rel="noreferrer"
      className="underline-offset-2 hover:underline"
    >
      Visit site
    </a>
  ) : (
    <span className="text-neutral-300">Visit site</span>
  );

  return (
    <dl className="font-mono">
      <Row label="Type" value={work.type} />
      <Row label="Year" value={String(work.year)} />
      <Row label="" value={visit} />
    </dl>
  );
}
