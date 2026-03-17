import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteHeader } from "@/components/site-header";
import { getLessonBySlug, getRelatedLessons, getSectionById, lessons } from "@/data/course-data";
import { atlasDeepLink } from "@/lib/telegram";

type BiasPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  return lessons.map((lesson) => ({
    slug: lesson.slug
  }));
}

export default async function BiasPage({ params }: BiasPageProps) {
  const { slug } = await params;
  const lesson = getLessonBySlug(slug);

  if (!lesson) {
    notFound();
  }

  const section = getSectionById(lesson.sectionId);
  const related = getRelatedLessons(slug);

  return (
    <>
      <SiteHeader />
      <main className="site-shell detail-shell">
        <article className="detail-layout">
          <section className="glass-card detail-card">
            <div className="eyebrow">{section?.title || lesson.category}</div>
            <h1>{lesson.title}</h1>
            <p className="detail-lead">{lesson.shortText}</p>
            <div className="detail-body">
              <p>{lesson.fullText}</p>
              <div className="detail-subsection">
                <h2>Что можно спросить у AI в уроке</h2>
                <ul>
                  {lesson.aiSuggestions.map((suggestion) => (
                    <li key={suggestion}>{suggestion}</li>
                  ))}
                </ul>
              </div>
              <div className="detail-subsection">
                <h2>На что обратить внимание в своей жизни</h2>
                <p>{lesson.aiContext}</p>
              </div>
            </div>
          </section>

          <aside className="detail-aside">
            <div className="glass-card side-card">
              <div className="eyebrow">Переходы</div>
              <h3>Что делать дальше</h3>
              <div className="stack-actions">
                <a className="primary-button" href={atlasDeepLink(lesson.slug)}>
                  Открыть курс в Telegram
                </a>
                <Link className="ghost-button" href={`/?focus=${lesson.slug}#atlas`}>
                  Найти узел на карте
                </Link>
              </div>
            </div>

            <div className="glass-card side-card">
              <div className="eyebrow">Источники</div>
              <ul className="source-list">
                <li>{lesson.sourceBookRef}</li>
                <li>{lesson.sourceAtlasRef}</li>
              </ul>
            </div>

            <div className="glass-card side-card">
              <div className="eyebrow">Связанные искажения</div>
              <div className="side-card__list">
                {related.map((item) => (
                  <Link key={item.id} href={`/biases/${item.slug}`}>
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </article>
      </main>
    </>
  );
}
