import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { AtlasViewer } from "@/components/atlas-viewer";
import { LeadForm } from "@/components/lead-form";
import { SiteHeader } from "@/components/site-header";
import { getAllLessons, getAtlasGraph, getFeaturedLessons } from "@/lib/content";
import { telegramDeepLink } from "@/lib/telegram";

function getCategoryColorToken(category: string): string {
  if (category.includes("запоминаем") || category.includes("Память")) return "soft-yellow";
  if (category.includes("много информации") || category.includes("Перегрузка")) return "soft-blue";
  if (category.includes("смысл") || category.includes("Смысл")) return "soft-red";
  if (category.includes("реагируем") || category.includes("Реакции")) return "soft-green";
  return "soft-blue";
}

const valueCards = [
  {
    title: "🧠 Чтобы быстрее замечать ловушки мышления",
    text: "Не после ошибки, а прямо в моменте: в споре, выборе, тревоге, переговорах и важных решениях."
  },
  {
    title: "📚 Чтобы изучать сложную тему без перегруза",
    text: "Короткие уроки идут последовательно и собирают целую систему, а не хаотичный набор терминов."
  },
  {
    title: "💬 Чтобы не просто читать, а примерять на себя",
    text: "Под каждым уроком можно спросить AI, как искажение проявляется именно в жизни, работе и привычках."
  },
  {
    title: "🎯 Чтобы закреплять знание практикой",
    text: "Квизы помогают не узнавать название искажения, а действительно распознавать его в аргументах и поведении."
  }
];

const audienceCards = [
  {
    title: "Тем, кто много думает и сомневается",
    text: "Если ты часто прокручиваешь решения, споры, переписки и пытаешься понять, где тебя уводит мышление."
  },
  {
    title: "Тем, кто работает с людьми",
    text: "Руководителям, продуктовым специалистам, маркетологам, преподавателям, психологам, коучам и всем, кто принимает решения не в вакууме."
  },
  {
    title: "Тем, кто устал от сухой теории",
    text: "Здесь не нужно продираться через академический список терминов: сначала видишь карту, потом читаешь короткие уроки и сразу применяешь."
  }
];

const flowSteps = [
  {
    title: "Оставляешь контакт и забираешь вход",
    text: "На сайте сохраняешь email, при желании Telegram username, и сразу переходишь в бот без долгой регистрации.",
    colorToken: "soft-blue"
  },
  {
    title: "Проходишь курс от начала до конца",
    text: "Уроки идут последовательно: коротко, ясно и без ощущения, что тебя бросили в энциклопедию терминов.",
    colorToken: "soft-green"
  },
  {
    title: "В любой момент спрашиваешь AI",
    text: "Если хочется глубже, бот предлагает три готовых вопроса и дает продолжить разговор голосом или текстом.",
    colorToken: "soft-yellow"
  },
  {
    title: "Когда захочется практики — открываешь квизы",
    text: "На сайте тебя ждут сценарии, разборы и проверка на внимательность к собственным когнитивным ловушкам.",
    colorToken: "soft-red"
  }
];

type HomePageProps = {
  searchParams: Promise<{
    focus?: string;
    source?: string;
    utm_campaign?: string;
    utm_medium?: string;
    utm_source?: string;
  }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const [featuredLessons, graph, lessons] = await Promise.all([getFeaturedLessons(), getAtlasGraph(), getAllLessons()]);
  const params = await searchParams;

  return (
    <>
      <SiteHeader />

      <main className="site-shell landing-grid">
        <section className="hero-section" id="about">
          <div className="hero-copy">
            <div className="eyebrow">🧠 Telegram-курс + интерактивный атлас</div>
            <h1>Курс по когнитивным искажениям, который помогает видеть, где мышление тихо подменяет реальность.</h1>
            <p className="hero-text">
              Это не просто список терминов. Это живая карта из 160+ искажений, короткие последовательные уроки в
              Telegram и AI, который помогает примерить каждую ловушку мышления к собственной жизни.
            </p>

            <div className="hero-actions">
              <a className="primary-button" href="#atlas">
                Открыть атлас
              </a>
              <a className="ghost-button" href={telegramDeepLink("start")}>
                Начать курс в Telegram
              </a>
            </div>

            <div className="hero-metrics">
              <div className="glass-card metric-card">
                <strong>160+</strong>
                <span>коротких уроков по всей экосистеме искажений</span>
              </div>
              <div className="glass-card metric-card">
                <strong>4</strong>
                <span>больших режима, из которых рождается большинство когнитивных ловушек</span>
              </div>
              <div className="glass-card metric-card">
                <strong>AI</strong>
                <span>по каждому уроку: три подсказки и свободный диалог в контексте темы</span>
              </div>
            </div>
          </div>

          <aside className="glass-card hero-story-card">
            <div className="eyebrow">✨ Почему это цепляет</div>
            <h2>Видишь не хаос терминов, а понятную карту того, как мозг ошибается.</h2>
            <ul className="hero-story-list">
              <li>Сразу понимаешь, откуда берутся искажения: из памяти, перегруза, поиска смысла и быстрых реакций.</li>
              <li>Читаешь короткие уроки по порядку и не теряешься в объеме материала.</li>
              <li>Нажимаешь на любой узел карты и раскрываешь его как карточку, а не как сухую справку.</li>
              <li>Возвращаешься к практике через квизы, когда хочешь проверить себя на реальных формулировках.</li>
            </ul>
            <p className="hero-story-note">
              Базовый курс бесплатный. Premium-слой нужен только для тех, кто хочет больше практики и самопроверки.
            </p>
          </aside>
        </section>

        <section className="feature-grid-section">
          {valueCards.map((feature) => (
            <article key={feature.title} className="glass-card feature-card">
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </article>
          ))}
        </section>

        <section className="section-stack" id="for-who">
          <div className="section-heading section-heading--wide">
            <div className="eyebrow">Для кого</div>
            <h2>Для тех, кто хочет думать точнее, а не просто знать умные названия.</h2>
            <p>
              Курс особенно хорошо ложится на повседневную жизнь: когда нужно замечать самообман в суждениях, не
              переоценивать эмоции момента и не принимать важные решения на автопилоте.
            </p>
          </div>

          <div className="audience-grid">
            {audienceCards.map((item) => (
              <article key={item.title} className="glass-card audience-card">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section-stack" id="atlas">
          <div className="section-heading section-heading--wide">
            <div className="eyebrow">Главная вау-фича</div>
            <h2>Атлас встроен прямо в лендинг и работает как живая mind map.</h2>
            <p>
              В центре — ядро карты. Вокруг — четыре большие группы, из которых ветвятся подгруппы и отдельные
              искажения. Нажимаешь на любую ветвь и сразу открываешь карточку, не покидая страницу.
            </p>
          </div>

          <AtlasViewer graph={graph} initialSlug={params.focus || null} lessons={lessons} />
        </section>

        <section className="lead-section">
          <div className="section-copy">
            <div className="eyebrow">🚀 Забрать старт</div>
            <h2>Оставь контакт, чтобы не потерять вход, новые разделы и практику.</h2>
            <p>
              Если курс тебе откликается, лучше забрать место сейчас: старт придет в Telegram, а обновления и новые
              квизы не потеряются в шуме.
            </p>
            
            <div className="lead-benefits">
              <div className="lead-benefit">
                <span className="lead-benefit__icon">📬</span>
                <div>
                  <strong>Первый урок сразу</strong>
                  <span>Начни проходить курс в первые 5 минут после регистрации</span>
                </div>
              </div>
              <div className="lead-benefit">
                <span className="lead-benefit__icon">🧠</span>
                <div>
                  <strong>AI-помощник в каждом уроке</strong>
                  <span>Три готовых вопроса и свободный диалог по теме</span>
                </div>
              </div>
              <div className="lead-benefit">
                <span className="lead-benefit__icon">🎯</span>
                <div>
                  <strong>Практика через квизы</strong>
                  <span>Проверяй себя на реальных примерах и сценариях</span>
                </div>
              </div>
            </div>
          </div>

          <LeadForm
            source={params.source || "landing"}
            utmCampaign={params.utm_campaign}
            utmMedium={params.utm_medium}
            utmSource={params.utm_source}
          />
        </section>

        <section className="featured-section" id="biases">
          <div className="section-heading">
            <div className="eyebrow">Карточки искажений</div>
            <h2>Начни с самых цепляющих искажений</h2>
            <p>
              Если хочется быстро почувствовать стиль курса, начни с нескольких особенно узнаваемых ловушек мышления.
            </p>
          </div>

          <div className="bias-grid">
            {featuredLessons.map((lesson) => {
              const colorToken = getCategoryColorToken(lesson.category);
              return (
                <article key={lesson.id} className={`glass-card bias-card bias-card--${colorToken}`}>
                  <div className="bias-card__tag">{lesson.category}</div>
                  <h3>{lesson.title}</h3>
                  <p>{lesson.shortText}</p>
                  <div className="bias-card__actions">
                    <Link className="secondary-link" href={`/biases/${lesson.slug}`}>
                      Читать карточку
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="flow-section" id="flow">
          <div className="section-heading">
            <div className="eyebrow">Как проходит курс</div>
            <h2>Путь устроен просто и без перегруза</h2>
          </div>

          <div className="flow-grid">
            {flowSteps.map((step, index) => (
              <article key={step.title} className="glass-card flow-step">
                <span className={`flow-step__index flow-step__index--${step.colorToken}`}>0{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="quiz-section" id="quiz">
          <div className="glass-card quiz-hero">
            <div>
              <div className="eyebrow">Premium quiz pack</div>
              <h2>Практика для тех, кто хочет не только читать, но и реально узнавать искажения вживую.</h2>
              <p>
                Квизы нужны не для галочки. Они помогают ловить ошибки мышления в аргументах, объяснениях, оценке
                людей, выборе и повседневных формулировках. Один раз открыл — и возвращаешься к практике по мере
                прохождения курса.
              </p>
            </div>

            <div className="quiz-hero__actions">
              <Link className="primary-button" href="/quizzes/judgment-lab">
                Открыть квизы
              </Link>
            </div>
          </div>
        </section>

        <section className="closing-band" id="start">
          <div>
            <div className="eyebrow">Старт</div>
            <h2>Если тема давно тебя цепляла — это хороший момент войти в нее глубоко и по-человечески понятно.</h2>
          </div>
          <a className="primary-button primary-button--wide" href={telegramDeepLink("start")}>
            Перейти в Telegram <ArrowRight size={18} />
          </a>
        </section>
      </main>
    </>
  );
}
