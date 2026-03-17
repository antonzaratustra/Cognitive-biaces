import { atlasEdges, atlasGraph, atlasNodes, lessons, quizzes, sections } from "@/data/course-data";

export function getAtlasGraph() {
  return atlasGraph;
}

export function getAllLessons() {
  return lessons;
}

export function getFeaturedLessons() {
  return lessons.slice(0, 6);
}

export function getAllSections() {
  return sections;
}

export function getAllAtlasNodes() {
  return atlasNodes;
}

export function getAllAtlasEdges() {
  return atlasEdges;
}

export function getAllQuizzes() {
  return quizzes;
}
