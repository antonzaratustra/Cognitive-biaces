-- Generated from data/course-data.ts
-- Run this in Supabase SQL Editor after the base schema migration.

begin;

insert into public.cb_sections (id, slug, title, description, sort_order)
values
  ('memory', 'memory', 'Когда запоминаем и вспоминаем', 'Прошлое не хранится как архив. Мозг редактирует его, усиливает яркое и склеивает опыт в удобную историю.', 1),
  ('information', 'information', 'Когда много информации', 'Когда сигналов слишком много, мозг экономит силы: цепляется за знакомое, яркое и то, что уже звучало раньше.', 2),
  ('meaning', 'meaning', 'Когда не хватает смысла', 'Если реальность слишком сложная, мозг быстро достраивает причины, намерения и красивый нарратив.', 3),
  ('reaction', 'reaction', 'Когда быстро реагируем', 'В быстрых решениях мозг выбирает не лучшее, а самое знакомое, безопасное или уже начатое.', 4)
on conflict (id) do update set
  slug = excluded.slug,
  title = excluded.title,
  description = excluded.description,
  sort_order = excluded.sort_order;

insert into public.cb_lessons (id, slug, section_id, sort_order, title, short_text, full_text, ai_context, ai_suggestions_json, image_url, atlas_node_id, related_slugs, source_book_ref, source_atlas_ref, category, published_at)
values
  ('hindsight-bias', 'hindsight-bias', 'memory', 1, 'Эффект знания задним числом', 'После события кажется, что мы все понимали заранее, хотя в моменте будущее было туманным.', 'Когда результат уже известен, мозг сжимает неопределенность и переписывает прошлое так, будто исход был очевидным. Из-за этого мы хуже учимся на опыте, слишком уверенно оцениваем свои прогнозы и слишком жестко судим чужие решения. Этот урок помогает вернуть в память реальную сложность момента и отличать знания после события от знаний до него.', 'Объясняй, почему hindsight bias делает ретроспективы нечестными, а прошлое — слишком понятным. Предлагай практики: фиксировать прогнозы заранее, отделять исходные данные от итогов и сохранять контекст неопределенности.', '["Почему после события все кажется очевидным? 🤔","Как делать честные ретроспективы без самообмана?","Как фиксировать прогнозы, чтобы реально учиться?"]'::jsonb, null, 'node-hindsight-bias', '["peak-end-rule","rosy-retrospection","narrative-fallacy"]'::jsonb, 'Memory / hindsight bias', 'Когда запоминаем и вспоминаем', 'Когда запоминаем и вспоминаем', '2026-03-17T00:00:00.000Z'),
  ('peak-end-rule', 'peak-end-rule', 'memory', 2, 'Правило пика и финала', 'Мы запоминаем не весь опыт, а его самый сильный момент и концовку.', 'Большая часть опыта исчезает в фоне, а в памяти остаются пик эмоции и финальный штрих. Поэтому поездка, разговор, презентация или даже день могут оцениваться совсем не так, как проживались на самом деле. Понимание этого искажения помогает не только точнее вспоминать, но и лучше проектировать свои собственные продукты, встречи и ритуалы.', 'Показывай, как peak-end rule влияет на оценку опыта, сервиса, отношений и самоощущения. Подсказывай, как проектировать сильные завершения и не переоценивать весь путь по одному эпизоду.', '["Почему один яркий момент перекрашивает весь опыт?","Как это влияет на сервис, отношения и впечатления?","Что важно помнить, когда оцениваешь прошлый день или проект?"]'::jsonb, null, 'node-peak-end-rule', '["hindsight-bias","rosy-retrospection","availability-heuristic"]'::jsonb, 'Memory / peak-end rule', 'Когда запоминаем и вспоминаем', 'Когда запоминаем и вспоминаем', '2026-03-17T00:00:00.000Z'),
  ('rosy-retrospection', 'rosy-retrospection', 'memory', 3, 'Розовая ретроспекция', 'Через время прошлое начинает казаться приятнее и ровнее, чем было в реальности.', 'Мозг умеет смягчать шероховатости и оставлять в памяти более теплую версию прошлого. Поэтому старые проекты, отношения, места и даже тяжелые периоды иногда кажутся почти золотым временем. Это делает нас уязвимыми к повторению неудачных сценариев и мешает трезво сравнивать прошлое с настоящим.', 'Объясняй, как мозг романтизирует прошлое, сглаживает негатив и делает старые варианты привлекательнее текущих. Предлагай сравнение по фактам, а не по настроению воспоминания.', '["Почему прошлое часто кажется лучше настоящего? ✨","Как не романтизировать старые решения и отношения?","Как сравнивать прошлое и настоящее по фактам?"]'::jsonb, null, 'node-rosy-retrospection', '["peak-end-rule","status-quo-bias","hindsight-bias"]'::jsonb, 'Memory / rosy retrospection', 'Когда запоминаем и вспоминаем', 'Когда запоминаем и вспоминаем', '2026-03-17T00:00:00.000Z'),
  ('availability-heuristic', 'availability-heuristic', 'information', 4, 'Эвристика доступности', 'Чем легче вспоминается пример, тем вероятнее и важнее он нам кажется.', 'Если событие яркое, недавнее или эмоционально заряженное, мозг быстро подсовывает его как доказательство того, что это и есть реальность. Поэтому мы переоцениваем заметные риски, верим в частоту редких случаев и строим выводы на запоминаемом, а не на репрезентативном. Этот урок учит возвращаться от впечатления к выборке.', 'Помогай распознавать момент, когда человек путает запоминаемость с вероятностью. Предлагай проверять базовую частоту, объем выборки и отделять яркость события от его реальной распространенности.', '["Почему яркие примеры так сильно влияют на меня?","Как не путать запоминаемость и вероятность?","Какой быстрый вопрос помогает остановиться?"]'::jsonb, null, 'node-availability-heuristic', '["confirmation-bias","negativity-bias","peak-end-rule"]'::jsonb, 'Information / availability heuristic', 'Когда много информации', 'Когда много информации', '2026-03-17T00:00:00.000Z'),
  ('confirmation-bias', 'confirmation-bias', 'information', 5, 'Искажение подтверждения', 'Мы замечаем то, что укрепляет нашу версию мира, и почти не замечаем то, что ей мешает.', 'Как только у нас появляется гипотеза, мозг начинает собирать подтверждения в ее пользу и осторожно отодвигать в сторону все неудобное. Это делает нас увереннее, но не точнее. В результате мы спорим, исследуем, выбираем источники и даже слушаем людей не ради понимания, а ради укрепления уже сложившейся позиции.', 'Объясняй, как confirmation bias влияет на споры, выбор информации и рабочие решения. Предлагай практики: искать опровержение, проверять альтернативы, отделять факт от интерпретации.', '["Как это искажение проявляется в обычной жизни?","Как заметить, что я ищу только подтверждение своей версии?","Как проверять гипотезу честнее?"]'::jsonb, null, 'node-confirmation-bias', '["belief-bias","availability-heuristic","narrative-fallacy"]'::jsonb, 'Information / confirmation bias', 'Когда много информации', 'Когда много информации', '2026-03-17T00:00:00.000Z'),
  ('negativity-bias', 'negativity-bias', 'information', 6, 'Негативное смещение', 'Плохие сигналы захватывают внимание сильнее и дольше, чем хорошие или нейтральные.', 'Негативные новости, риск, критика и тревожные детали получают приоритет в внимании почти автоматически. Это полезно для выживания, но в обычной жизни делает картину мира кривой: плохое кажется более важным, частым и значимым, чем есть на самом деле. Из-за этого и день, и люди, и проекты начинают ощущаться хуже, чем они есть.', 'Помогай человеку замечать перекос внимания в сторону угрозы, критики и риска. Предлагай способы вернуть баланс: отдельный учет положительных фактов, сравнение по данным и разведение сигнала и эмоциональной реакции.', '["Почему негатив так липнет к вниманию? ⚡","Как видеть полную картину, не уходя в токсичный позитив?","Что помогает сбалансировать день после плохой новости?"]'::jsonb, null, 'node-negativity-bias', '["availability-heuristic","loss-aversion","confirmation-bias"]'::jsonb, 'Information / negativity bias', 'Когда много информации', 'Когда много информации', '2026-03-17T00:00:00.000Z'),
  ('narrative-fallacy', 'narrative-fallacy', 'meaning', 7, 'Ошибка нарратива', 'Красивая история кажется правдой, даже если в ней слишком много придуманных связей.', 'Мозг любит цельные объяснения: понятные причины, ясных героев, аккуратную линию событий. Но реальность чаще беспорядочнее, случайнее и противоречивее. Когда нам не хватает смысла, мы быстро достраиваем сюжет — и именно в этот момент начинаем путать чувство понятности с настоящим пониманием.', 'Разбирай, где человек подменяет сложную реальность красивой историей. Предлагай отделять данные, гипотезы и storytelling, а также проверять, не слишком ли гладко выглядит объяснение.', '["Как понять, что меня захватила красивая история?","Как отличить объяснение от выдуманной причинности?","Какие вопросы разрушают слишком гладкий нарратив?"]'::jsonb, null, 'node-narrative-fallacy', '["belief-bias","hindsight-bias","fundamental-attribution-error"]'::jsonb, 'Meaning / narrative fallacy', 'Когда не хватает смысла', 'Когда не хватает смысла', '2026-03-17T00:00:00.000Z'),
  ('belief-bias', 'belief-bias', 'meaning', 8, 'Искажение убеждений', 'Если вывод нам нравится, аргумент кажется логичнее, чем он есть на самом деле.', 'Мы оцениваем не только форму аргумента, но и то, насколько приятно звучит его вывод. Поэтому слабая логика легко проходит фильтр, если приводит к желанному итогу, и наоборот. Этот урок помогает различать: где мы действительно проверяем рассуждение, а где просто одобряем результат.', 'Показывай разницу между корректностью аргумента и симпатией к выводу. Предлагай разбирать посылки по отдельности и задавать вопрос: я согласен, потому что это логично, или потому что это мне нравится?', '["Почему приятный вывод так легко кажется логичным?","Как проверять аргумент, если я уже согласен с ним?","Какой тест помогает отделить логику от симпатии?"]'::jsonb, null, 'node-belief-bias', '["confirmation-bias","narrative-fallacy","fundamental-attribution-error"]'::jsonb, 'Meaning / belief bias', 'Когда не хватает смысла', 'Когда не хватает смысла', '2026-03-17T00:00:00.000Z'),
  ('fundamental-attribution-error', 'fundamental-attribution-error', 'meaning', 9, 'Фундаментальная ошибка атрибуции', 'Чужое поведение мы объясняем характером, а свое — обстоятельствами.', 'Когда мы смотрим на других, нам кажется, что их поступки отражают их сущность. Когда смотрим на себя, гораздо легче увидеть давление контекста, усталость, стресс и обстоятельства. Из-за этого мы слишком быстро делаем выводы о людях и слишком редко замечаем, что в их поведении могло сыграть решающую роль.', 'Помогай учитывать контекст, когда пользователь судит о людях и их мотивах. Предлагай рассматривать внешние силы, невидимые ограничения и вопрос: как бы я объяснил это поведение, если бы это был я?', '["Почему мы так быстро судим о чужом характере?","Как замечать контекст в поведении людей?","Как не делать поспешных выводов о человеке?"]'::jsonb, null, 'node-fundamental-attribution-error', '["belief-bias","narrative-fallacy","confirmation-bias"]'::jsonb, 'Meaning / attribution', 'Когда не хватает смысла', 'Когда не хватает смысла', '2026-03-17T00:00:00.000Z'),
  ('anchoring', 'anchoring', 'reaction', 10, 'Эффект якоря', 'Первая цифра, оценка или формулировка незаметно задает рамку для всего решения.', 'Мозг любит начинать оценку с первого ориентира и затем лишь немного от него смещаться. Именно поэтому стартовая цена, первый дедлайн, первое сравнение или первая реплика так сильно влияют на переговоры, ожидания и самоощущение. Якорь работает даже тогда, когда мы уверены, что остаемся рациональными.', 'Объясняй, как первый ориентир влияет на деньги, время, оценку риска и переговоры. Подсказывай техники защиты: независимая оценка до обсуждения, диапазоны вместо одной цифры, несколько альтернативных ориентиров.', '["Как якорь влияет на цену и переговоры?","Как не схватить первый ориентир автоматически?","Как поставить свой якорь, а не жить в чужом?"]'::jsonb, null, 'node-anchoring', '["loss-aversion","status-quo-bias","default-effect"]'::jsonb, 'Reaction / anchoring', 'Когда быстро реагируем', 'Когда быстро реагируем', '2026-03-17T00:00:00.000Z'),
  ('loss-aversion', 'loss-aversion', 'reaction', 11, 'Неприятие потерь', 'Потеря ощущается сильнее, чем равноценная выгода, поэтому мы часто выбираем мнимую безопасность.', 'Психологическая цена потери почти всегда ощущается сильнее радости от приобретения того же масштаба. Из-за этого мы держимся за плохие варианты, затягиваем решения и переоцениваем риски перемен. Понимание этой ловушки помогает не просто стать смелее, а честно увидеть цену бездействия.', 'Показывай, как fear of loss искажает выбор, переговоры, инвестиции, отношения и карьерные решения. Предлагай смотреть не только на риск потери, но и на цену сохранения текущего сценария.', '["Почему потери ощущаются сильнее выгоды? 😬","Как отличить осторожность от ловушки потерь?","Что помогает увидеть цену бездействия?"]'::jsonb, null, 'node-loss-aversion', '["status-quo-bias","sunk-cost","anchoring"]'::jsonb, 'Reaction / loss aversion', 'Когда быстро реагируем', 'Когда быстро реагируем', '2026-03-17T00:00:00.000Z'),
  ('status-quo-bias', 'status-quo-bias', 'reaction', 12, 'Предпочтение статус-кво', 'Текущий вариант кажется безопаснее не потому, что он лучший, а потому что он уже существует.', 'Когда сценарий уже запущен, мозг автоматически считает его более нейтральным и менее рискованным. Но статус-кво — это тоже решение, у которого есть своя цена, последствия и альтернативы. Этот урок помогает увидеть, где привычное подменяет собой лучшее.', 'Показывай, как статус-кво маскируется под нейтральность. Предлагай считать цену текущего сценария, а не только цену перемен, и относиться к бездействию как к отдельному выбору.', '["Почему текущий вариант кажется самым безопасным?","Как увидеть цену того, что я ничего не меняю?","Как пересматривать привычные решения без хаоса?"]'::jsonb, null, 'node-status-quo-bias', '["default-effect","loss-aversion","sunk-cost"]'::jsonb, 'Reaction / status quo bias', 'Когда быстро реагируем', 'Когда быстро реагируем', '2026-03-17T00:00:00.000Z'),
  ('sunk-cost', 'sunk-cost', 'reaction', 13, 'Ошибка невозвратных затрат', 'Мы продолжаем вкладываться в плохой сценарий, потому что уже слишком много туда вложили.', 'Чем больше времени, денег, сил или надежд уже вложено, тем тяжелее признать, что маршрут стоит пересмотреть. Но прошлые вложения нельзя вернуть, а новые часто лишь увеличивают ущерб. Понимание sunk cost помогает принимать решения от будущего, а не из чувства, что прошлое надо оправдать любой ценой.', 'Объясняй, как sunk cost держит человека в невыгодных отношениях, проектах, подписках и бизнес-решениях. Предлагай мысленный прием: как бы я выбирал, если бы начинал с нуля сегодня?', '["Как понять, что я застрял в sunk cost?","Как принять решение, если уже слишком много вложено?","Что помогает выйти без чувства поражения?"]'::jsonb, null, 'node-sunk-cost', '["loss-aversion","status-quo-bias","default-effect"]'::jsonb, 'Reaction / sunk cost', 'Когда быстро реагируем', 'Когда быстро реагируем', '2026-03-17T00:00:00.000Z'),
  ('default-effect', 'default-effect', 'reaction', 14, 'Эффект варианта по умолчанию', 'То, что выбрано заранее, незаметно решает за нас сильнее, чем нам кажется.', 'Дефолтные настройки и заранее выбранные опции экономят усилия, а вместе с ними забирают осознанность. Мы часто оставляем то, что уже проставлено, просто потому что так проще, быстрее и спокойнее. Это и делает default effect таким сильным в финансах, интерфейсах, подписках и повседневных решениях.', 'Разбирай, как default effect влияет на личные решения, интерфейсы, подписки и выбор на автопилоте. Подсказывай, как замечать дефолты и как использовать их этично в собственных продуктах.', '["Почему дефолт так сильно управляет выбором?","Как не принимать решения на автопилоте?","Как использовать дефолты этично в продукте?"]'::jsonb, null, 'node-default-effect', '["status-quo-bias","anchoring","loss-aversion"]'::jsonb, 'Reaction / default effect', 'Когда быстро реагируем', 'Когда быстро реагируем', '2026-03-17T00:00:00.000Z')
on conflict (id) do update set
  slug = excluded.slug,
  section_id = excluded.section_id,
  sort_order = excluded.sort_order,
  title = excluded.title,
  short_text = excluded.short_text,
  full_text = excluded.full_text,
  ai_context = excluded.ai_context,
  ai_suggestions_json = excluded.ai_suggestions_json,
  image_url = excluded.image_url,
  atlas_node_id = excluded.atlas_node_id,
  related_slugs = excluded.related_slugs,
  source_book_ref = excluded.source_book_ref,
  source_atlas_ref = excluded.source_atlas_ref,
  category = excluded.category,
  published_at = excluded.published_at;

insert into public.cb_atlas_nodes (id, slug, title, category, x, y, size, color_token, lesson_id, short_text)
values
  ('node-hindsight-bias', 'hindsight-bias', 'Эффект знания задним числом', 'Когда запоминаем и вспоминаем', -294.4486, -170, 1, 'soft-yellow', 'hindsight-bias', 'После события кажется, что мы все понимали заранее, хотя в моменте будущее было туманным.'),
  ('node-peak-end-rule', 'peak-end-rule', 'Правило пика и финала', 'Когда запоминаем и вспоминаем', -48.8168, -370.8004, 1.08, 'soft-yellow', 'peak-end-rule', 'Мы запоминаем не весь опыт, а его самый сильный момент и концовку.'),
  ('node-rosy-retrospection', 'rosy-retrospection', 'Розовая ретроспекция', 'Когда запоминаем и вспоминаем', 288.4996, -288.4996, 1.16, 'soft-yellow', 'rosy-retrospection', 'Через время прошлое начинает казаться приятнее и ровнее, чем было в реальности.'),
  ('node-availability-heuristic', 'availability-heuristic', 'Эвристика доступности', 'Когда много информации', 260.4551, -218.5478, 1, 'soft-blue', 'availability-heuristic', 'Чем легче вспоминается пример, тем вероятнее и важнее он нам кажется.'),
  ('node-confirmation-bias', 'confirmation-bias', 'Искажение подтверждения', 'Когда много информации', 373.644, -16.3137, 1.08, 'soft-blue', 'confirmation-bias', 'Мы замечаем то, что укрепляет нашу версию мира, и почти не замечаем то, что ей мешает.'),
  ('node-negativity-bias', 'negativity-bias', 'Негативное смещение', 'Когда много информации', 334.214, 234.0192, 1.16, 'soft-blue', 'negativity-bias', 'Плохие сигналы захватывают внимание сильнее и дольше, чем хорошие или нейтральные.'),
  ('node-narrative-fallacy', 'narrative-fallacy', 'Ошибка нарратива', 'Когда не хватает смысла', 240.4163, 240.4163, 1, 'soft-red', 'narrative-fallacy', 'Красивая история кажется правдой, даже если в ней слишком много придуманных связей.'),
  ('node-belief-bias', 'belief-bias', 'Искажение убеждений', 'Когда не хватает смысла', -16.3137, 373.644, 1.08, 'soft-red', 'belief-bias', 'Если вывод нам нравится, аргумент кажется логичнее, чем он есть на самом деле.'),
  ('node-fundamental-attribution-error', 'fundamental-attribution-error', 'Фундаментальная ошибка атрибуции', 'Когда не хватает смысла', -312.5461, 262.2573, 1.16, 'soft-red', 'fundamental-attribution-error', 'Чужое поведение мы объясняем характером, а свое — обстоятельствами.'),
  ('node-anchoring', 'anchoring', 'Эффект якоря', 'Когда быстро реагируем', -278.5117, 195.016, 1, 'soft-green', 'anchoring', 'Первая цифра, оценка или формулировка незаметно задает рамку для всего решения.'),
  ('node-loss-aversion', 'loss-aversion', 'Неприятие потерь', 'Когда быстро реагируем', -359.0586, 104.6561, 1.08, 'soft-green', 'loss-aversion', 'Потеря ощущается сильнее, чем равноценная выгода, поэтому мы часто выбираем мнимую безопасность.'),
  ('node-status-quo-bias', 'status-quo-bias', 'Предпочтение статус-кво', 'Когда быстро реагируем', -407.6117, -17.7967, 1.16, 'soft-green', 'status-quo-bias', 'Текущий вариант кажется безопаснее не потому, что он лучший, а потому что он уже существует.'),
  ('node-sunk-cost', 'sunk-cost', 'Ошибка невозвратных затрат', 'Когда быстро реагируем', -316.8827, -123.2289, 1.24, 'soft-green', 'sunk-cost', 'Мы продолжаем вкладываться в плохой сценарий, потому что уже слишком много туда вложили.'),
  ('node-default-effect', 'default-effect', 'Эффект варианта по умолчанию', 'Когда быстро реагируем', -286.5006, -240.4026, 1, 'soft-green', 'default-effect', 'То, что выбрано заранее, незаметно решает за нас сильнее, чем нам кажется.')
on conflict (id) do update set
  slug = excluded.slug,
  title = excluded.title,
  category = excluded.category,
  x = excluded.x,
  y = excluded.y,
  size = excluded.size,
  color_token = excluded.color_token,
  lesson_id = excluded.lesson_id,
  short_text = excluded.short_text;

insert into public.cb_atlas_edges (id, from_node_id, to_node_id, relation_type, relation_label, weight)
values
  ('edge-hindsight-bias-peak-end-rule-0', 'node-hindsight-bias', 'node-peak-end-rule', 'related', 'связано', 1),
  ('edge-hindsight-bias-rosy-retrospection-1', 'node-hindsight-bias', 'node-rosy-retrospection', 'related', 'связано', 1),
  ('edge-hindsight-bias-narrative-fallacy-2', 'node-hindsight-bias', 'node-narrative-fallacy', 'related', 'связано', 1),
  ('edge-peak-end-rule-hindsight-bias-0', 'node-peak-end-rule', 'node-hindsight-bias', 'related', 'связано', 1),
  ('edge-peak-end-rule-rosy-retrospection-1', 'node-peak-end-rule', 'node-rosy-retrospection', 'related', 'связано', 1),
  ('edge-peak-end-rule-availability-heuristic-2', 'node-peak-end-rule', 'node-availability-heuristic', 'related', 'связано', 1),
  ('edge-rosy-retrospection-peak-end-rule-0', 'node-rosy-retrospection', 'node-peak-end-rule', 'related', 'связано', 1),
  ('edge-rosy-retrospection-status-quo-bias-1', 'node-rosy-retrospection', 'node-status-quo-bias', 'related', 'связано', 1),
  ('edge-rosy-retrospection-hindsight-bias-2', 'node-rosy-retrospection', 'node-hindsight-bias', 'related', 'связано', 1),
  ('edge-availability-heuristic-confirmation-bias-0', 'node-availability-heuristic', 'node-confirmation-bias', 'related', 'связано', 1),
  ('edge-availability-heuristic-negativity-bias-1', 'node-availability-heuristic', 'node-negativity-bias', 'related', 'связано', 1),
  ('edge-availability-heuristic-peak-end-rule-2', 'node-availability-heuristic', 'node-peak-end-rule', 'related', 'связано', 1),
  ('edge-confirmation-bias-belief-bias-0', 'node-confirmation-bias', 'node-belief-bias', 'related', 'связано', 1),
  ('edge-confirmation-bias-availability-heuristic-1', 'node-confirmation-bias', 'node-availability-heuristic', 'related', 'связано', 1),
  ('edge-confirmation-bias-narrative-fallacy-2', 'node-confirmation-bias', 'node-narrative-fallacy', 'related', 'связано', 1),
  ('edge-negativity-bias-availability-heuristic-0', 'node-negativity-bias', 'node-availability-heuristic', 'related', 'связано', 1),
  ('edge-negativity-bias-loss-aversion-1', 'node-negativity-bias', 'node-loss-aversion', 'related', 'связано', 1),
  ('edge-negativity-bias-confirmation-bias-2', 'node-negativity-bias', 'node-confirmation-bias', 'related', 'связано', 1),
  ('edge-narrative-fallacy-belief-bias-0', 'node-narrative-fallacy', 'node-belief-bias', 'related', 'связано', 1),
  ('edge-narrative-fallacy-hindsight-bias-1', 'node-narrative-fallacy', 'node-hindsight-bias', 'related', 'связано', 1),
  ('edge-narrative-fallacy-fundamental-attribution-error-2', 'node-narrative-fallacy', 'node-fundamental-attribution-error', 'related', 'связано', 1),
  ('edge-belief-bias-confirmation-bias-0', 'node-belief-bias', 'node-confirmation-bias', 'related', 'связано', 1),
  ('edge-belief-bias-narrative-fallacy-1', 'node-belief-bias', 'node-narrative-fallacy', 'related', 'связано', 1),
  ('edge-belief-bias-fundamental-attribution-error-2', 'node-belief-bias', 'node-fundamental-attribution-error', 'related', 'связано', 1),
  ('edge-fundamental-attribution-error-belief-bias-0', 'node-fundamental-attribution-error', 'node-belief-bias', 'related', 'связано', 1),
  ('edge-fundamental-attribution-error-narrative-fallacy-1', 'node-fundamental-attribution-error', 'node-narrative-fallacy', 'related', 'связано', 1),
  ('edge-fundamental-attribution-error-confirmation-bias-2', 'node-fundamental-attribution-error', 'node-confirmation-bias', 'related', 'связано', 1),
  ('edge-anchoring-loss-aversion-0', 'node-anchoring', 'node-loss-aversion', 'related', 'связано', 1),
  ('edge-anchoring-status-quo-bias-1', 'node-anchoring', 'node-status-quo-bias', 'related', 'связано', 1),
  ('edge-anchoring-default-effect-2', 'node-anchoring', 'node-default-effect', 'related', 'связано', 1),
  ('edge-loss-aversion-status-quo-bias-0', 'node-loss-aversion', 'node-status-quo-bias', 'related', 'связано', 1),
  ('edge-loss-aversion-sunk-cost-1', 'node-loss-aversion', 'node-sunk-cost', 'related', 'связано', 1),
  ('edge-loss-aversion-anchoring-2', 'node-loss-aversion', 'node-anchoring', 'related', 'связано', 1),
  ('edge-status-quo-bias-default-effect-0', 'node-status-quo-bias', 'node-default-effect', 'related', 'связано', 1),
  ('edge-status-quo-bias-loss-aversion-1', 'node-status-quo-bias', 'node-loss-aversion', 'related', 'связано', 1),
  ('edge-status-quo-bias-sunk-cost-2', 'node-status-quo-bias', 'node-sunk-cost', 'related', 'связано', 1),
  ('edge-sunk-cost-loss-aversion-0', 'node-sunk-cost', 'node-loss-aversion', 'related', 'связано', 1),
  ('edge-sunk-cost-status-quo-bias-1', 'node-sunk-cost', 'node-status-quo-bias', 'related', 'связано', 1),
  ('edge-sunk-cost-default-effect-2', 'node-sunk-cost', 'node-default-effect', 'related', 'связано', 1),
  ('edge-default-effect-status-quo-bias-0', 'node-default-effect', 'node-status-quo-bias', 'related', 'связано', 1),
  ('edge-default-effect-anchoring-1', 'node-default-effect', 'node-anchoring', 'related', 'связано', 1),
  ('edge-default-effect-loss-aversion-2', 'node-default-effect', 'node-loss-aversion', 'related', 'связано', 1)
on conflict (id) do update set
  from_node_id = excluded.from_node_id,
  to_node_id = excluded.to_node_id,
  relation_type = excluded.relation_type,
  relation_label = excluded.relation_label,
  weight = excluded.weight;

insert into public.cb_products (sku, title, description, type, price_xtr, is_active)
values
  ('quiz_pack_full_access', 'Quiz Pack: практика, сценарии и самопроверка', 'Разовый доступ к квизам и сценариям, которые учат замечать когнитивные искажения в работе, отношениях, переговорах и повседневных решениях.', 'quiz_pack', 490, true)
on conflict (sku) do update set
  title = excluded.title,
  description = excluded.description,
  type = excluded.type,
  price_xtr = excluded.price_xtr,
  is_active = excluded.is_active;

with upserted_quiz as (
  insert into public.cb_quizzes (slug, title, section_id, description, product_sku, sort_order, is_public_preview, teaser)
  values ('judgment-lab', 'Judgment Lab', 'meaning', 'Практический квиз на распознавание искажений в аргументах, объяснениях, оценке людей и выводах.', 'quiz_pack_full_access', 1, true, 'Открыт только preview. Полный разбор, все вопросы и сценарии доступны после покупки quiz pack.')
  on conflict (slug) do update set
    title = excluded.title,
    section_id = excluded.section_id,
    description = excluded.description,
    product_sku = excluded.product_sku,
    sort_order = excluded.sort_order,
    is_public_preview = excluded.is_public_preview,
    teaser = excluded.teaser
  returning id
), deleted as (
  delete from public.cb_quiz_questions where quiz_id in (select id from public.cb_quizzes where slug = 'judgment-lab')
)
insert into public.cb_quiz_questions (quiz_id, question_text, question_type, options_json, correct_answer_json, explanation, lesson_id, sort_order)
values
  ((select id from upserted_quiz limit 1), 'Команда после запуска говорит: «Так и было понятно с самого начала». Какое искажение тут сработало?', 'single_choice', '["Эффект варианта по умолчанию","Эффект знания задним числом","Розовая ретроспекция","Эффект якоря"]'::jsonb, '{"correctIndex":1}'::jsonb, 'Когда результат уже известен, мозг переписывает прошлое так, будто все было очевидно заранее.', 'hindsight-bias', 1),
  ((select id from upserted_quiz limit 1), 'Человек видит одну яркую историю и начинает считать, что это происходит постоянно. Что это?', 'single_choice', '["Искажение подтверждения","Эвристика доступности","Ошибка нарратива","Фундаментальная ошибка атрибуции"]'::jsonb, '{"correctIndex":1}'::jsonb, 'Легкость вспоминания подменяет собой реальную вероятность или частоту явления.', 'availability-heuristic', 2),
  ((select id from upserted_quiz limit 1), 'После спорного разговора человек продолжает искать только те факты, которые подтверждают его версию. Что это?', 'single_choice', '["Искажение подтверждения","Неприятие потерь","Предпочтение статус-кво","Розовая ретроспекция"]'::jsonb, '{"correctIndex":0}'::jsonb, 'Мозг отфильтровывает неудобное и укрепляет уже выбранную гипотезу.', 'confirmation-bias', 3)
;

commit;
