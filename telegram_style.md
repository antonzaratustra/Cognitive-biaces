# Оформление Telegram-бота: Атлас когнитивных искажений

В этом файле собраны тексты и промпты, адаптированные под дизайн-код проекта (Warm Dark, Glassmorphism, Amber Accents).

---

## 📝 Текстовое наполнение

| Элемент | Команда / Место | Текст (RU) | Текст (EN) | Лимит |
| :--- | :--- | :--- | :--- | :--- |
| **Имя (Display Name)** | `/setname` | Атлас когнитивных искажений 🧠 | Cognitive Bias Atlas 🧠 | ~64 симв. |
| **Username** | При создании | `CognitiveAtlasBot` / `BiasAtlasBot` | — | 5–32 симв. |
| **Краткое описание** | `/setdescription` | Исследуйте карту ловушек вашего разума. 180+ когнитивных искажений в интерактивном Атласе, квизы и практика критического мышления. Нажмите **Start**, чтобы открыть карту. | Explore the map of your mind's traps. 180+ cognitive biases in an interactive Atlas, quizzes, and critical thinking practice. Press **Start** to open the map. | 512 симв. |
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
