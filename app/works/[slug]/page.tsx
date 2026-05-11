import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { readWorks, findWork } from "@/lib/works";
import { ProjectMeta } from "@/components/ProjectMeta";
import { ProjectHero } from "./ProjectHero";

export async function generateStaticParams() {
  return readWorks().map((w) => ({ slug: w.slug }));
}

type Params = Promise<{ slug: string }>;

export default async function ProjectPage({ params }: { params: Params }) {
  const { slug } = await params;
  const work = findWork(slug);
  if (!work) notFound();

  // Split MDX body: opening paragraph (everything before the first blank line)
  // becomes the intro, the rest is the body.
  const [intro, ...rest] = work.body.split(/\n\s*\n/);
  const bodyRest = rest.join("\n\n");

  return (
    <main className="min-h-screen w-full bg-white text-black">
      <section className="px-6 pt-28 pb-10">
        <h1 className="text-7xl font-bold italic leading-none md:text-8xl">{work.title}</h1>
      </section>

      <ProjectHero slug={work.slug} cover={work.cover} alt={work.title} />

      <section className="grid grid-cols-1 gap-8 px-6 py-12 md:grid-cols-[25%_1fr] md:gap-16">
        <ProjectMeta work={work} />
        <div className="prose max-w-prose text-xl leading-relaxed">
          <MDXRemote source={intro} />
        </div>
      </section>

      <section className="prose mx-auto max-w-prose px-6 pb-32 text-xl leading-relaxed [&_img]:my-12 [&_img]:w-full [&_p]:my-8">
        <MDXRemote source={bodyRest} />
      </section>
    </main>
  );
}
