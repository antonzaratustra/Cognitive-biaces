import { NextResponse } from "next/server";

import { getAtlasGraph } from "@/lib/content";

export async function GET(request: Request) {
  const graph = await getAtlasGraph();
  const { searchParams } = new URL(request.url);
  const sectionId = searchParams.get("section");

  if (!sectionId) {
    return NextResponse.json(graph);
  }

  const sections = graph.sections.filter((section) => section.id === sectionId);
  const nodes = graph.nodes.filter((node) => node.sectionId === sectionId);
  const allowedIds = new Set(nodes.map((node) => node.id));
  const edges = graph.edges.filter((edge) => allowedIds.has(edge.fromNodeId) && allowedIds.has(edge.toNodeId));

  return NextResponse.json({ edges, nodes, sections });
}
