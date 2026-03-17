export type AtlasColorToken = "soft-blue" | "soft-green" | "soft-yellow" | "soft-red";

export type AtlasSubgroup = {
  id: string;
  title: string;
  description: string;
};

export type Section = {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  sortOrder: number;
  colorToken: AtlasColorToken;
  startAngle: number;
  endAngle: number;
  callouts: string[];
  subgroups: AtlasSubgroup[];
};

export type Lesson = {
  id: string;
  slug: string;
  sectionId: string;
  subgroupId: string;
  sortOrder: number;
  title: string;
  shortText: string;
  fullText: string;
  aiContext: string;
  aiSuggestions: string[];
  imageUrl?: string;
  atlasNodeId: string;
  relatedSlugs: string[];
  sourceBookRef: string;
  sourceAtlasRef: string;
  category: string;
  publishedAt: string;
};

export type AtlasNode = {
  id: string;
  slug: string;
  title: string;
  sectionId: string;
  subgroupId: string;
  colorToken: AtlasColorToken;
  lessonId: string;
  shortText: string;
  ringOrder: number;
};

export type AtlasEdge = {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  relationType: string;
  relationLabel: string;
  weight: number;
};

export type LeadInput = {
  email: string;
  tgUsername?: string;
  source?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  consentEmail: boolean;
  consentTerms: boolean;
};

export type Product = {
  id: string;
  sku: string;
  title: string;
  description: string;
  type: "quiz_pack";
  priceXtr: number;
  isActive: boolean;
};

export type QuizQuestion = {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  lessonId: string;
};

export type Quiz = {
  id: string;
  slug: string;
  title: string;
  sectionId: string;
  description: string;
  productSku: string;
  sortOrder: number;
  isPublicPreview: boolean;
  teaser: string;
  questions: QuizQuestion[];
};

export type AtlasGraph = {
  sections: Section[];
  nodes: AtlasNode[];
  edges: AtlasEdge[];
};
