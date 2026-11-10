import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { STORIES, storyBySlug, type StorySlug } from '@/lib/stories';
import { STORY_TABLES } from '@/lib/storyTables';
import { COUNTRIES, REGION_ORDER, SOURCES } from '@/lib/data';
import { GlobalMapExplorer } from '@/components/chapters/GlobalMap';
import { SexRaceExplorer } from '@/components/chapters/SexRace';
import { ActivityExplorer, ConsequencesExplorer, SleepExplorer } from '@/components/chapters/LifeChapters';
import { OccupationExplorer } from '@/components/chapters/Occupation';
import { SodiumExplorer } from '@/components/chapters/Sodium';

const EXPLORERS: Record<StorySlug, React.ComponentType<{ standalone?: boolean }>> = {
  'global-map': GlobalMapExplorer,
  'sex-race': SexRaceExplorer,
  consequences: ConsequencesExplorer,
  activity: ActivityExplorer,
  sleep: SleepExplorer,
  occupation: OccupationExplorer,
  sodium: SodiumExplorer,
};

export function generateStaticParams() {
  return STORIES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const story = storyBySlug(slug);
  if (!story) return {};
  return {
    title: `${story.title} | Between the Beats`,
    description: `${story.question} ${story.basis}`,
  };
}

function DataTable({ slug }: { slug: StorySlug }) {
  if (slug === 'global-map') {
    return (
      <details className="group rounded-xl border border-line">
        <summary className="flex min-h-12 cursor-pointer items-center justify-between px-5 t-small font-semibold text-ink">
          Show all 194 countries as a table
          <span aria-hidden="true" className="text-mute transition-transform group-open:rotate-45">
            +
          </span>
        </summary>
        <div className="max-h-[480px] overflow-auto border-t border-line">
          <table className="w-full t-small">
            <thead className="sticky top-0 bg-canvas-2 text-left text-mute">
              <tr>
                <th scope="col" className="px-5 py-3 font-semibold">
                  Country
                </th>
                <th scope="col" className="px-5 py-3 font-semibold">
                  WHO region
                </th>
                <th scope="col" className="px-5 py-3 text-right font-semibold">
                  In 100 adults
                </th>
                <th scope="col" className="px-5 py-3 text-right font-semibold">
                  Likely range
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {REGION_ORDER.flatMap((reg) =>
                COUNTRIES.filter((c) => c.r === reg)
                  .sort((a, b) => b.v - a.v)
                  .map((c) => (
                    <tr key={c.c}>
                      <th scope="row" className="px-5 py-2.5 text-left font-normal text-ink">
                        {c.c}
                      </th>
                      <td className="px-5 py-2.5 text-mute">{c.r}</td>
                      <td className="px-5 py-2.5 text-right text-ink tabular">{c.v.toFixed(1)}</td>
                      <td className="px-5 py-2.5 text-right text-mute tabular">
                        {c.lo.toFixed(1)} to {c.hi.toFixed(1)}
                      </td>
                    </tr>
                  )),
              )}
            </tbody>
          </table>
        </div>
      </details>
    );
  }
  const table = STORY_TABLES[slug];
  if (!table) return null;
  return (
    <div>
      <div className="overflow-x-auto rounded-xl border border-line">
        <table className="w-full t-small">
          <thead className="bg-canvas-2 text-left text-mute">
            <tr>
              {table.columns.map((c, i) => (
                <th key={c + i} scope="col" className={`px-5 py-3 font-semibold ${i ? 'text-right' : ''}`}>
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {table.rows.map((row) => (
              <tr key={row.join('|')}>
                {row.map((cell, i) =>
                  i === 0 ? (
                    <th key={i} scope="row" className="px-5 py-3 text-left font-normal text-ink">
                      {cell}
                    </th>
                  ) : (
                    <td key={i} className="px-5 py-3 text-right text-ink tabular">
                      {cell}
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {table.note && <p className="mt-3 t-caption text-faint">{table.note}</p>}
    </div>
  );
}

export default async function StoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const story = storyBySlug(slug);
  if (!story) notFound();
  const Explorer = EXPLORERS[story.slug];
  const index = STORIES.indexOf(story);
  const prev = STORIES[index - 1];
  const next = STORIES[index + 1];
  const source = SOURCES[story.sourceIndex];

  return (
    <article className="pb-24 pt-28">
      <div className="mx-auto max-w-[1040px] px-6">
        <Link
          href={`/#${story.anchor}`}
          className="inline-flex min-h-11 items-center gap-2 t-small text-mute hover:text-ink"
        >
          <svg aria-hidden="true" viewBox="0 0 24 12" className="h-3 w-6">
            <path d="M24 6H4M9 1L4 6l5 5" fill="none" stroke="currentColor" strokeWidth="1.8" />
          </svg>
          Back to the story
        </Link>

        <header className="mt-8 max-w-[720px]">
          <p className="mb-4 flex items-center gap-3 t-small font-semibold text-mute">
            <span aria-hidden="true" className="h-5 w-[3px] rounded-full" style={{ background: story.color }} />
            Story {index + 1} of {STORIES.length}: {story.short}
          </p>
          <h1 className="t-h2 text-ink">{story.title}</h1>
          <p className="mt-6 t-body text-mute">{story.question}</p>
        </header>

        <Explorer standalone />

        <div className="mt-20 grid grid-cols-[minmax(0,1fr)] gap-14 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <div className="space-y-12">
            {story.notes.map((n) => (
              <section key={n.heading} aria-labelledby={`h-${n.heading}`}>
                <h2 id={`h-${n.heading}`} className="t-h3 text-ink">
                  {n.heading}
                </h2>
                <div className="mt-4 space-y-4 t-body text-mute">
                  {n.body.map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                </div>
              </section>
            ))}
            <section aria-labelledby="h-data">
              <h2 id="h-data" className="t-h3 text-ink">
                The numbers
              </h2>
              <div className="mt-5">
                <DataTable slug={story.slug} />
              </div>
            </section>
          </div>

          <aside className="space-y-8 md:sticky md:top-24 md:self-start">
            <div className="rounded-xl border border-line p-6">
              <h2 className="t-small font-semibold text-ink">About this data</h2>
              <p className="mt-2 t-small text-mute">{story.basis}</p>
              <h3 className="mt-6 t-small font-semibold text-ink">Go to the source</h3>
              <ul className="mt-2 space-y-2">
                {source && (
                  <li>
                    <a
                      href={source.link}
                      target="_blank"
                      rel="noreferrer"
                      className="t-small text-mute underline decoration-line underline-offset-4 hover:text-ink"
                    >
                      {source.org}
                      {source.year !== 'n/a' ? `, ${source.year}` : ''}
                    </a>
                  </li>
                )}
                {story.extraLinks?.map((l) => (
                  <li key={l.href}>
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noreferrer"
                      className="t-small text-mute underline decoration-line underline-offset-4 hover:text-ink"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <p className="t-caption text-faint">This is information design, not medical advice.</p>
          </aside>
        </div>

        <nav aria-label="More stories" className="mt-24 grid gap-4 border-t border-line pt-10 sm:grid-cols-2">
          {prev ? (
            <Link href={`/stories/${prev.slug}`} className="group rounded-xl border border-line p-6 hover:border-mute">
              <span className="block t-caption text-faint">Previous story</span>
              <span className="mt-1 block t-small font-semibold text-ink group-hover:text-pulse">{prev.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={`/stories/${next.slug}`}
              className="group rounded-xl border border-line p-6 text-right hover:border-mute"
            >
              <span className="block t-caption text-faint">Next story</span>
              <span className="mt-1 block t-small font-semibold text-ink group-hover:text-pulse">{next.title}</span>
            </Link>
          ) : (
            <Link href="/#trend" className="group rounded-xl border border-line p-6 text-right hover:border-mute">
              <span className="block t-caption text-faint">Back to the main story</span>
              <span className="mt-1 block t-small font-semibold text-ink group-hover:text-pulse">
                The line matters more than the moment
              </span>
            </Link>
          )}
        </nav>
      </div>
    </article>
  );
}
