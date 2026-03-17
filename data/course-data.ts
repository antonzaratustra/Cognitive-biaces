import { AtlasEdge, AtlasGraph, AtlasNode, Lesson, Product, Quiz, Section } from "@/lib/types";

export const sections: Section[] = [
  {
    id: "memory",
    slug: "memory",
    title: "Когда запоминаем и вспоминаем",
    shortTitle: "Память",
    description: "Прошлое не хранится как архив. Мозг редактирует его, усиливает яркое и склеивает опыт в удобную историю.",
    sortOrder: 1,
    colorToken: "soft-yellow",
    startAngle: 210,
    endAngle: 315,
    callouts: [
      "Запоминаем то, что было ярче, страннее или эмоциональнее",
      "Редактируем воспоминания после события",
      "Склеиваем прошлое в аккуратный, но не всегда честный сюжет"
    ],
    subgroups: [
      {
        id: "memory-salience",
        title: "Что остается в памяти",
        description: "Яркое, пиковое и недавнее часто вытесняет спокойную реальность."
      },
      {
        id: "memory-editing",
        title: "Как прошлое переписывается",
        description: "После результата нам кажется, что все было очевидно заранее."
      },
      {
        id: "memory-story",
        title: "Как воспоминание становится выводом",
        description: "Прошлый опыт быстро превращается в общее правило."
      }
    ]
  },
  {
    id: "information",
    slug: "information",
    title: "Когда много информации",
    shortTitle: "Перегрузка",
    description: "Когда сигналов слишком много, мозг экономит силы: цепляется за знакомое, яркое и то, что уже звучало раньше.",
    sortOrder: 2,
    colorToken: "soft-blue",
    startAngle: 320,
    endAngle: 35,
    callouts: [
      "Замечаем знакомое и контрастное быстрее, чем важное",
      "Считаем частым то, что просто легче вспомнить",
      "Ищем подтверждение уже выбранной версии"
    ],
    subgroups: [
      {
        id: "info-signal",
        title: "Что прорывается в фокус",
        description: "Контраст, тревога и недавность получают приоритет."
      },
      {
        id: "info-frequency",
        title: "Как шум кажется закономерностью",
        description: "Повторяемое и легкодоступное кажется более правдивым."
      },
      {
        id: "info-filter",
        title: "Как мы отфильтровываем неудобное",
        description: "Мозг подтверждает уже знакомую картину мира."
      }
    ]
  },
  {
    id: "meaning",
    slug: "meaning",
    title: "Когда не хватает смысла",
    shortTitle: "Смысл",
    description: "Если реальность слишком сложная, мозг быстро достраивает причины, намерения и красивый нарратив.",
    sortOrder: 3,
    colorToken: "soft-red",
    startAngle: 45,
    endAngle: 140,
    callouts: [
      "Достраиваем причины и намерения там, где данных мало",
      "Предпочитаем красивую историю сложной реальности",
      "Судим о людях по видимому, а контекст забываем"
    ],
    subgroups: [
      {
        id: "meaning-story",
        title: "Как рождается сюжет",
        description: "Мозг связывает события в цельную историю, даже если часть связей придумана."
      },
      {
        id: "meaning-logic",
        title: "Как вывод кажется разумным",
        description: "Нравящийся вывод делает аргумент убедительнее, чем он есть."
      },
      {
        id: "meaning-people",
        title: "Как мы читаем других",
        description: "Мы переоцениваем характер и недооцениваем обстоятельства."
      }
    ]
  },
  {
    id: "reaction",
    slug: "reaction",
    title: "Когда быстро реагируем",
    shortTitle: "Реакции",
    description: "В быстрых решениях мозг выбирает не лучшее, а самое знакомое, безопасное или уже начатое.",
    sortOrder: 4,
    colorToken: "soft-green",
    startAngle: 145,
    endAngle: 220,
    callouts: [
      "Боимся потерь сильнее, чем тянемся к выгоде",
      "Держимся за текущее просто потому, что оно уже есть",
      "Хватаемся за первый ориентир и под него подгоняем решение"
    ],
    subgroups: [
      {
        id: "reaction-anchor",
        title: "Первый ориентир",
        description: "Первая цифра и первый вариант задают рамку дальнейшего выбора."
      },
      {
        id: "reaction-risk",
        title: "Страх потерять",
        description: "Опасение потери держит нас в невыгодных сценариях."
      },
      {
        id: "reaction-default",
        title: "Сила текущего сценария",
        description: "Дефолт и старые вложения делают бездействие удобнее перемен."
      }
    ]
  }
];

export const lessons: Lesson[] = [
  {
    id: "hindsight-bias",
    slug: "hindsight-bias",
    sectionId: "memory",
    subgroupId: "memory-editing",
    sortOrder: 1,
    title: "Эффект знания задним числом",
    shortText: "После события кажется, что мы все понимали заранее, хотя в моменте будущее было туманным.",
    fullText:
      "Когда результат уже известен, мозг сжимает неопределенность и переписывает прошлое так, будто исход был очевидным. Из-за этого мы хуже учимся на опыте, слишком уверенно оцениваем свои прогнозы и слишком жестко судим чужие решения. Этот урок помогает вернуть в память реальную сложность момента и отличать знания после события от знаний до него.",
    aiContext:
      "Объясняй, почему hindsight bias делает ретроспективы нечестными, а прошлое — слишком понятным. Предлагай практики: фиксировать прогнозы заранее, отделять исходные данные от итогов и сохранять контекст неопределенности.",
    aiSuggestions: [
      "Почему после события все кажется очевидным? 🤔",
      "Как делать честные ретроспективы без самообмана?",
      "Как фиксировать прогнозы, чтобы реально учиться?"
    ],
    atlasNodeId: "node-hindsight-bias",
    relatedSlugs: ["peak-end-rule", "rosy-retrospection", "narrative-fallacy"],
    sourceBookRef: "Memory / hindsight bias",
    sourceAtlasRef: "Когда запоминаем и вспоминаем",
    category: "Когда запоминаем и вспоминаем",
    publishedAt: "2026-03-17T00:00:00.000Z"
  },
  {
    id: "peak-end-rule",
    slug: "peak-end-rule",
    sectionId: "memory",
    subgroupId: "memory-salience",
    sortOrder: 2,
    title: "Правило пика и финала",
    shortText: "Мы запоминаем не весь опыт, а его самый сильный момент и концовку.",
    fullText:
      "Большая часть опыта исчезает в фоне, а в памяти остаются пик эмоции и финальный штрих. Поэтому поездка, разговор, презентация или даже день могут оцениваться совсем не так, как проживались на самом деле. Понимание этого искажения помогает не только точнее вспоминать, но и лучше проектировать свои собственные продукты, встречи и ритуалы.",
    aiContext:
      "Показывай, как peak-end rule влияет на оценку опыта, сервиса, отношений и самоощущения. Подсказывай, как проектировать сильные завершения и не переоценивать весь путь по одному эпизоду.",
    aiSuggestions: [
      "Почему один яркий момент перекрашивает весь опыт?",
      "Как это влияет на сервис, отношения и впечатления?",
      "Что важно помнить, когда оцениваешь прошлый день или проект?"
    ],
    atlasNodeId: "node-peak-end-rule",
    relatedSlugs: ["hindsight-bias", "rosy-retrospection", "availability-heuristic"],
    sourceBookRef: "Memory / peak-end rule",
    sourceAtlasRef: "Когда запоминаем и вспоминаем",
    category: "Когда запоминаем и вспоминаем",
    publishedAt: "2026-03-17T00:00:00.000Z"
  },
  {
    id: "rosy-retrospection",
    slug: "rosy-retrospection",
    sectionId: "memory",
    subgroupId: "memory-story",
    sortOrder: 3,
    title: "Розовая ретроспекция",
    shortText: "Через время прошлое начинает казаться приятнее и ровнее, чем было в реальности.",
    fullText:
      "Мозг умеет смягчать шероховатости и оставлять в памяти более теплую версию прошлого. Поэтому старые проекты, отношения, места и даже тяжелые периоды иногда кажутся почти золотым временем. Это делает нас уязвимыми к повторению неудачных сценариев и мешает трезво сравнивать прошлое с настоящим.",
    aiContext:
      "Объясняй, как мозг романтизирует прошлое, сглаживает негатив и делает старые варианты привлекательнее текущих. Предлагай сравнение по фактам, а не по настроению воспоминания.",
    aiSuggestions: [
      "Почему прошлое часто кажется лучше настоящего? ✨",
      "Как не романтизировать старые решения и отношения?",
      "Как сравнивать прошлое и настоящее по фактам?"
    ],
    atlasNodeId: "node-rosy-retrospection",
    relatedSlugs: ["peak-end-rule", "status-quo-bias", "hindsight-bias"],
    sourceBookRef: "Memory / rosy retrospection",
    sourceAtlasRef: "Когда запоминаем и вспоминаем",
    category: "Когда запоминаем и вспоминаем",
    publishedAt: "2026-03-17T00:00:00.000Z"
  },
  {
    id: "availability-heuristic",
    slug: "availability-heuristic",
    sectionId: "information",
    subgroupId: "info-frequency",
    sortOrder: 4,
    title: "Эвристика доступности",
    shortText: "Чем легче вспоминается пример, тем вероятнее и важнее он нам кажется.",
    fullText:
      "Если событие яркое, недавнее или эмоционально заряженное, мозг быстро подсовывает его как доказательство того, что это и есть реальность. Поэтому мы переоцениваем заметные риски, верим в частоту редких случаев и строим выводы на запоминаемом, а не на репрезентативном. Этот урок учит возвращаться от впечатления к выборке.",
    aiContext:
      "Помогай распознавать момент, когда человек путает запоминаемость с вероятностью. Предлагай проверять базовую частоту, объем выборки и отделять яркость события от его реальной распространенности.",
    aiSuggestions: [
      "Почему яркие примеры так сильно влияют на меня?",
      "Как не путать запоминаемость и вероятность?",
      "Какой быстрый вопрос помогает остановиться?"
    ],
    atlasNodeId: "node-availability-heuristic",
    relatedSlugs: ["confirmation-bias", "negativity-bias", "peak-end-rule"],
    sourceBookRef: "Information / availability heuristic",
    sourceAtlasRef: "Когда много информации",
    category: "Когда много информации",
    publishedAt: "2026-03-17T00:00:00.000Z"
  },
  {
    id: "confirmation-bias",
    slug: "confirmation-bias",
    sectionId: "information",
    subgroupId: "info-filter",
    sortOrder: 5,
    title: "Искажение подтверждения",
    shortText: "Мы замечаем то, что укрепляет нашу версию мира, и почти не замечаем то, что ей мешает.",
    fullText:
      "Как только у нас появляется гипотеза, мозг начинает собирать подтверждения в ее пользу и осторожно отодвигать в сторону все неудобное. Это делает нас увереннее, но не точнее. В результате мы спорим, исследуем, выбираем источники и даже слушаем людей не ради понимания, а ради укрепления уже сложившейся позиции.",
    aiContext:
      "Объясняй, как confirmation bias влияет на споры, выбор информации и рабочие решения. Предлагай практики: искать опровержение, проверять альтернативы, отделять факт от интерпретации.",
    aiSuggestions: [
      "Как это искажение проявляется в обычной жизни?",
      "Как заметить, что я ищу только подтверждение своей версии?",
      "Как проверять гипотезу честнее?"
    ],
    atlasNodeId: "node-confirmation-bias",
    relatedSlugs: ["belief-bias", "availability-heuristic", "narrative-fallacy"],
    sourceBookRef: "Information / confirmation bias",
    sourceAtlasRef: "Когда много информации",
    category: "Когда много информации",
    publishedAt: "2026-03-17T00:00:00.000Z"
  },
  {
    id: "negativity-bias",
    slug: "negativity-bias",
    sectionId: "information",
    subgroupId: "info-signal",
    sortOrder: 6,
    title: "Негативное смещение",
    shortText: "Плохие сигналы захватывают внимание сильнее и дольше, чем хорошие или нейтральные.",
    fullText:
      "Негативные новости, риск, критика и тревожные детали получают приоритет в внимании почти автоматически. Это полезно для выживания, но в обычной жизни делает картину мира кривой: плохое кажется более важным, частым и значимым, чем есть на самом деле. Из-за этого и день, и люди, и проекты начинают ощущаться хуже, чем они есть.",
    aiContext:
      "Помогай человеку замечать перекос внимания в сторону угрозы, критики и риска. Предлагай способы вернуть баланс: отдельный учет положительных фактов, сравнение по данным и разведение сигнала и эмоциональной реакции.",
    aiSuggestions: [
      "Почему негатив так липнет к вниманию? ⚡",
      "Как видеть полную картину, не уходя в токсичный позитив?",
      "Что помогает сбалансировать день после плохой новости?"
    ],
    atlasNodeId: "node-negativity-bias",
    relatedSlugs: ["availability-heuristic", "loss-aversion", "confirmation-bias"],
    sourceBookRef: "Information / negativity bias",
    sourceAtlasRef: "Когда много информации",
    category: "Когда много информации",
    publishedAt: "2026-03-17T00:00:00.000Z"
  },
  {
    id: "narrative-fallacy",
    slug: "narrative-fallacy",
    sectionId: "meaning",
    subgroupId: "meaning-story",
    sortOrder: 7,
    title: "Ошибка нарратива",
    shortText: "Красивая история кажется правдой, даже если в ней слишком много придуманных связей.",
    fullText:
      "Мозг любит цельные объяснения: понятные причины, ясных героев, аккуратную линию событий. Но реальность чаще беспорядочнее, случайнее и противоречивее. Когда нам не хватает смысла, мы быстро достраиваем сюжет — и именно в этот момент начинаем путать чувство понятности с настоящим пониманием.",
    aiContext:
      "Разбирай, где человек подменяет сложную реальность красивой историей. Предлагай отделять данные, гипотезы и storytelling, а также проверять, не слишком ли гладко выглядит объяснение.",
    aiSuggestions: [
      "Как понять, что меня захватила красивая история?",
      "Как отличить объяснение от выдуманной причинности?",
      "Какие вопросы разрушают слишком гладкий нарратив?"
    ],
    atlasNodeId: "node-narrative-fallacy",
    relatedSlugs: ["belief-bias", "hindsight-bias", "fundamental-attribution-error"],
    sourceBookRef: "Meaning / narrative fallacy",
    sourceAtlasRef: "Когда не хватает смысла",
    category: "Когда не хватает смысла",
    publishedAt: "2026-03-17T00:00:00.000Z"
  },
  {
    id: "belief-bias",
    slug: "belief-bias",
    sectionId: "meaning",
    subgroupId: "meaning-logic",
    sortOrder: 8,
    title: "Искажение убеждений",
    shortText: "Если вывод нам нравится, аргумент кажется логичнее, чем он есть на самом деле.",
    fullText:
      "Мы оцениваем не только форму аргумента, но и то, насколько приятно звучит его вывод. Поэтому слабая логика легко проходит фильтр, если приводит к желанному итогу, и наоборот. Этот урок помогает различать: где мы действительно проверяем рассуждение, а где просто одобряем результат.",
    aiContext:
      "Показывай разницу между корректностью аргумента и симпатией к выводу. Предлагай разбирать посылки по отдельности и задавать вопрос: я согласен, потому что это логично, или потому что это мне нравится?",
    aiSuggestions: [
      "Почему приятный вывод так легко кажется логичным?",
      "Как проверять аргумент, если я уже согласен с ним?",
      "Какой тест помогает отделить логику от симпатии?"
    ],
    atlasNodeId: "node-belief-bias",
    relatedSlugs: ["confirmation-bias", "narrative-fallacy", "fundamental-attribution-error"],
    sourceBookRef: "Meaning / belief bias",
    sourceAtlasRef: "Когда не хватает смысла",
    category: "Когда не хватает смысла",
    publishedAt: "2026-03-17T00:00:00.000Z"
  },
  {
    id: "fundamental-attribution-error",
    slug: "fundamental-attribution-error",
    sectionId: "meaning",
    subgroupId: "meaning-people",
    sortOrder: 9,
    title: "Фундаментальная ошибка атрибуции",
    shortText: "Чужое поведение мы объясняем характером, а свое — обстоятельствами.",
    fullText:
      "Когда мы смотрим на других, нам кажется, что их поступки отражают их сущность. Когда смотрим на себя, гораздо легче увидеть давление контекста, усталость, стресс и обстоятельства. Из-за этого мы слишком быстро делаем выводы о людях и слишком редко замечаем, что в их поведении могло сыграть решающую роль.",
    aiContext:
      "Помогай учитывать контекст, когда пользователь судит о людях и их мотивах. Предлагай рассматривать внешние силы, невидимые ограничения и вопрос: как бы я объяснил это поведение, если бы это был я?",
    aiSuggestions: [
      "Почему мы так быстро судим о чужом характере?",
      "Как замечать контекст в поведении людей?",
      "Как не делать поспешных выводов о человеке?"
    ],
    atlasNodeId: "node-fundamental-attribution-error",
    relatedSlugs: ["belief-bias", "narrative-fallacy", "confirmation-bias"],
    sourceBookRef: "Meaning / attribution",
    sourceAtlasRef: "Когда не хватает смысла",
    category: "Когда не хватает смысла",
    publishedAt: "2026-03-17T00:00:00.000Z"
  },
  {
    id: "anchoring",
    slug: "anchoring",
    sectionId: "reaction",
    subgroupId: "reaction-anchor",
    sortOrder: 10,
    title: "Эффект якоря",
    shortText: "Первая цифра, оценка или формулировка незаметно задает рамку для всего решения.",
    fullText:
      "Мозг любит начинать оценку с первого ориентира и затем лишь немного от него смещаться. Именно поэтому стартовая цена, первый дедлайн, первое сравнение или первая реплика так сильно влияют на переговоры, ожидания и самоощущение. Якорь работает даже тогда, когда мы уверены, что остаемся рациональными.",
    aiContext:
      "Объясняй, как первый ориентир влияет на деньги, время, оценку риска и переговоры. Подсказывай техники защиты: независимая оценка до обсуждения, диапазоны вместо одной цифры, несколько альтернативных ориентиров.",
    aiSuggestions: [
      "Как якорь влияет на цену и переговоры?",
      "Как не схватить первый ориентир автоматически?",
      "Как поставить свой якорь, а не жить в чужом?"
    ],
    atlasNodeId: "node-anchoring",
    relatedSlugs: ["loss-aversion", "status-quo-bias", "default-effect"],
    sourceBookRef: "Reaction / anchoring",
    sourceAtlasRef: "Когда быстро реагируем",
    category: "Когда быстро реагируем",
    publishedAt: "2026-03-17T00:00:00.000Z"
  },
  {
    id: "loss-aversion",
    slug: "loss-aversion",
    sectionId: "reaction",
    subgroupId: "reaction-risk",
    sortOrder: 11,
    title: "Неприятие потерь",
    shortText: "Потеря ощущается сильнее, чем равноценная выгода, поэтому мы часто выбираем мнимую безопасность.",
    fullText:
      "Психологическая цена потери почти всегда ощущается сильнее радости от приобретения того же масштаба. Из-за этого мы держимся за плохие варианты, затягиваем решения и переоцениваем риски перемен. Понимание этой ловушки помогает не просто стать смелее, а честно увидеть цену бездействия.",
    aiContext:
      "Показывай, как fear of loss искажает выбор, переговоры, инвестиции, отношения и карьерные решения. Предлагай смотреть не только на риск потери, но и на цену сохранения текущего сценария.",
    aiSuggestions: [
      "Почему потери ощущаются сильнее выгоды? 😬",
      "Как отличить осторожность от ловушки потерь?",
      "Что помогает увидеть цену бездействия?"
    ],
    atlasNodeId: "node-loss-aversion",
    relatedSlugs: ["status-quo-bias", "sunk-cost", "anchoring"],
    sourceBookRef: "Reaction / loss aversion",
    sourceAtlasRef: "Когда быстро реагируем",
    category: "Когда быстро реагируем",
    publishedAt: "2026-03-17T00:00:00.000Z"
  },
  {
    id: "status-quo-bias",
    slug: "status-quo-bias",
    sectionId: "reaction",
    subgroupId: "reaction-default",
    sortOrder: 12,
    title: "Предпочтение статус-кво",
    shortText: "Текущий вариант кажется безопаснее не потому, что он лучший, а потому что он уже существует.",
    fullText:
      "Когда сценарий уже запущен, мозг автоматически считает его более нейтральным и менее рискованным. Но статус-кво — это тоже решение, у которого есть своя цена, последствия и альтернативы. Этот урок помогает увидеть, где привычное подменяет собой лучшее.",
    aiContext:
      "Показывай, как статус-кво маскируется под нейтральность. Предлагай считать цену текущего сценария, а не только цену перемен, и относиться к бездействию как к отдельному выбору.",
    aiSuggestions: [
      "Почему текущий вариант кажется самым безопасным?",
      "Как увидеть цену того, что я ничего не меняю?",
      "Как пересматривать привычные решения без хаоса?"
    ],
    atlasNodeId: "node-status-quo-bias",
    relatedSlugs: ["default-effect", "loss-aversion", "sunk-cost"],
    sourceBookRef: "Reaction / status quo bias",
    sourceAtlasRef: "Когда быстро реагируем",
    category: "Когда быстро реагируем",
    publishedAt: "2026-03-17T00:00:00.000Z"
  },
  {
    id: "sunk-cost",
    slug: "sunk-cost",
    sectionId: "reaction",
    subgroupId: "reaction-risk",
    sortOrder: 13,
    title: "Ошибка невозвратных затрат",
    shortText: "Мы продолжаем вкладываться в плохой сценарий, потому что уже слишком много туда вложили.",
    fullText:
      "Чем больше времени, денег, сил или надежд уже вложено, тем тяжелее признать, что маршрут стоит пересмотреть. Но прошлые вложения нельзя вернуть, а новые часто лишь увеличивают ущерб. Понимание sunk cost помогает принимать решения от будущего, а не из чувства, что прошлое надо оправдать любой ценой.",
    aiContext:
      "Объясняй, как sunk cost держит человека в невыгодных отношениях, проектах, подписках и бизнес-решениях. Предлагай мысленный прием: как бы я выбирал, если бы начинал с нуля сегодня?",
    aiSuggestions: [
      "Как понять, что я застрял в sunk cost?",
      "Как принять решение, если уже слишком много вложено?",
      "Что помогает выйти без чувства поражения?"
    ],
    atlasNodeId: "node-sunk-cost",
    relatedSlugs: ["loss-aversion", "status-quo-bias", "default-effect"],
    sourceBookRef: "Reaction / sunk cost",
    sourceAtlasRef: "Когда быстро реагируем",
    category: "Когда быстро реагируем",
    publishedAt: "2026-03-17T00:00:00.000Z"
  },
  {
    id: "default-effect",
    slug: "default-effect",
    sectionId: "reaction",
    subgroupId: "reaction-default",
    sortOrder: 14,
    title: "Эффект варианта по умолчанию",
    shortText: "То, что выбрано заранее, незаметно решает за нас сильнее, чем нам кажется.",
    fullText:
      "Дефолтные настройки и заранее выбранные опции экономят усилия, а вместе с ними забирают осознанность. Мы часто оставляем то, что уже проставлено, просто потому что так проще, быстрее и спокойнее. Это и делает default effect таким сильным в финансах, интерфейсах, подписках и повседневных решениях.",
    aiContext:
      "Разбирай, как default effect влияет на личные решения, интерфейсы, подписки и выбор на автопилоте. Подсказывай, как замечать дефолты и как использовать их этично в собственных продуктах.",
    aiSuggestions: [
      "Почему дефолт так сильно управляет выбором?",
      "Как не принимать решения на автопилоте?",
      "Как использовать дефолты этично в продукте?"
    ],
    atlasNodeId: "node-default-effect",
    relatedSlugs: ["status-quo-bias", "anchoring", "loss-aversion"],
    sourceBookRef: "Reaction / default effect",
    sourceAtlasRef: "Когда быстро реагируем",
    category: "Когда быстро реагируем",
    publishedAt: "2026-03-17T00:00:00.000Z"
  }
];

export const atlasNodes: AtlasNode[] = lessons.map((lesson, index) => {
  const section = sections.find((item) => item.id === lesson.sectionId);

  return {
    id: lesson.atlasNodeId,
    slug: lesson.slug,
    title: lesson.title,
    sectionId: lesson.sectionId,
    subgroupId: lesson.subgroupId,
    colorToken: section?.colorToken || "soft-blue",
    lessonId: lesson.id,
    shortText: lesson.shortText,
    ringOrder: index + 1
  };
});

export const atlasEdges: AtlasEdge[] = lessons.flatMap((lesson) =>
  lesson.relatedSlugs.map((relatedSlug, relatedIndex) => {
    const relatedLesson = lessons.find((candidate) => candidate.slug === relatedSlug);

    if (!relatedLesson) {
      return null;
    }

    return {
      id: `edge-${lesson.slug}-${relatedSlug}-${relatedIndex}`,
      fromNodeId: lesson.atlasNodeId,
      toNodeId: relatedLesson.atlasNodeId,
      relationType: "related",
      relationLabel: "связано",
      weight: 1
    };
  })
).filter((edge): edge is AtlasEdge => Boolean(edge));

export const products: Product[] = [
  {
    id: "product-quiz-pack",
    sku: "quiz_pack_full_access",
    title: "Quiz Pack: практика, сценарии и самопроверка",
    description:
      "Разовый доступ к квизам и сценариям, которые учат замечать когнитивные искажения в работе, отношениях, переговорах и повседневных решениях.",
    type: "quiz_pack",
    priceXtr: 490,
    isActive: true
  }
];

export const quizzes: Quiz[] = [
  {
    id: "quiz-judgment",
    slug: "judgment-lab",
    title: "Judgment Lab",
    sectionId: "meaning",
    description: "Практический квиз на распознавание искажений в аргументах, объяснениях, оценке людей и выводах.",
    productSku: "quiz_pack_full_access",
    sortOrder: 1,
    isPublicPreview: true,
    teaser: "Открыт только preview. Полный разбор, все вопросы и сценарии доступны после покупки quiz pack.",
    questions: [
      {
        id: "q1",
        questionText: "Команда после запуска говорит: «Так и было понятно с самого начала». Какое искажение тут сработало?",
        options: [
          "Эффект варианта по умолчанию",
          "Эффект знания задним числом",
          "Розовая ретроспекция",
          "Эффект якоря"
        ],
        correctAnswer: 1,
        explanation: "Когда результат уже известен, мозг переписывает прошлое так, будто все было очевидно заранее.",
        lessonId: "hindsight-bias"
      },
      {
        id: "q2",
        questionText: "Человек видит одну яркую историю и начинает считать, что это происходит постоянно. Что это?",
        options: [
          "Искажение подтверждения",
          "Эвристика доступности",
          "Ошибка нарратива",
          "Фундаментальная ошибка атрибуции"
        ],
        correctAnswer: 1,
        explanation: "Легкость вспоминания подменяет собой реальную вероятность или частоту явления.",
        lessonId: "availability-heuristic"
      },
      {
        id: "q3",
        questionText: "После спорного разговора человек продолжает искать только те факты, которые подтверждают его версию. Что это?",
        options: [
          "Искажение подтверждения",
          "Неприятие потерь",
          "Предпочтение статус-кво",
          "Розовая ретроспекция"
        ],
        correctAnswer: 0,
        explanation: "Мозг отфильтровывает неудобное и укрепляет уже выбранную гипотезу.",
        lessonId: "confirmation-bias"
      }
    ]
  }
];

export const atlasGraph: AtlasGraph = {
  sections,
  nodes: atlasNodes,
  edges: atlasEdges
};

export function getLessonBySlug(slug: string) {
  return lessons.find((lesson) => lesson.slug === slug);
}

export function getSectionById(sectionId: string) {
  return sections.find((section) => section.id === sectionId);
}

export function getNodeBySlug(slug: string) {
  return atlasNodes.find((node) => node.slug === slug);
}

export function getNodeById(id: string) {
  return atlasNodes.find((node) => node.id === id);
}

export function getRelatedLessons(slug: string) {
  const lesson = getLessonBySlug(slug);

  if (!lesson) {
    return [];
  }

  return lesson.relatedSlugs
    .map((relatedSlug) => getLessonBySlug(relatedSlug))
    .filter((candidate): candidate is Lesson => Boolean(candidate));
}

export function getQuizBySlug(slug: string) {
  return quizzes.find((quiz) => quiz.slug === slug);
}

export function getProductBySku(sku: string) {
  return products.find((product) => product.sku === sku);
}
