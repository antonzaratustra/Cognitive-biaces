import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = process.cwd();
const sourcePath = path.join(root, "data", "course-data.ts");
const outputPath = path.join(root, "supabase", "seeds", "20260317_demo_content.sql");

function loadSeedData() {
  const source = fs.readFileSync(sourcePath, "utf8");
  const trimmed = source
    .replace(/^import .*?;\n/m, "")
    .replace(/export const sections: Section\[] =/g, "const sections =")
    .replace(/export const lessons: Lesson\[] =/g, "const lessons =")
    .replace(/export const atlasNodes: AtlasNode\[] =/g, "const atlasNodes =")
    .replace(/export const atlasEdges: AtlasEdge\[] =/g, "const atlasEdges =")
    .replace(/export const products: Product\[] =/g, "const products =")
    .replace(/export const quizzes: Quiz\[] =/g, "const quizzes =")
    .replace(/\.filter\(\(edge\): edge is AtlasEdge => Boolean\(edge\)\);/g, ".filter((edge) => Boolean(edge));");

  const relevant = trimmed.split("export const atlasGraph")[0];
  const script = `${relevant}\nmodule.exports = { sections, lessons, atlasNodes, atlasEdges, products, quizzes };`;
  const context = { module: { exports: {} }, exports: {} };
  vm.createContext(context);
  vm.runInContext(script, context);
  return context.module.exports;
}

function sqlString(value) {
  if (value === null || value === undefined) {
    return "null";
  }
  return `'${String(value).replace(/'/g, "''")}'`;
}

function sqlBool(value) {
  return value ? "true" : "false";
}

function sqlJson(value) {
  return `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`;
}

function formatNumber(value) {
  return Number(value).toFixed(4).replace(/\.?0+$/, "");
}

function buildNodePositions(sections, lessons) {
  const sectionMap = new Map(sections.map((section) => [section.id, section]));
  const lessonGroups = new Map();

  lessons.forEach((lesson) => {
    const groupKey = lesson.sectionId;
    if (!lessonGroups.has(groupKey)) {
      lessonGroups.set(groupKey, []);
    }
    lessonGroups.get(groupKey).push(lesson);
  });

  const positions = new Map();

  lessonGroups.forEach((groupLessons, sectionId) => {
    const section = sectionMap.get(sectionId);
    if (!section) {
      return;
    }

    const count = groupLessons.length;
    const start = section.startAngle;
    const end = section.endAngle < start ? section.endAngle + 360 : section.endAngle;
    const span = end - start;

    groupLessons
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .forEach((lesson, index) => {
        const progress = count === 1 ? 0.5 : index / (count - 1);
        const angleDeg = start + span * progress;
        const angle = (angleDeg * Math.PI) / 180;
        const radius = 340 + (index % 3) * 34;
        positions.set(lesson.atlasNodeId, {
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
          size: 1 + ((index % 4) * 0.08),
          colorToken: section.colorToken,
          category: section.title
        });
      });
  });

  return positions;
}

function buildSql() {
  const { sections, lessons, atlasNodes, atlasEdges, products, quizzes } = loadSeedData();
  const nodePositions = buildNodePositions(sections, lessons);

  const lines = [];

  lines.push("-- Generated from data/course-data.ts");
  lines.push("-- Run this in Supabase SQL Editor after the base schema migration.");
  lines.push("");
  lines.push("begin;");
  lines.push("");

  lines.push("insert into public.cb_sections (id, slug, title, description, sort_order)");
  lines.push("values");
  lines.push(
    sections
      .map(
        (section) =>
          `  (${sqlString(section.id)}, ${sqlString(section.slug)}, ${sqlString(section.title)}, ${sqlString(section.description)}, ${section.sortOrder})`
      )
      .join(",\n")
  );
  lines.push("on conflict (id) do update set");
  lines.push("  slug = excluded.slug,");
  lines.push("  title = excluded.title,");
  lines.push("  description = excluded.description,");
  lines.push("  sort_order = excluded.sort_order;");
  lines.push("");

  lines.push("insert into public.cb_lessons (id, slug, section_id, sort_order, title, short_text, full_text, ai_context, ai_suggestions_json, image_url, atlas_node_id, related_slugs, source_book_ref, source_atlas_ref, category, published_at)");
  lines.push("values");
  lines.push(
    lessons
      .map(
        (lesson) =>
          `  (${sqlString(lesson.id)}, ${sqlString(lesson.slug)}, ${sqlString(lesson.sectionId)}, ${lesson.sortOrder}, ${sqlString(lesson.title)}, ${sqlString(lesson.shortText)}, ${sqlString(lesson.fullText)}, ${sqlString(lesson.aiContext)}, ${sqlJson(lesson.aiSuggestions)}, ${sqlString(lesson.imageUrl ?? null)}, ${sqlString(lesson.atlasNodeId)}, ${sqlJson(lesson.relatedSlugs)}, ${sqlString(lesson.sourceBookRef)}, ${sqlString(lesson.sourceAtlasRef)}, ${sqlString(lesson.category)}, ${sqlString(lesson.publishedAt)})`
      )
      .join(",\n")
  );
  lines.push("on conflict (id) do update set");
  lines.push("  slug = excluded.slug,");
  lines.push("  section_id = excluded.section_id,");
  lines.push("  sort_order = excluded.sort_order,");
  lines.push("  title = excluded.title,");
  lines.push("  short_text = excluded.short_text,");
  lines.push("  full_text = excluded.full_text,");
  lines.push("  ai_context = excluded.ai_context,");
  lines.push("  ai_suggestions_json = excluded.ai_suggestions_json,");
  lines.push("  image_url = excluded.image_url,");
  lines.push("  atlas_node_id = excluded.atlas_node_id,");
  lines.push("  related_slugs = excluded.related_slugs,");
  lines.push("  source_book_ref = excluded.source_book_ref,");
  lines.push("  source_atlas_ref = excluded.source_atlas_ref,");
  lines.push("  category = excluded.category,");
  lines.push("  published_at = excluded.published_at;");
  lines.push("");

  lines.push("insert into public.cb_atlas_nodes (id, slug, title, category, x, y, size, color_token, lesson_id, short_text)");
  lines.push("values");
  lines.push(
    atlasNodes
      .map((node) => {
        const position = nodePositions.get(node.id);
        return `  (${sqlString(node.id)}, ${sqlString(node.slug)}, ${sqlString(node.title)}, ${sqlString(position?.category || node.sectionId)}, ${formatNumber(position?.x || 0)}, ${formatNumber(position?.y || 0)}, ${formatNumber(position?.size || 1)}, ${sqlString(position?.colorToken || node.colorToken)}, ${sqlString(node.lessonId)}, ${sqlString(node.shortText)})`;
      })
      .join(",\n")
  );
  lines.push("on conflict (id) do update set");
  lines.push("  slug = excluded.slug,");
  lines.push("  title = excluded.title,");
  lines.push("  category = excluded.category,");
  lines.push("  x = excluded.x,");
  lines.push("  y = excluded.y,");
  lines.push("  size = excluded.size,");
  lines.push("  color_token = excluded.color_token,");
  lines.push("  lesson_id = excluded.lesson_id,");
  lines.push("  short_text = excluded.short_text;");
  lines.push("");

  lines.push("insert into public.cb_atlas_edges (id, from_node_id, to_node_id, relation_type, relation_label, weight)");
  lines.push("values");
  lines.push(
    atlasEdges
      .map(
        (edge) =>
          `  (${sqlString(edge.id)}, ${sqlString(edge.fromNodeId)}, ${sqlString(edge.toNodeId)}, ${sqlString(edge.relationType)}, ${sqlString(edge.relationLabel)}, ${edge.weight})`
      )
      .join(",\n")
  );
  lines.push("on conflict (id) do update set");
  lines.push("  from_node_id = excluded.from_node_id,");
  lines.push("  to_node_id = excluded.to_node_id,");
  lines.push("  relation_type = excluded.relation_type,");
  lines.push("  relation_label = excluded.relation_label,");
  lines.push("  weight = excluded.weight;");
  lines.push("");

  lines.push("insert into public.cb_products (sku, title, description, type, price_xtr, is_active)");
  lines.push("values");
  lines.push(
    products
      .map(
        (product) =>
          `  (${sqlString(product.sku)}, ${sqlString(product.title)}, ${sqlString(product.description)}, ${sqlString(product.type)}, ${product.priceXtr}, ${sqlBool(product.isActive)})`
      )
      .join(",\n")
  );
  lines.push("on conflict (sku) do update set");
  lines.push("  title = excluded.title,");
  lines.push("  description = excluded.description,");
  lines.push("  type = excluded.type,");
  lines.push("  price_xtr = excluded.price_xtr,");
  lines.push("  is_active = excluded.is_active;");
  lines.push("");

  quizzes.forEach((quiz) => {
    lines.push("with upserted_quiz as (");
    lines.push("  insert into public.cb_quizzes (slug, title, section_id, description, product_sku, sort_order, is_public_preview, teaser)");
    lines.push(
      `  values (${sqlString(quiz.slug)}, ${sqlString(quiz.title)}, ${sqlString(quiz.sectionId)}, ${sqlString(quiz.description)}, ${sqlString(quiz.productSku)}, ${quiz.sortOrder}, ${sqlBool(quiz.isPublicPreview)}, ${sqlString(quiz.teaser)})`
    );
    lines.push("  on conflict (slug) do update set");
    lines.push("    title = excluded.title,");
    lines.push("    section_id = excluded.section_id,");
    lines.push("    description = excluded.description,");
    lines.push("    product_sku = excluded.product_sku,");
    lines.push("    sort_order = excluded.sort_order,");
    lines.push("    is_public_preview = excluded.is_public_preview,");
    lines.push("    teaser = excluded.teaser");
    lines.push("  returning id");
    lines.push("), deleted as (");
    lines.push(`  delete from public.cb_quiz_questions where quiz_id in (select id from public.cb_quizzes where slug = ${sqlString(quiz.slug)})`);
    lines.push(")");
    lines.push("insert into public.cb_quiz_questions (quiz_id, question_text, question_type, options_json, correct_answer_json, explanation, lesson_id, sort_order)");
    lines.push("values");
    lines.push(
      quiz.questions
        .map(
          (question, index) =>
            `  ((select id from upserted_quiz limit 1), ${sqlString(question.questionText)}, 'single_choice', ${sqlJson(question.options)}, ${sqlJson({ correctIndex: question.correctAnswer })}, ${sqlString(question.explanation)}, ${sqlString(question.lessonId)}, ${index + 1})`
        )
        .join(",\n")
    );
    lines.push(";");
    lines.push("");
  });

  lines.push("commit;");
  lines.push("");

  return lines.join("\n");
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, buildSql(), "utf8");
console.log(`Wrote ${outputPath}`);
