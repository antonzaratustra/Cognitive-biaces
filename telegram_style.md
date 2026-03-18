# Оформление Telegram-бота: Атлас когнитивных искажений

В этом файле собраны тексты и промпты, адаптированные под дизайн-код проекта (Warm Dark, Glassmorphism, Amber Accents).

---

## 📝 Текстовое наполнение

| Элемент | Команда / Место | Текст (RU) | Текст (EN) | Лимит |
| :--- | :--- | :--- | :--- | :--- |
| **Имя (Display Name)** | `/setname` | Атлас когнитивных искажений 🧠 | Cognitive Bias Atlas 🧠 | ~64 симв. |
| **Username** | При создании | `CognitiveAtlasBot` / `BiasAtlasBot` | — | 5–32 симв. |
| **Краткое описание** | `/setdescription` | **Атлас искажений: Перестань действовать на автопилоте.** 
ери? Это твой мозг расставляет ловушки.<br><br>**С Атласом ты:**<br>1. Исследуешь 180+ искажений на живой карте.<br>2. Проживаешь «Aha!»-моменты в квизах.<br>3. Получаешь ясность там, где другие поддаются эмоциям.<br><br>Это быстрее книг и глубже Википедии. Уволь когнитивный шум и получи интеллектуальное преимущество.<br><br>👇 Нажми **Start**, чтобы увидеть карту. | **Bias Atlas: Stop living on autopilot.** 🧠<br><br>Recognize yourself? Looking only for what confirms your opinion? Making mistakes due to fear of loss? Your brain is setting traps.<br><br>**With Atlas you:**<br>1. Explore 180+ biases on a live map.<br>2. Experience "Aha!" moments in quizzes.<br>3. Gain clarity where others give in to emotions.<br><br>It's faster than books and deeper than Wikipedia. Fire the cognitive noise and gain an intellectual edge.<br><br>👇 Press **Start** to see the map. | 512 симв. |
| **О боте (About / Bio)** | `/setabouttext` | Интерактивный гид по архитектуре мышления. 🧠 Библиотека искажений, тесты и практика принятия решений. | An interactive guide to the architecture of thinking. 🧠 Bias library, tests, and decision-making practice. | 120 симв. |

---

## 🎨 Визуальные элементы (Промпты для генерации)

### 1. Аватарка (Profile Picture / Botpic)
*Стиль: Минималистичный бренд-марк с теплым свечением.*

**Prompt (DALL-E 3 / Midjourney):**
> A minimalist high-end logo for a cognitive science project. A central glowing amber sphere (#FF9B38) with a soft radial gradient, surrounded by delicate, thin golden neural connections and geometric orbits. The background is a solid deep obsidian brown (#120D09). Scientific aesthetic, glassmorphism elements, soft outer glow, 8k, vector-like precision.

### 2. Картинка описания (Description Picture)
*Стиль: Атмосферный "Атлас" в разрезе.*

**Prompt (DALL-E 3 / Midjourney):**
> A wide 16:9 cinematic shot of an interactive radial map of human thoughts. Holographic nodes in shades of amber (#FF9B38) and soft cream (#FFF4EA) float in a dark, foggy space. Elegant serif typography labels are visible. The aesthetic is "premium scientific atlas". Warm lighting, deep shadows, blurred background with a subtle grid pattern. High resolution, professional UI design.

---

## 🛠 Цветовая палитра (для справки)

При создании дополнительных материалов вручную используйте эти коды:
- **Background (Base):** `#120D09` (Глубокий темный)
- **Accent (Amber):** `#FF9B38` (Теплый оранжевый)
- **Text (Cream):** `#FFF4EA` (Мягкий белый)
- **Glass Effect:** Белый с прозрачностью `0.04` и блюром `18px`.

---

## ⚙️ Технические параметры

1.  **Avatar (`/setuserpic`):**
    *   Рекомендуется делать акцент на центральной сфере (amber dot), чтобы она хорошо считывалась в маленьком круге списка чатов.
2.  **Description Picture:**
    *   Загружается через `Edit Bot` -> `Edit Description Picture`. 
    *   Идеальный размер — 640x360 px.
