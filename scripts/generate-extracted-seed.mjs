import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const inputDir = path.join(root, "content", "extracted");
const outputPath = path.join(root, "supabase", "seeds", "20260318_extracted_content.sql");

const sphereColorMap = new Map([
  ["information", "soft-blue"],
  ["meaning", "soft-red"],
  ["reaction", "soft-green"],
  ["memory", "soft-yellow"]
]);

const sphereOrderMap = new Map([
  ["memory", 1],
  ["information", 2],
  ["meaning", 3],
  ["reaction", 4]
]);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function readJsonl(filePath) {
  return fs
    .readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      try {
        return JSON.parse(line);
      } catch (error) {
        throw new Error(`Invalid JSONL in ${filePath} at line ${index + 1}: ${error.message}`);
      }
    });
}

function listFilesRecursive(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return [];
  }

  return fs.readdirSync(dirPath, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      return listFilesRecursive(fullPath);
    }
    return [fullPath];
  });
}

function sqlString(value) {
  if (value === null || value === undefined) {
    return "null";
  }
  return `'${String(value).replace(/'/g, "''")}'`;
}

function sqlJson(value) {
  return `'${JSON.stringify(value ?? []).replace(/'/g, "''")}'::jsonb`;
}

function formatNumber(value) {
  return Number(value).toFixed(4).replace(/\.?0+$/, "");
}

function detectInputFiles() {
  const files = listFilesRecursive(inputDir);
  const taxonomyPath = files.find((file) => path.basename(file).toLowerCase() === "taxonomy.json");

  if (!taxonomyPath) {
    throw new Error(`taxonomy.json not found inside ${inputDir}`);
  }

  const jsonlFiles = files.filter((file) => file.toLowerCase().endsWith(".jsonl"));
  const relationPaths = jsonlFiles.filter((file) => /relation/i.test(path.basename(file)));
  const biasPaths = jsonlFiles.filter((file) => !relationPaths.includes(file));

  if (biasPaths.length === 0) {
    throw new Error(`No bias batch .jsonl files found inside ${inputDir}`);
  }

  if (relationPaths.length === 0) {
    throw new Error(`No relation batch .jsonl files found inside ${inputDir}`);
  }

  return { taxonomyPath, biasPaths, relationPaths };
}

function loadInput() {
  const { taxonomyPath, biasPaths, relationPaths } = detectInputFiles();
  const taxonomy = readJson(taxonomyPath);
  const biases = dedupeByKey(biasPaths.flatMap(readJsonl), (item) => item.slug);
  const relations = dedupeByKey(
    relationPaths.flatMap(readJsonl),
    (item) => `${item.source_key}::${item.target_key}::${item.relation_type}`
  );

  return {
    taxonomy,
    biases,
    relations,
    files: {
      taxonomyPath,
      biasPaths,
      relationPaths
    }
  };
}

function dedupeByKey(items, getKey) {
  const map = new Map();
  items.forEach((item) => {
    const key = getKey(item);
    if (key) {
      map.set(key, item);
    }
  });
  return [...map.values()];
}

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function safeSortNumber(value, fallback) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function buildSuggestedQuestions(bias) {
  return [
    "Как это проявляется в обычной жизни?",
    "Как замечать это у себя в моменте?",
    "Что делать на практике, чтобы не попадать в эту ловушку?"
  ];
}

function buildBookRef(sourceRefs) {
  const first = ensureArray(sourceRefs)[0];
  if (!first) {
    return null;
  }

  return [first.title, first.page].filter(Boolean).join(", ");
}

function buildDerivedData(taxonomy, biases, relations) {
  const spheres = ensureArray(taxonomy.spheres).map((sphere, index) => ({
    ...sphere,
    sort_order: safeSortNumber(sphere.sort_order, sphereOrderMap.get(sphere.key) ?? index + 1),
    color_token: sphereColorMap.get(sphere.key) ?? "soft-blue",
    description_ru: sphere.description_ru || ""
  }));

  const sphereMap = new Map(spheres.map((sphere) => [sphere.key, sphere]));

  const subgroupPositions = new Map();
  const subgroups = ensureArray(taxonomy.subgroups).map((subgroup, index) => {
    const sphereKey = subgroup.sphere_key;
    const current = subgroupPositions.get(sphereKey) ?? 0;
    subgroupPositions.set(sphereKey, current + 1);
    return {
      ...subgroup,
      sort_order: safeSortNumber(subgroup.sort_order, current + 1),
      color_token: sphereMap.get(sphereKey)?.color_token ?? "soft-blue"
    };
  });

  const subgroupMap = new Map(subgroups.map((subgroup) => [subgroup.key, subgroup]));
  const biasMap = new Map();
  const normalizedBiases = biases.map((bias, index) => {
    const sphere = sphereMap.get(bias.sphere_key);
    const subgroup = subgroupMap.get(bias.subgroup_key);

    if (!sphere) {
      throw new Error(`Unknown sphere_key "${bias.sphere_key}" for bias "${bias.slug}"`);
    }

    if (!subgroup) {
      throw new Error(`Unknown subgroup_key "${bias.subgroup_key}" for bias "${bias.slug}"`);
    }

    const normalized = {
      ...bias,
      lesson_order: safeSortNumber(bias.lesson_order, index + 1),
      difficulty: bias.difficulty || "medium",
      image_url: bias.image_url || null,
      ai_suggestions: buildSuggestedQuestions(bias),
      source_book_ref: buildBookRef(bias.source_refs),
      source_atlas_ref: subgroup.title_ru,
      category: sphere.title_ru,
      published_at: bias.published_at || "2026-03-18T00:00:00.000Z",
      atlas_node_id: `node-${bias.slug}`,
      node_type: "bias",
      color_token: sphere.color_token
    };

    biasMap.set(normalized.slug, normalized);
    return normalized;
  });

  const sectionNodes = spheres.map((sphere, index) => ({
    id: `section-${sphere.key}`,
    slug: sphere.key,
    title: sphere.title_ru,
    category: sphere.title_ru,
    node_type: "section",
    section_id: sphere.key,
    subgroup_id: null,
    lesson_id: null,
    short_text: sphere.description_ru || sphere.title_ru,
    color_token: sphere.color_token,
    ...positionForSphere(index)
  }));

  const subgroupNodes = subgroups.map((subgroup) => {
    const sphereIndex = spheres.findIndex((sphere) => sphere.key === subgroup.sphere_key);
    return {
      id: `subgroup-${subgroup.key}`,
      slug: subgroup.key,
      title: subgroup.title_ru,
      category: sphereMap.get(subgroup.sphere_key)?.title_ru || subgroup.sphere_key,
      node_type: "subgroup",
      section_id: subgroup.sphere_key,
      subgroup_id: subgroup.key,
      lesson_id: null,
      short_text: subgroup.description_ru,
      color_token: subgroup.color_token,
      ...positionForSubgroup(sphereIndex, subgroup.sort_order - 1)
    };
  });

  const groupedBiases = new Map();
  normalizedBiases.forEach((bias) => {
    if (!groupedBiases.has(bias.subgroup_key)) {
      groupedBiases.set(bias.subgroup_key, []);
    }
    groupedBiases.get(bias.subgroup_key).push(bias);
  });

  const biasNodes = normalizedBiases.map((bias) => {
    const subgroupBiases = groupedBiases.get(bias.subgroup_key) || [];
    subgroupBiases.sort((a, b) => a.lesson_order - b.lesson_order);
    const localIndex = subgroupBiases.findIndex((item) => item.slug === bias.slug);
    const sphereIndex = spheres.findIndex((sphere) => sphere.key === bias.sphere_key);
    return {
      id: bias.atlas_node_id,
      slug: bias.slug,
      title: bias.title_ru,
      category: bias.category,
      node_type: "bias",
      section_id: bias.sphere_key,
      subgroup_id: bias.subgroup_key,
      lesson_id: bias.slug,
      short_text: bias.atlas_blurb || bias.short_text,
      color_token: bias.color_token,
      ...positionForBias(sphereIndex, subgroupMap.get(bias.subgroup_key)?.sort_order - 1 || 0, localIndex)
    };
  });

  const containsRelations = relations.filter((relation) => relation.relation_type === "contains");
  const relatedRelations = relations.filter((relation) => relation.relation_type !== "contains");

  const atlasEdges = [];

  containsRelations.forEach((relation) => {
    const fromSection = sphereMap.get(relation.source_key);
    const toSubgroup = subgroupMap.get(relation.target_key);
    const fromSubgroup = subgroupMap.get(relation.source_key);
    const toBias = biasMap.get(relation.target_key);

    if (fromSection && toSubgroup) {
      atlasEdges.push({
        id: `edge-${relation.source_key}-${relation.target_key}`,
        from_node_id: `section-${relation.source_key}`,
        to_node_id: `subgroup-${relation.target_key}`,
        relation_type: "contains",
        relation_label: "contains",
        weight: 1
      });
      return;
    }

    if (fromSubgroup && toBias) {
      atlasEdges.push({
        id: `edge-${relation.source_key}-${relation.target_key}`,
        from_node_id: `subgroup-${relation.source_key}`,
        to_node_id: `node-${relation.target_key}`,
        relation_type: "contains",
        relation_label: "contains",
        weight: 1
      });
    }
  });

  relatedRelations.forEach((relation) => {
    if (!biasMap.has(relation.source_key) || !biasMap.has(relation.target_key)) {
      return;
    }

    atlasEdges.push({
      id: `edge-${relation.source_key}-${relation.target_key}-${relation.relation_type}`,
      from_node_id: `node-${relation.source_key}`,
      to_node_id: `node-${relation.target_key}`,
      relation_type: relation.relation_type,
      relation_label: relation.relation_type,
      weight: 1
    });
  });

  return {
    spheres,
    subgroups,
    biases: normalizedBiases,
    atlasNodes: [...sectionNodes, ...subgroupNodes, ...biasNodes],
    atlasEdges: dedupeByKey(atlasEdges, (edge) => edge.id)
  };
}

function positionForSphere(index) {
  const angles = [315, 45, 135, 225];
  const angle = ((angles[index] ?? 315) * Math.PI) / 180;
  const radius = 170;
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
    size: 1.4
  };
}

function positionForSubgroup(sphereIndex, subgroupIndex) {
  const angles = [315, 45, 135, 225];
  const base = ((angles[sphereIndex] ?? 315) * Math.PI) / 180;
  const spread = ((subgroupIndex - 2) * 12 * Math.PI) / 180;
  const angle = base + spread;
  const radius = 300;
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
    size: 1.1
  };
}

function positionForBias(sphereIndex, subgroupIndex, biasIndex) {
  const angles = [315, 45, 135, 225];
  const base = ((angles[sphereIndex] ?? 315) * Math.PI) / 180;
  const subgroupOffset = ((subgroupIndex - 2) * 12 * Math.PI) / 180;
  const localOffset = ((biasIndex - 3) * 4 * Math.PI) / 180;
  const angle = base + subgroupOffset + localOffset;
  const radius = 430 + (biasIndex % 3) * 24;
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
    size: 0.92 + (biasIndex % 4) * 0.04
  };
}

function buildSql() {
  const { taxonomy, biases, relations, files } = loadInput();
  const data = buildDerivedData(taxonomy, biases, relations);

  const lines = [];

  lines.push("-- Generated from content/extracted");
  lines.push(`-- taxonomy: ${path.relative(root, files.taxonomyPath)}`);
  files.biasPaths.forEach((filePath) => lines.push(`-- biases: ${path.relative(root, filePath)}`));
  files.relationPaths.forEach((filePath) => lines.push(`-- relations: ${path.relative(root, filePath)}`));
  lines.push("");
  lines.push("begin;");
  lines.push("");

  lines.push("delete from public.cb_atlas_edges;");
  lines.push("delete from public.cb_atlas_nodes;");
  lines.push("delete from public.cb_lessons;");
  lines.push("delete from public.cb_subgroups;");
  lines.push("delete from public.cb_sections;");
  lines.push("");

  lines.push("insert into public.cb_sections (id, slug, title, description, sort_order)");
  lines.push("values");
  lines.push(
    data.spheres
      .map(
        (sphere) =>
          `  (${sqlString(sphere.key)}, ${sqlString(sphere.key)}, ${sqlString(sphere.title_ru)}, ${sqlString(sphere.description_ru || sphere.title_ru)}, ${sphere.sort_order})`
      )
      .join(",\n")
  );
  lines.push(";");
  lines.push("");

  lines.push("insert into public.cb_subgroups (id, slug, section_id, title, description, sort_order, color_token)");
  lines.push("values");
  lines.push(
    data.subgroups
      .map(
        (subgroup) =>
          `  (${sqlString(subgroup.key)}, ${sqlString(subgroup.key)}, ${sqlString(subgroup.sphere_key)}, ${sqlString(subgroup.title_ru)}, ${sqlString(subgroup.description_ru)}, ${subgroup.sort_order}, ${sqlString(subgroup.color_token)})`
      )
      .join(",\n")
  );
  lines.push(";");
  lines.push("");

  lines.push("insert into public.cb_lessons (id, slug, section_id, subgroup_id, sort_order, title, title_en, short_text, full_text, ai_context, ai_suggestions_json, image_url, atlas_node_id, related_slugs, source_book_ref, source_atlas_ref, category, published_at, aliases_ru, aliases_en, mechanism, why_it_matters, everyday_examples_json, work_examples_json, signals_json, antidotes_json, self_check_questions_json, difficulty, atlas_blurb, image_prompt, source_refs_json, confidence)");
  lines.push("values");
  lines.push(
    data.biases
      .map(
        (bias) =>
          `  (${sqlString(bias.slug)}, ${sqlString(bias.slug)}, ${sqlString(bias.sphere_key)}, ${sqlString(bias.subgroup_key)}, ${bias.lesson_order}, ${sqlString(bias.title_ru)}, ${sqlString(bias.title_en)}, ${sqlString(bias.short_text)}, ${sqlString(bias.full_text)}, ${sqlString(bias.ai_context)}, ${sqlJson(bias.ai_suggestions)}, ${sqlString(bias.image_url)}, ${sqlString(bias.atlas_node_id)}, ${sqlJson(ensureArray(bias.related_slugs))}, ${sqlString(bias.source_book_ref)}, ${sqlString(bias.source_atlas_ref)}, ${sqlString(bias.category)}, ${sqlString(bias.published_at)}, ${sqlJson(ensureArray(bias.aliases_ru))}, ${sqlJson(ensureArray(bias.aliases_en))}, ${sqlString(bias.mechanism)}, ${sqlString(bias.why_it_matters)}, ${sqlJson(ensureArray(bias.everyday_examples))}, ${sqlJson(ensureArray(bias.work_examples))}, ${sqlJson(ensureArray(bias.signals))}, ${sqlJson(ensureArray(bias.antidotes))}, ${sqlJson(ensureArray(bias.self_check_questions))}, ${sqlString(bias.difficulty)}, ${sqlString(bias.atlas_blurb)}, ${sqlString(bias.image_prompt)}, ${sqlJson(ensureArray(bias.source_refs))}, ${bias.confidence ?? "null"})`
      )
      .join(",\n")
  );
  lines.push(";");
  lines.push("");

  lines.push("insert into public.cb_atlas_nodes (id, slug, title, category, x, y, size, color_token, lesson_id, short_text, node_type, section_id, subgroup_id)");
  lines.push("values");
  lines.push(
    data.atlasNodes
      .map(
        (node) =>
          `  (${sqlString(node.id)}, ${sqlString(node.slug)}, ${sqlString(node.title)}, ${sqlString(node.category)}, ${formatNumber(node.x)}, ${formatNumber(node.y)}, ${formatNumber(node.size)}, ${sqlString(node.color_token)}, ${sqlString(node.lesson_id)}, ${sqlString(node.short_text)}, ${sqlString(node.node_type)}, ${sqlString(node.section_id)}, ${sqlString(node.subgroup_id)})`
      )
      .join(",\n")
  );
  lines.push(";");
  lines.push("");

  lines.push("insert into public.cb_atlas_edges (id, from_node_id, to_node_id, relation_type, relation_label, weight)");
  lines.push("values");
  lines.push(
    data.atlasEdges
      .map(
        (edge) =>
          `  (${sqlString(edge.id)}, ${sqlString(edge.from_node_id)}, ${sqlString(edge.to_node_id)}, ${sqlString(edge.relation_type)}, ${sqlString(edge.relation_label)}, ${edge.weight})`
      )
      .join(",\n")
  );
  lines.push(";");
  lines.push("");

  lines.push("commit;");
  lines.push("");

  return { sql: lines.join("\n"), counts: { spheres: data.spheres.length, subgroups: data.subgroups.length, biases: data.biases.length, edges: data.atlasEdges.length } };
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
const result = buildSql();
fs.writeFileSync(outputPath, result.sql, "utf8");
console.log(`Wrote ${outputPath}`);
console.log(`Spheres: ${result.counts.spheres}, subgroups: ${result.counts.subgroups}, biases: ${result.counts.biases}, edges: ${result.counts.edges}`);
