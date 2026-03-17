"use client";

import Link from "next/link";
import { BrainCircuit, Search, X } from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useState } from "react";

import type { AtlasGraph, AtlasNode, Lesson, Section } from "@/lib/types";
import { telegramDeepLink } from "@/lib/telegram";

type AtlasViewerProps = {
  graph: AtlasGraph;
  initialSlug?: string | null;
  lessons: Lesson[];
};

type Point = {
  x: number;
  y: number;
};

type NodeLayout = {
  angle: number;
  branchPath: string;
  dot: Point;
  id: string;
  isLeft: boolean;
  labelAngle: number;
  node: AtlasNode;
  textPoint: Point;
};

type SubgroupLayout = {
  angle: number;
  id: string;
  isLeft: boolean;
  labelAngle: number;
  subgroupDescription: string;
  subgroupTitle: string;
  textPoint: Point;
};

const colorMap = {
  "soft-blue": {
    dot: "#86b8ff",
    glow: "rgba(134, 184, 255, 0.24)",
    ring: "rgba(134, 184, 255, 0.86)",
    text: "#dceeff"
  },
  "soft-green": {
    dot: "#8ed39a",
    glow: "rgba(142, 211, 154, 0.24)",
    ring: "rgba(142, 211, 154, 0.84)",
    text: "#dcf8e0"
  },
  "soft-yellow": {
    dot: "#f0ca69",
    glow: "rgba(240, 202, 105, 0.24)",
    ring: "rgba(240, 202, 105, 0.82)",
    text: "#fff1c4"
  },
  "soft-red": {
    dot: "#ef8c84",
    glow: "rgba(239, 140, 132, 0.24)",
    ring: "rgba(239, 140, 132, 0.82)",
    text: "#ffd9d6"
  }
} as const;

const svgSize = 1180;
const center = svgSize / 2;

function normalizeAngle(value: number) {
  return ((value % 360) + 360) % 360;
}

function sectorSpan(start: number, end: number) {
  const normalizedStart = normalizeAngle(start);
  const normalizedEnd = normalizeAngle(end);

  return normalizedEnd >= normalizedStart ? normalizedEnd - normalizedStart : 360 - normalizedStart + normalizedEnd;
}

function resolveAngle(start: number, end: number, index: number, count: number, padding = 8) {
  const span = sectorSpan(start, end);
  const effectivePadding = count === 1 ? span / 2 : padding;
  const usableSpan = count === 1 ? 0 : Math.max(span - effectivePadding * 2, 0);
  const step = count <= 1 ? 0 : usableSpan / (count - 1);

  return normalizeAngle(start + effectivePadding + step * index);
}

function sectorMidAngle(start: number, end: number) {
  return normalizeAngle(start + sectorSpan(start, end) / 2);
}

function polar(radius: number, angle: number): Point {
  const radians = ((angle - 90) * Math.PI) / 180;
  const x = center + radius * Math.cos(radians);
  const y = center + radius * Math.sin(radians);

  return {
    x: Number(x.toFixed(3)),
    y: Number(y.toFixed(3))
  };
}

function describeArc(radius: number, start: number, end: number) {
  const actualEnd = end <= start ? end + 360 : end;
  const startPoint = polar(radius, start);
  const endPoint = polar(radius, actualEnd);
  const largeArcFlag = actualEnd - start > 180 ? 1 : 0;

  return `M ${startPoint.x} ${startPoint.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endPoint.x} ${endPoint.y}`;
}

function wrapLines(text: string, maxChars = 18) {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";

  words.forEach((word) => {
    const next = current.length === 0 ? word : `${current} ${word}`;

    if (next.length <= maxChars) {
      current = next;
      return;
    }

    if (current.length > 0) {
      lines.push(current);
    }

    current = word;
  });

  if (current.length > 0) {
    lines.push(current);
  }

  return lines;
}

function getSectionMap(sections: Section[]) {
  return Object.fromEntries(sections.map((section) => [section.id, section])) as Record<string, Section>;
}

export function AtlasViewer({ graph, initialSlug = null, lessons }: AtlasViewerProps) {
  const [activeSection, setActiveSection] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [selectedSlug, setSelectedSlug] = useState<string | null>(initialSlug);
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    setSelectedSlug(initialSlug);
  }, [initialSlug]);

  const sectionMap = useMemo(() => getSectionMap(graph.sections), [graph.sections]);
  const lessonMap = useMemo(() => Object.fromEntries(lessons.map((lesson) => [lesson.slug, lesson])), [lessons]);
  const normalizedQuery = deferredQuery.trim().toLowerCase();

  const matchesNode = (node: AtlasNode) => {
    const lesson = lessonMap[node.slug];
    const section = sectionMap[node.sectionId];
    const sectionMatch = activeSection === "all" || node.sectionId === activeSection;
    const queryMatch =
      normalizedQuery.length === 0 ||
      node.title.toLowerCase().includes(normalizedQuery) ||
      node.shortText.toLowerCase().includes(normalizedQuery) ||
      lesson?.fullText.toLowerCase().includes(normalizedQuery) ||
      section?.title.toLowerCase().includes(normalizedQuery);

    return sectionMatch && queryMatch;
  };

  const nodeLayouts = useMemo(() => {
    const layouts = new Map<string, NodeLayout>();

    graph.sections.forEach((section) => {
      const sectionNodes = graph.nodes
        .filter((node) => node.sectionId === section.id)
        .sort((left, right) => left.ringOrder - right.ringOrder);

      const sectionMid = sectorMidAngle(section.startAngle, section.endAngle);
      const innerAnchor = polar(158, sectionMid);
      const nodesBySubgroup = Object.fromEntries(section.subgroups.map((subgroup) => [subgroup.id, [] as AtlasNode[]]));

      sectionNodes.forEach((node) => {
        if (!nodesBySubgroup[node.subgroupId]) {
          nodesBySubgroup[node.subgroupId] = [];
        }

        nodesBySubgroup[node.subgroupId].push(node);
      });

      const angles = sectionNodes.map((_, index) => resolveAngle(section.startAngle, section.endAngle, index, sectionNodes.length));

      section.subgroups.forEach((subgroup) => {
        const subgroupNodes = nodesBySubgroup[subgroup.id] || [];
        const subgroupAngles = subgroupNodes.map((node) => angles[sectionNodes.findIndex((item) => item.id === node.id)]);
        const subgroupAngle =
          subgroupAngles.length > 0
            ? subgroupAngles.reduce((sum, angle) => sum + angle, 0) / subgroupAngles.length
            : sectionMid;
        const subgroupAnchor = polar(246, subgroupAngle);

        subgroupNodes.forEach((node) => {
          const angle = angles[sectionNodes.findIndex((item) => item.id === node.id)];
          const dot = polar(360, angle);
          const labelPoint = polar(392, angle);
          const isLeft = angle > 180;
          const labelAngle = isLeft ? angle + 180 : angle;
          const textOffset = isLeft ? -12 : 12;
          const textPoint = {
            x: labelPoint.x + textOffset,
            y: labelPoint.y
          };
          const control1 = polar(186, (sectionMid + subgroupAngle) / 2);
          const control2 = polar(306, (subgroupAngle + angle) / 2);
          const branchPath = [
            `M ${center} ${center}`,
            `C ${control1.x} ${control1.y} ${innerAnchor.x} ${innerAnchor.y} ${subgroupAnchor.x} ${subgroupAnchor.y}`,
            `S ${control2.x} ${control2.y} ${dot.x} ${dot.y}`
          ].join(" ");

          layouts.set(node.id, {
            angle,
            branchPath,
            dot,
            id: node.id,
            isLeft,
            labelAngle,
            node,
            textPoint
          });
        });
      });
    });

    return layouts;
  }, [graph.nodes, graph.sections]);

  const subgroupLayouts = useMemo(() => {
    const layouts = new Map<string, SubgroupLayout>();

    graph.sections.forEach((section) => {
      const sectionNodes = graph.nodes
        .filter((node) => node.sectionId === section.id)
        .sort((left, right) => left.ringOrder - right.ringOrder);

      const angles = sectionNodes.map((_, index) => resolveAngle(section.startAngle, section.endAngle, index, sectionNodes.length));

      section.subgroups.forEach((subgroup) => {
        const subgroupNodes = sectionNodes.filter((node) => node.subgroupId === subgroup.id);
        const subgroupAngles = subgroupNodes.map((node) => angles[sectionNodes.findIndex((item) => item.id === node.id)]);
        const angle =
          subgroupAngles.length > 0
            ? subgroupAngles.reduce((sum, item) => sum + item, 0) / subgroupAngles.length
            : sectorMidAngle(section.startAngle, section.endAngle);
        const labelPoint = polar(256, angle);
        const isLeft = angle > 180;

        layouts.set(subgroup.id, {
          angle,
          id: subgroup.id,
          isLeft,
          labelAngle: isLeft ? angle + 180 : angle,
          subgroupDescription: subgroup.description,
          subgroupTitle: subgroup.title,
          textPoint: labelPoint
        });
      });
    });

    return layouts;
  }, [graph.nodes, graph.sections]);

  const orbitDots = useMemo(
    () =>
      Array.from({ length: 60 }, (_, index) => {
        const angle = index * 6;
        return polar(332, angle);
      }),
    []
  );

  const selectedNode = selectedSlug ? graph.nodes.find((node) => node.slug === selectedSlug) || null : null;
  const selectedLesson = selectedNode ? lessonMap[selectedNode.slug] : null;
  const selectedSection = selectedNode ? sectionMap[selectedNode.sectionId] : null;

  return (
    <div className="atlas-shell">
      <div className="atlas-toolbar glass-card">
        <div className="atlas-toolbar__copy">
          <div className="eyebrow">🗺️ Живая карта мышления</div>
          <h3>Нажми на ветвь, чтобы открыть карточку искажения прямо поверх атласа.</h3>
          <p>
            Сначала видно четыре больших режима, в которых мозг чаще всего ошибается. Затем раскрываются подгруппы и
            уже внутри них конкретные искажения.
          </p>
        </div>

        <div className="atlas-toolbar__controls">
          <label className="atlas-search">
            <span>Поиск по карте</span>
            <div className="atlas-search__field">
              <Search size={16} />
              <input
                placeholder="Например, якорь, подтверждение, память"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
          </label>

          <div className="atlas-filter-list">
            <button
              className={activeSection === "all" ? "filter-pill filter-pill--active" : "filter-pill"}
              type="button"
              onClick={() => setActiveSection("all")}
            >
              Вся карта
            </button>
            {graph.sections.map((section) => (
              <button
                key={section.id}
                className={activeSection === section.id ? "filter-pill filter-pill--active" : "filter-pill"}
                type="button"
                onClick={() => setActiveSection(section.id)}
              >
                {section.shortTitle}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card radial-atlas-frame">
        <div className="radial-atlas-scroll">
          <svg
            aria-labelledby="atlas-title atlas-desc"
            className="radial-atlas-svg"
            role="img"
            viewBox={`0 0 ${svgSize} ${svgSize}`}
          >
            <title id="atlas-title">Радиальный атлас когнитивных искажений</title>
            <desc id="atlas-desc">
              В центре — ядро карты, по кругу — четыре сектора когнитивных искажений, их подгруппы и конкретные
              искажения, расположенные на внешнем радиусе.
            </desc>

            <circle className="atlas-orbit atlas-orbit--outer" cx={center} cy={center} r={394} />
            <circle className="atlas-orbit atlas-orbit--middle" cx={center} cy={center} r={332} />
            <circle className="atlas-orbit atlas-orbit--inner" cx={center} cy={center} r={248} />
            <circle className="atlas-orbit atlas-orbit--core" cx={center} cy={center} r={144} />

            {orbitDots.map((dotPoint, index) => (
              <circle key={`orbit-dot-${index}`} className="atlas-orbit-dot" cx={dotPoint.x} cy={dotPoint.y} r={2.4} />
            ))}

            {graph.sections.map((section) => {
              const color = colorMap[section.colorToken];
              const titleAngle = sectorMidAngle(section.startAngle, section.endAngle);
              const titlePoint = polar(472, titleAngle);
              const titleLines = wrapLines(section.title, 23);
              const sectionSelected = activeSection === "all" || activeSection === section.id;
              const sectionOpacity = sectionSelected ? 1 : 0.22;
              const calloutAngles = section.callouts.map((_, index) =>
                resolveAngle(section.startAngle, section.endAngle, index, section.callouts.length, 14)
              );

              return (
                <g key={section.id} style={{ opacity: sectionOpacity }}>
                  <path
                    className="atlas-sector-arc"
                    d={describeArc(402, section.startAngle, section.endAngle)}
                    style={{ stroke: color.ring }}
                  />

                  {calloutAngles.map((angle, index) => {
                    const dotPoint = polar(430, angle);
                    const textPoint = polar(500, angle);
                    const align = angle > 180 ? "end" : "start";
                    const shift = angle > 180 ? -16 : 16;
                    const lines = wrapLines(section.callouts[index], 24);

                    return (
                      <g key={`${section.id}-callout-${index}`} className="atlas-callout">
                        <circle cx={dotPoint.x} cy={dotPoint.y} fill={color.dot} r={6.5} />
                        <line
                          stroke={color.ring}
                          strokeOpacity="0.56"
                          x1={dotPoint.x}
                          x2={textPoint.x + shift * 0.6}
                          y1={dotPoint.y}
                          y2={textPoint.y}
                        />
                        <text fill={color.text} textAnchor={align} x={textPoint.x + shift} y={textPoint.y}>
                          {lines.map((line, lineIndex) => (
                            <tspan
                              key={`${section.id}-${index}-${lineIndex}`}
                              dy={lineIndex === 0 ? 0 : 18}
                              x={textPoint.x + shift}
                            >
                              {line}
                            </tspan>
                          ))}
                        </text>
                      </g>
                    );
                  })}

                  <text
                    className="atlas-sector-title"
                    fill={color.text}
                    textAnchor={titleAngle > 180 ? "end" : "start"}
                    x={titlePoint.x + (titleAngle > 180 ? -12 : 12)}
                    y={titlePoint.y}
                  >
                    {titleLines.map((line, index) => (
                      <tspan
                        key={`${section.id}-${line}-${index}`}
                        dy={index === 0 ? 0 : 30}
                        x={titlePoint.x + (titleAngle > 180 ? -12 : 12)}
                      >
                        {line}
                      </tspan>
                    ))}
                  </text>
                </g>
              );
            })}

            {graph.sections.flatMap((section) =>
              section.subgroups.map((subgroup) => {
                const layout = subgroupLayouts.get(subgroup.id);
                const color = colorMap[section.colorToken];

                if (!layout) {
                  return null;
                }

                const selected = activeSection === "all" || section.id === activeSection;
                const opacity = selected ? 1 : 0.24;

                return (
                  <g key={subgroup.id} style={{ opacity }}>
                    <circle className="atlas-subgroup-dot" cx={layout.textPoint.x} cy={layout.textPoint.y} fill={color.dot} r={3.2} />
                    <g transform={`translate(${layout.textPoint.x} ${layout.textPoint.y}) rotate(${layout.labelAngle})`}>
                      <text
                        className="atlas-subgroup-label"
                        fill={color.text}
                        textAnchor={layout.isLeft ? "end" : "start"}
                        x={layout.isLeft ? -12 : 12}
                        y={-4}
                      >
                        {layout.subgroupTitle}
                      </text>
                      <text
                        className="atlas-subgroup-description"
                        fill={color.text}
                        textAnchor={layout.isLeft ? "end" : "start"}
                        x={layout.isLeft ? -12 : 12}
                        y={16}
                      >
                        {wrapLines(layout.subgroupDescription, 26).map((line, index) => (
                          <tspan key={`${layout.id}-${line}-${index}`} dy={index === 0 ? 0 : 14} x={layout.isLeft ? -12 : 12}>
                            {line}
                          </tspan>
                        ))}
                      </text>
                    </g>
                  </g>
                );
              })
            )}

            {graph.nodes.map((node) => {
              const layout = nodeLayouts.get(node.id);

              if (!layout) {
                return null;
              }

              const color = colorMap[node.colorToken];
              const visible = matchesNode(node);
              const selected = selectedSlug === node.slug;
              const opacity = visible ? 1 : 0.12;

              return (
                <g
                  key={node.id}
                  className="atlas-node-group"
                  style={{ opacity }}
                  onClick={() => setSelectedSlug(node.slug)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedSlug(node.slug);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <path className="atlas-branch" d={layout.branchPath} style={{ stroke: color.ring }} />
                  <circle className="atlas-dot-glow" cx={layout.dot.x} cy={layout.dot.y} fill={color.glow} r={selected ? 17 : 12} />
                  <circle
                    className="atlas-dot"
                    cx={layout.dot.x}
                    cy={layout.dot.y}
                    fill={selected ? "#fffaf0" : color.dot}
                    r={selected ? 6.8 : 4.8}
                    stroke={selected ? color.ring : "transparent"}
                    strokeWidth={selected ? 2.4 : 0}
                  />

                  <g transform={`translate(${layout.textPoint.x} ${layout.textPoint.y}) rotate(${layout.labelAngle})`}>
                    <text
                      className={selected ? "atlas-node-label atlas-node-label--selected" : "atlas-node-label"}
                      fill={color.text}
                      textAnchor={layout.isLeft ? "end" : "start"}
                      y={5}
                    >
                      {node.title}
                    </text>
                  </g>
                </g>
              );
            })}

            <g className="atlas-core">
              <circle className="atlas-core__halo" cx={center} cy={center} r={122} />
              <circle className="atlas-core__disk" cx={center} cy={center} r={102} />
              <foreignObject height="126" width="126" x={center - 63} y={center - 72}>
                <div className="atlas-core__icon">
                  <BrainCircuit size={54} strokeWidth={1.7} />
                </div>
              </foreignObject>
              <text className="atlas-core__title" textAnchor="middle" x={center} y={center + 56}>
                Когнитивные искажения
              </text>
              <text className="atlas-core__subtitle" textAnchor="middle" x={center} y={center + 82}>
                4 режима • 160+ уроков
              </text>
            </g>
          </svg>
        </div>
      </div>

      {selectedNode && selectedLesson && selectedSection ? (
        <div className="atlas-modal-backdrop" onClick={() => setSelectedSlug(null)} role="presentation">
          <article
            className="glass-card atlas-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="atlas-modal-title"
          >
            <button aria-label="Закрыть карточку" className="atlas-modal__close" type="button" onClick={() => setSelectedSlug(null)}>
              <X size={18} />
            </button>

            <div className="eyebrow">{selectedSection.title}</div>
            <h3 id="atlas-modal-title">{selectedLesson.title}</h3>
            <p className="atlas-modal__lead">{selectedLesson.shortText}</p>
            <p className="atlas-modal__text">{selectedLesson.fullText}</p>

            <div className="atlas-modal__chips">
              {selectedLesson.aiSuggestions.map((suggestion) => (
                <span key={suggestion} className="atlas-chip">
                  {suggestion}
                </span>
              ))}
            </div>

            <div className="atlas-modal__actions">
              <Link className="primary-button" href={`/biases/${selectedLesson.slug}`}>
                Читать карточку
              </Link>
              <a className="ghost-button" href={telegramDeepLink("start")}>
                Пойти в курс
              </a>
            </div>
          </article>
        </div>
      ) : null}
    </div>
  );
}
