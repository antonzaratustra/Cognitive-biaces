import {
  atlasEdges as staticAtlasEdges,
  atlasGraph as staticAtlasGraph,
  atlasNodes as staticAtlasNodes,
  lessons as staticLessons,
  quizzes,
  sections as staticSections
} from "@/data/course-data";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { AtlasEdge, AtlasGraph, AtlasNode, AtlasSubgroup, Lesson, Section } from "@/lib/types";

type DbSectionRow = {
  description: string;
  id: string;
  sort_order: number;
  title: string;
};

type DbSubgroupRow = {
  description: string;
  id: string;
  section_id: string;
  sort_order: number;
  title: string;
};

type DbLessonRow = {
  ai_context: string;
  ai_suggestions_json: string[] | null;
  atlas_node_id: string;
  category: string;
  full_text: string;
  id: string;
  image_url: string | null;
  published_at: string | null;
  related_slugs: string[] | null;
  section_id: string;
  short_text: string;
  slug: string;
  sort_order: number;
  source_atlas_ref: string | null;
  source_book_ref: string | null;
  subgroup_id: string | null;
  title: string;
};

type DbAtlasNodeRow = {
  category: string;
  color_token: "soft-blue" | "soft-green" | "soft-yellow" | "soft-red";
  id: string;
  lesson_id: string | null;
  short_text: string;
  size: number;
  slug: string;
  subgroup_id: string | null;
  title: string;
  x: number;
  y: number;
  section_id: string | null;
  node_type: string;
};

type DbAtlasEdgeRow = {
  from_node_id: string;
  id: string;
  relation_label: string;
  relation_type: string;
  to_node_id: string;
  weight: number;
};

const sectionMeta: Record<
  string,
  Pick<Section, "callouts" | "colorToken" | "endAngle" | "shortTitle" | "startAngle">
> = {
  memory: {
    shortTitle: "Память",
    colorToken: "soft-yellow",
    startAngle: 210,
    endAngle: 315,
    callouts: [
      "Запоминаем то, что было ярче, страннее или эмоциональнее",
      "Редактируем воспоминания после события",
      "Склеиваем прошлое в удобную, но не всегда честную историю"
    ]
  },
  information: {
    shortTitle: "Перегрузка",
    colorToken: "soft-blue",
    startAngle: 320,
    endAngle: 35,
    callouts: [
      "Замечаем знакомое и повторяемое быстрее важного",
      "Путаем яркость сигнала с его частотой и значимостью",
      "Фильтруем неудобное и держимся за уже знакомую версию"
    ]
  },
  meaning: {
    shortTitle: "Смысл",
    colorToken: "soft-red",
    startAngle: 45,
    endAngle: 140,
    callouts: [
      "Достраиваем связи и причины там, где данных не хватает",
      "Заполняем пробелы стереотипами, знакомым и красивыми сюжетами",
      "Упрощаем сложную неопределенность до удобной картины мира"
    ]
  },
  reaction: {
    shortTitle: "Реакции",
    colorToken: "soft-green",
    startAngle: 145,
    endAngle: 220,
    callouts: [
      "Выбираем то, что дает ощущение определенности здесь и сейчас",
      "Слишком долго держимся за вложенное и привычное",
      "Предпочитаем простое, обратимое и безопасное сложному"
    ]
  }
};

type ContentSnapshot = {
  graph: AtlasGraph;
  lessons: Lesson[];
};

function fallbackSnapshot(): ContentSnapshot {
  return {
    graph: staticAtlasGraph,
    lessons: staticLessons
  };
}

function buildSections(sectionRows: DbSectionRow[], subgroupRows: DbSubgroupRow[]): Section[] {
  return [...sectionRows]
    .sort((left, right) => left.sort_order - right.sort_order)
    .map((sectionRow) => {
      const meta = sectionMeta[sectionRow.id] ?? {
        shortTitle: sectionRow.title,
        colorToken: "soft-blue" as const,
        startAngle: 0,
        endAngle: 90,
        callouts: []
      };

      const subgroups: AtlasSubgroup[] = subgroupRows
        .filter((subgroup) => subgroup.section_id === sectionRow.id)
        .sort((left, right) => left.sort_order - right.sort_order)
        .map((subgroup) => ({
          id: subgroup.id,
          title: subgroup.title,
          description: subgroup.description
        }));

      return {
        id: sectionRow.id,
        slug: sectionRow.id,
        title: sectionRow.title,
        shortTitle: meta.shortTitle,
        description: sectionRow.description,
        sortOrder: sectionRow.sort_order,
        colorToken: meta.colorToken,
        startAngle: meta.startAngle,
        endAngle: meta.endAngle,
        callouts: meta.callouts.length > 0 ? meta.callouts : subgroups.slice(0, 3).map((subgroup) => subgroup.title),
        subgroups
      };
    });
}

function buildLessons(lessonRows: DbLessonRow[]): Lesson[] {
  return [...lessonRows]
    .sort((left, right) => left.sort_order - right.sort_order)
    .map((lessonRow) => ({
      id: lessonRow.id,
      slug: lessonRow.slug,
      sectionId: lessonRow.section_id,
      subgroupId: lessonRow.subgroup_id ?? lessonRow.section_id,
      sortOrder: lessonRow.sort_order,
      title: lessonRow.title,
      shortText: lessonRow.short_text,
      fullText: lessonRow.full_text,
      aiContext: lessonRow.ai_context,
      aiSuggestions: lessonRow.ai_suggestions_json ?? [],
      imageUrl: lessonRow.image_url ?? undefined,
      atlasNodeId: lessonRow.atlas_node_id,
      relatedSlugs: lessonRow.related_slugs ?? [],
      sourceBookRef: lessonRow.source_book_ref ?? "",
      sourceAtlasRef: lessonRow.source_atlas_ref ?? "",
      category: lessonRow.category,
      publishedAt: lessonRow.published_at ?? ""
    }));
}

function buildAtlasNodes(nodeRows: DbAtlasNodeRow[], lessons: Lesson[]): AtlasNode[] {
  const lessonMap = new Map(lessons.map((lesson) => [lesson.id, lesson]));

  return nodeRows
    .filter((nodeRow) => nodeRow.node_type === "bias")
    .map((nodeRow) => {
      const lesson = nodeRow.lesson_id ? lessonMap.get(nodeRow.lesson_id) : null;

      return {
        id: nodeRow.id,
        slug: nodeRow.slug,
        title: nodeRow.title,
        sectionId: nodeRow.section_id ?? lesson?.sectionId ?? "information",
        subgroupId: nodeRow.subgroup_id ?? lesson?.subgroupId ?? (nodeRow.section_id ?? "information"),
        colorToken: nodeRow.color_token,
        lessonId: nodeRow.lesson_id ?? nodeRow.slug,
        shortText: nodeRow.short_text,
        ringOrder: lesson?.sortOrder ?? 9999
      };
    })
    .sort((left, right) => left.ringOrder - right.ringOrder);
}

function buildAtlasEdges(edgeRows: DbAtlasEdgeRow[]): AtlasEdge[] {
  return edgeRows.map((edgeRow) => ({
    id: edgeRow.id,
    fromNodeId: edgeRow.from_node_id,
    toNodeId: edgeRow.to_node_id,
    relationType: edgeRow.relation_type,
    relationLabel: edgeRow.relation_label,
    weight: edgeRow.weight
  }));
}

async function loadDbSnapshot(): Promise<ContentSnapshot | null> {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return null;
  }

  const [sectionsResult, subgroupsResult, lessonsResult, nodesResult, edgesResult] = await Promise.all([
    supabase.from("cb_sections").select("id, title, description, sort_order").order("sort_order"),
    supabase.from("cb_subgroups").select("id, section_id, title, description, sort_order").order("sort_order"),
    supabase
      .from("cb_lessons")
      .select(
        "id, slug, section_id, subgroup_id, sort_order, title, short_text, full_text, ai_context, ai_suggestions_json, image_url, atlas_node_id, related_slugs, source_book_ref, source_atlas_ref, category, published_at"
      )
      .order("sort_order"),
    supabase
      .from("cb_atlas_nodes")
      .select("id, slug, title, category, x, y, size, color_token, lesson_id, short_text, section_id, subgroup_id, node_type"),
    supabase
      .from("cb_atlas_edges")
      .select("id, from_node_id, to_node_id, relation_type, relation_label, weight")
  ]);

  if (
    sectionsResult.error ||
    subgroupsResult.error ||
    lessonsResult.error ||
    nodesResult.error ||
    edgesResult.error ||
    !sectionsResult.data ||
    !subgroupsResult.data ||
    !lessonsResult.data ||
    !nodesResult.data ||
    !edgesResult.data
  ) {
    return null;
  }

  const sections = buildSections(sectionsResult.data as DbSectionRow[], subgroupsResult.data as DbSubgroupRow[]);
  const lessons = buildLessons(lessonsResult.data as DbLessonRow[]);
  const nodes = buildAtlasNodes(nodesResult.data as DbAtlasNodeRow[], lessons);
  const edges = buildAtlasEdges(edgesResult.data as DbAtlasEdgeRow[]);

  if (sections.length === 0 || lessons.length === 0 || nodes.length === 0) {
    return null;
  }

  return {
    lessons,
    graph: {
      sections,
      nodes,
      edges
    }
  };
}

export async function getContentSnapshot(): Promise<ContentSnapshot> {
  const dbSnapshot = await loadDbSnapshot();
  return dbSnapshot ?? fallbackSnapshot();
}

export async function getAtlasGraph() {
  return (await getContentSnapshot()).graph;
}

export async function getAllLessons() {
  return (await getContentSnapshot()).lessons;
}

export async function getLessonBySlug(slug: string) {
  return (await getContentSnapshot()).lessons.find((lesson) => lesson.slug === slug) ?? null;
}

export async function getFeaturedLessons() {
  const snapshot = await getContentSnapshot();
  
  // Выбираем 6 самых цепляющих искажений из всех 4 сфер
  const featuredSlugs = [
    // Когда запоминаем и вспоминаем (memory) - жёлтый
    "peak-end-rule",
    "hindsight-bias",
    // Когда много информации (information) - синий
    "availability-heuristic",
    "confirmation-bias",
    // Когда не хватает смысла (meaning) - красный
    "narrative-fallacy",
    // Когда быстро реагируем (reaction) - зелёный
    "loss-aversion"
  ];
  
  return featuredSlugs
    .map((slug) => snapshot.lessons.find((lesson) => lesson.slug === slug) || null)
    .filter((lesson): lesson is Lesson => Boolean(lesson));
}

export async function getAllSections() {
  return (await getContentSnapshot()).graph.sections;
}

export async function getSectionById(sectionId: string) {
  return (await getContentSnapshot()).graph.sections.find((section) => section.id === sectionId) ?? null;
}

export async function getAllAtlasNodes() {
  return (await getContentSnapshot()).graph.nodes;
}

export async function getAllAtlasEdges() {
  return (await getContentSnapshot()).graph.edges;
}

export function getAllQuizzes() {
  return quizzes;
}

export async function getRelatedLessons(slug: string) {
  const snapshot = await getContentSnapshot();
  const lesson = snapshot.lessons.find((item) => item.slug === slug);

  if (!lesson) {
    return [];
  }

  return lesson.relatedSlugs
    .map((relatedSlug) => snapshot.lessons.find((candidate) => candidate.slug === relatedSlug) ?? null)
    .filter((candidate): candidate is Lesson => Boolean(candidate));
}

export { staticAtlasEdges, staticAtlasNodes, staticSections };
