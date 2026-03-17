import { notFound } from "next/navigation";

import { QuizGate } from "@/components/quiz-gate";
import { SiteHeader } from "@/components/site-header";
import { getProductBySku, getQuizBySlug, getSectionById } from "@/data/course-data";

type QuizPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function QuizPage({ params }: QuizPageProps) {
  const { slug } = await params;
  const quiz = getQuizBySlug(slug);

  if (!quiz) {
    notFound();
  }

  const product = getProductBySku(quiz.productSku);

  if (!product) {
    notFound();
  }

  const section = getSectionById(quiz.sectionId);

  return (
    <>
      <SiteHeader />
      <main className="site-shell detail-shell">
        <section className="glass-card quiz-page-hero">
          <div className="eyebrow">Premium quiz pack</div>
          <h1>{quiz.title}</h1>
          <p>
            {quiz.description} Это формат для тех, кто хочет перестать просто узнавать термины и начать замечать
            искажения в живых формулировках, спорах и выводах.
          </p>
          <div className="quiz-page-hero__meta">
            <span>{section?.title}</span>
            <span>{product.priceXtr} Stars</span>
            <span>{quiz.questions.length} вопросов</span>
          </div>
        </section>

        <QuizGate product={product} quiz={quiz} />
      </main>
    </>
  );
}
