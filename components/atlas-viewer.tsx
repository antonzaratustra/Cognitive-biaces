"use client";

import Link from "next/link";
import { BrainCircuit, LocateFixed, Minus, Plus, Search, X } from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

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

type BranchLayout = {
  angle: number;
  id: string;
  isLeft: boolean;
  labelLines: string[];
  labelPoint: Point;
  splitPoint: Point;
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

type SectionLayout = {
  anchorPoint: Point;
  centerAngle: number;
  endAngle: number;
  id: string;
  startAngle: number;
  titleDot: Point;
  titleLines: string[];
  titlePoint: Point;
};

type ViewTransform = {
  scale: number;
  x: number;
  y: number;
};

const sectionCornerClasses = [
  "atlas-section-badge atlas-section-badge--top-left",
  "atlas-section-badge atlas-section-badge--top-right",
  "atlas-section-badge atlas-section-badge--bottom-right",
  "atlas-section-badge atlas-section-badge--bottom-left"
] as const;

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

const svgSize = 1960;
const center = svgSize / 2;
const sectionQuadrantAngles = [315, 45, 135, 225];
const sectionSpan = 88;
const sectionPadding = 2.5;
const subgroupGap = 0.85;
const sectionAnchorRadius = 300;
const subgroupSplitRadius = 560;
const nodeOrbitRadius = 760;
const subgroupDotRadius = 960;
const branchLabelRadius = 1000;
const outerArcRadius = 1040;
const sectionTitleRadius = 540;
const maxScale = 2.6;

type DragState = {
  moved: boolean;
  pointerId: number | null;
  startClient: Point;
  startTransform: ViewTransform;
};

function normalizeAngle(value: number) {
  return ((value % 360) + 360) % 360;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
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

function signedAngleDelta(from: number, to: number) {
  return ((to - from + 540) % 360) - 180;
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

function pointFrom(point: Point, angle: number, distance: number): Point {
  const radians = ((angle - 90) * Math.PI) / 180;

  return {
    x: Number((point.x + Math.cos(radians) * distance).toFixed(3)),
    y: Number((point.y + Math.sin(radians) * distance).toFixed(3))
  };
}

function controlBetween(start: Point, end: Point, bend: number): Point {
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.hypot(dx, dy) || 1;

  return {
    x: Number((midX - (dy / length) * bend).toFixed(3)),
    y: Number((midY + (dx / length) * bend).toFixed(3))
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

function getFitTransform(width: number, height: number): ViewTransform {
  const padding = 28;
  const safeWidth = Math.max(width - padding * 2, 320);
  const safeHeight = Math.max(height - padding * 2, 320);
  const scale = Math.min(safeWidth / svgSize, safeHeight / svgSize, 1) * 0.96;

  return {
    scale: Number(scale.toFixed(4)),
    x: Number(((width - svgSize * scale) / 2).toFixed(3)),
    y: Number(((height - svgSize * scale) / 2).toFixed(3))
  };
}

export function AtlasViewer({ graph, initialSlug = null, lessons }: AtlasViewerProps) {
  const [activeSection, setActiveSection] = useState<string>("all");
  const [hoveredAtlasLabel, setHoveredAtlasLabel] = useState<string | null>(null);
  const [hoveredControlHint, setHoveredControlHint] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedSlug, setSelectedSlug] = useState<string | null>(initialSlug);
  const [viewTransform, setViewTransform] = useState<ViewTransform>({ scale: 1, x: 0, y: 0 });
  const deferredQuery = useDeferredValue(query);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef<DragState>({
    moved: false,
    pointerId: null,
    startClient: { x: 0, y: 0 },
    startTransform: { scale: 1, x: 0, y: 0 }
  });
  const minScaleRef = useRef(0.42);
  const hasManualViewRef = useRef(false);
  const suppressNodeClickRef = useRef(false);

  useEffect(() => {
    setSelectedSlug(initialSlug);
  }, [initialSlug]);

  useEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    const syncViewport = (force = false) => {
      const rect = viewport.getBoundingClientRect();

      if (rect.width === 0 || rect.height === 0) {
        return;
      }

      const fitTransform = getFitTransform(rect.width, rect.height);
      minScaleRef.current = Math.max(Math.min(fitTransform.scale * 0.78, 0.72), 0.36);

      if (force || !hasManualViewRef.current) {
        setViewTransform(fitTransform);
      }
    };

    syncViewport(true);

    const observer = new ResizeObserver(() => syncViewport());
    observer.observe(viewport);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    const handleNativeWheel = (event: WheelEvent) => {
      event.preventDefault();

      if (!(event.ctrlKey || event.metaKey)) {
        hasManualViewRef.current = true;

        setViewTransform((current) => ({
          ...current,
          x: Number((current.x - event.deltaX).toFixed(3)),
          y: Number((current.y - event.deltaY).toFixed(3))
        }));
        return;
      }

      const rect = viewport.getBoundingClientRect();
      const originX = event.clientX - rect.left;
      const originY = event.clientY - rect.top;
      const zoomFactor = Math.exp(-event.deltaY * 0.0016);

      hasManualViewRef.current = true;

      setViewTransform((current) => {
        const scale = clamp(current.scale * zoomFactor, minScaleRef.current, maxScale);

        if (scale === current.scale) {
          return current;
        }

        const stageX = (originX - current.x) / current.scale;
        const stageY = (originY - current.y) / current.scale;

        return {
          scale,
          x: Number((originX - stageX * scale).toFixed(3)),
          y: Number((originY - stageY * scale).toFixed(3))
        };
      });
    };

    viewport.addEventListener("wheel", handleNativeWheel, { passive: false });

    return () => viewport.removeEventListener("wheel", handleNativeWheel);
  }, []);

  const orderedSections = useMemo(
    () => [...graph.sections].sort((left, right) => left.sortOrder - right.sortOrder),
    [graph.sections]
  );
  const sectionMap = useMemo(() => getSectionMap(graph.sections), [graph.sections]);
  const lessonMap = useMemo(() => Object.fromEntries(lessons.map((lesson) => [lesson.slug, lesson])), [lessons]);
  const normalizedQuery = deferredQuery.trim().toLowerCase();

  const visibleNodeIds = useMemo(() => {
    return new Set(
      graph.nodes
        .filter((node) => {
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
        })
        .map((node) => node.id)
    );
  }, [activeSection, graph.nodes, lessonMap, normalizedQuery, sectionMap]);

  const atlasLayout = useMemo(() => {
    const sectionLayouts = new Map<string, SectionLayout>();
    const branchLayouts = new Map<string, BranchLayout>();
    const nodeLayouts = new Map<string, NodeLayout>();

    orderedSections.forEach((section, sectionIndex) => {
        const centerAngle = sectionQuadrantAngles[sectionIndex % sectionQuadrantAngles.length];
        const rawSectionStart = centerAngle - sectionSpan / 2;
        const rawSectionEnd = centerAngle + sectionSpan / 2;
        const sectionAnchor = polar(sectionAnchorRadius, centerAngle);
        const titleDot = polar(outerArcRadius, centerAngle);
        const titlePoint = polar(sectionTitleRadius, centerAngle);
        const sectionNodes = graph.nodes
          .filter((node) => node.sectionId === section.id)
          .sort((left, right) => left.ringOrder - right.ringOrder);
        const nodesBySubgroup = Object.fromEntries(section.subgroups.map((subgroup) => [subgroup.id, [] as AtlasNode[]]));

        sectionNodes.forEach((node) => {
          if (!nodesBySubgroup[node.subgroupId]) {
            nodesBySubgroup[node.subgroupId] = [];
          }

          nodesBySubgroup[node.subgroupId].push(node);
        });

        sectionLayouts.set(section.id, {
          anchorPoint: sectionAnchor,
          centerAngle,
          endAngle: rawSectionEnd,
          id: section.id,
          startAngle: rawSectionStart,
          titleDot,
          titleLines: wrapLines(section.title, 22),
          titlePoint
        });

        const branchGroups = section.subgroups.map((subgroup, subgroupIndex) => ({
          label: section.callouts[subgroupIndex] ?? subgroup.title,
          nodes: (nodesBySubgroup[subgroup.id] || []).sort((left, right) => left.ringOrder - right.ringOrder),
          subgroup
        }));
        const totalUnits = branchGroups.reduce((sum, branch) => sum + Math.max(branch.nodes.length, 1), 0) || branchGroups.length || 1;
        const totalGap = subgroupGap * Math.max(branchGroups.length - 1, 0);
        const usableSpan = Math.max(sectionSpan - sectionPadding * 2 - totalGap, branchGroups.length || 1);
        let traveled = 0;

        branchGroups.forEach((branch) => {
          const branchUnits = Math.max(branch.nodes.length, 1);
          const branchSpan = usableSpan * (branchUnits / totalUnits);
          const branchStart = rawSectionStart + sectionPadding + traveled;
          const branchEnd = branchStart + branchSpan;
          const branchAngle = sectorMidAngle(branchStart, branchEnd);
          const splitPoint = polar(subgroupSplitRadius, branchAngle);
          const isLeft = branchAngle > 180;

          branchLayouts.set(branch.subgroup.id, {
            angle: branchAngle,
            id: branch.subgroup.id,
            isLeft,
            labelLines: wrapLines(branch.label, 24),
            labelPoint: polar(branchLabelRadius, branchAngle),
            splitPoint: polar(subgroupSplitRadius, branchAngle)
          });

          const nodeAngles = branch.nodes.map((_, nodeIndex) =>
            resolveAngle(branchStart, branchEnd, nodeIndex, branch.nodes.length, branch.nodes.length <= 1 ? 0 : 2)
          );

          branch.nodes.forEach((node, nodeIndex) => {
            const angle = nodeAngles[nodeIndex];
            const dot = polar(nodeOrbitRadius, angle);
            // textPoint дальше от центра чем точка, текст будет НАЧИНАТЬСЯ у точки
            const textPoint = pointFrom(dot, angle, 26);
            const normalizedAngle = normalizeAngle(angle);
            // Левая сторона: 90° - 270°
            const isLeftSide = normalizedAngle > 90 && normalizedAngle < 270;
            const branchTurn = signedAngleDelta(centerAngle, branchAngle);
            const nodeTurn = signedAngleDelta(branchAngle, angle);
            const firstControl = controlBetween(sectionAnchor, splitPoint, clamp(branchTurn * 1.2, -52, 52));
            const secondControl = controlBetween(splitPoint, dot, clamp(nodeTurn * 1.4, -48, 48));
            
            // Базовый угол: тангенциально к окружности
            // Для верхней половины: -90° (по часовой), для нижней: +90° (против)
            const isUpperHalf = dot.y < center;
            const baseLabelAngle = normalizeAngle(normalizedAngle + (isUpperHalf ? -90 : 90));
            
            // Для левой стороны поворачиваем на 180° чтобы текст читался
            const labelAngle = isLeftSide ? normalizeAngle(baseLabelAngle + 180) : baseLabelAngle;
            
            const branchPath = [
              `M ${sectionAnchor.x} ${sectionAnchor.y}`,
              `Q ${firstControl.x} ${firstControl.y} ${splitPoint.x} ${splitPoint.y}`,
              `Q ${secondControl.x} ${secondControl.y} ${dot.x} ${dot.y}`
            ].join(" ");

            nodeLayouts.set(node.id, {
              angle: normalizedAngle,
              branchPath,
              dot,
              id: node.id,
              isLeft: isLeftSide,
              labelAngle,
              node,
              textPoint
            });
          });

          traveled += branchSpan + subgroupGap;
        });
      });

    return {
      branchLayouts,
      nodeLayouts,
      sectionLayouts
    };
  }, [graph.nodes, orderedSections]);

  const orbitDots = useMemo(
    () =>
      Array.from({ length: 72 }, (_, index) => {
        const angle = index * 5;
        return polar(outerArcRadius - 18, angle);
      }),
    []
  );

  const selectedNode = selectedSlug ? graph.nodes.find((node) => node.slug === selectedSlug) || null : null;
  const selectedLesson = selectedNode ? lessonMap[selectedNode.slug] : null;
  const selectedSection = selectedNode ? sectionMap[selectedNode.sectionId] : null;

  const handleNodeSelect = (slug: string) => {
    if (suppressNodeClickRef.current) {
      suppressNodeClickRef.current = false;
      return;
    }

    setSelectedSlug(slug);
  };

  const zoomAtPoint = (nextScale: number, clientX: number, clientY: number) => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    const rect = viewport.getBoundingClientRect();
    const originX = clientX - rect.left;
    const originY = clientY - rect.top;

    hasManualViewRef.current = true;

    setViewTransform((current) => {
      const scale = clamp(nextScale, minScaleRef.current, maxScale);

      if (scale === current.scale) {
        return current;
      }

      const stageX = (originX - current.x) / current.scale;
      const stageY = (originY - current.y) / current.scale;

      return {
        scale,
        x: Number((originX - stageX * scale).toFixed(3)),
        y: Number((originY - stageY * scale).toFixed(3))
      };
    });
  };

  const handleZoomStep = (multiplier: number) => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    const rect = viewport.getBoundingClientRect();
    zoomAtPoint(viewTransform.scale * multiplier, rect.left + rect.width / 2, rect.top + rect.height / 2);
  };

  const handleResetView = () => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    hasManualViewRef.current = false;
    setViewTransform(getFitTransform(viewport.clientWidth, viewport.clientHeight));
  };

  const clearDragState = () => {
    dragStateRef.current = {
      moved: false,
      pointerId: null,
      startClient: { x: 0, y: 0 },
      startTransform: viewTransform
    };
    setIsPanning(false);
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) {
      return;
    }

    const target = event.target as HTMLElement;

    if (target.closest("button, a, input, label")) {
      return;
    }

    suppressNodeClickRef.current = false;
    dragStateRef.current = {
      moved: false,
      pointerId: event.pointerId,
      startClient: { x: event.clientX, y: event.clientY },
      startTransform: viewTransform
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsPanning(true);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current;

    if (dragState.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - dragState.startClient.x;
    const deltaY = event.clientY - dragState.startClient.y;

    if (!dragState.moved && Math.hypot(deltaX, deltaY) < 4) {
      return;
    }

    dragState.moved = true;
    hasManualViewRef.current = true;

    setViewTransform((current) => ({
      ...current,
      x: Number((dragState.startTransform.x + deltaX).toFixed(3)),
      y: Number((dragState.startTransform.y + deltaY).toFixed(3))
    }));
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current;

    if (dragState.pointerId !== event.pointerId) {
      return;
    }

    if (dragState.moved) {
      suppressNodeClickRef.current = true;
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    clearDragState();
  };

  const atlasCanvas = useMemo(
    () => (
      <svg
        aria-labelledby="atlas-title atlas-desc"
        className="radial-atlas-svg"
        role="img"
        viewBox={`0 0 ${svgSize} ${svgSize}`}
      >
        <title id="atlas-title">Радиальный атлас когнитивных искажений</title>
        <desc id="atlas-desc">
          В центре — ядро карты, на первом кольце — четыре режима мышления, на втором — ветви подгрупп, на третьем —
          конкретные когнитивные искажения, а названия больших разделов закреплены по углам области просмотра.
        </desc>

        <circle className="atlas-orbit atlas-orbit--outer" cx={center} cy={center} r={outerArcRadius} />
        <circle className="atlas-orbit atlas-orbit--middle" cx={center} cy={center} r={nodeOrbitRadius} />
        <circle className="atlas-orbit atlas-orbit--inner" cx={center} cy={center} r={subgroupSplitRadius} />
        <circle className="atlas-orbit atlas-orbit--core" cx={center} cy={center} r={sectionAnchorRadius} />

        {orbitDots.map((dotPoint, index) => (
          <circle key={`orbit-dot-${index}`} className="atlas-orbit-dot" cx={dotPoint.x} cy={dotPoint.y} r={2.2} />
        ))}

        {graph.sections.map((section) => {
          const color = colorMap[section.colorToken];
          const sectionLayout = atlasLayout.sectionLayouts.get(section.id);
          const sectionSelected = activeSection === "all" || activeSection === section.id;
          const sectionOpacity = sectionSelected ? 1 : 0.22;

          if (!sectionLayout) {
            return null;
          }

          const sectionLineStart = polar(132, sectionLayout.centerAngle);

          return (
            <g key={section.id} style={{ opacity: sectionOpacity }}>
              <path
                className="atlas-sector-arc"
                d={describeArc(outerArcRadius, sectionLayout.startAngle, sectionLayout.endAngle)}
                style={{ stroke: color.ring }}
              />
              <line
                className="atlas-section-connector"
                stroke={color.ring}
                strokeOpacity="0.42"
                x1={sectionLineStart.x}
                x2={sectionLayout.anchorPoint.x}
                y1={sectionLineStart.y}
                y2={sectionLayout.anchorPoint.y}
              />
              <circle
                className="atlas-section-anchor"
                cx={sectionLayout.anchorPoint.x}
                cy={sectionLayout.anchorPoint.y}
                fill={color.dot}
                r={5.4}
                onPointerEnter={() => setHoveredAtlasLabel(section.title)}
                onPointerLeave={() => setHoveredAtlasLabel((current) => (current === section.title ? null : current))}
                style={{ cursor: 'pointer' }}
              />
              <circle className="atlas-section-title-dot" cx={sectionLayout.titleDot.x} cy={sectionLayout.titleDot.y} fill={color.dot} r={4.8} />
            </g>
          );
        })}

        {graph.sections.flatMap((section) =>
          section.subgroups.map((subgroup) => {
            const layout = atlasLayout.branchLayouts.get(subgroup.id);
            const color = colorMap[section.colorToken];

            if (!layout) {
              return null;
            }

            const selected = activeSection === "all" || section.id === activeSection;
            const opacity = selected ? 1 : 0.24;
            const textAnchor = layout.isLeft ? "end" : "start";
            const textX = layout.labelPoint.x + (layout.isLeft ? -14 : 14);
            const textStartY = layout.labelPoint.y - ((layout.labelLines.length - 1) * 11);

            return (
              <g
                key={subgroup.id}
                style={{ opacity }}
                onPointerEnter={() => setHoveredAtlasLabel(subgroup.title)}
                onPointerLeave={() => setHoveredAtlasLabel((current) => (current === subgroup.title ? null : current))}
              >
                <circle className="atlas-subgroup-split-dot" cx={layout.splitPoint.x} cy={layout.splitPoint.y} fill={color.dot} r={4} />
                <circle className="atlas-subgroup-dot" cx={layout.labelPoint.x} cy={layout.labelPoint.y} fill={color.dot} r={6} />
                <line
                  className="atlas-branch-label-stem"
                  stroke={color.ring}
                  strokeOpacity="0.5"
                  x1={layout.splitPoint.x}
                  x2={layout.labelPoint.x}
                  y1={layout.splitPoint.y}
                  y2={layout.labelPoint.y}
                />
                <text className="atlas-branch-label" fill={color.text} textAnchor={textAnchor} x={textX} y={textStartY}>
                  {layout.labelLines.map((line, index) => (
                    <tspan key={`${layout.id}-${line}-${index}`} dy={index === 0 ? 0 : 22} x={textX}>
                      {line}
                    </tspan>
                  ))}
                </text>
                <circle className="atlas-subgroup-hit" cx={layout.labelPoint.x} cy={layout.labelPoint.y} fill="transparent" r={16} />
              </g>
            );
          })
        )}

        {graph.nodes.map((node) => {
          const layout = atlasLayout.nodeLayouts.get(node.id);

          if (!layout) {
            return null;
          }

          const color = colorMap[node.colorToken];
          const visible = visibleNodeIds.has(node.id);
          const selected = selectedSlug === node.slug;
          const opacity = visible ? 1 : 0.12;
          const isLowerHalf = layout.dot.y > center;
          const nodeLabelAngle = isLowerHalf ? normalizeAngle(layout.labelAngle + 180) : layout.labelAngle;

          return (
            <g key={node.id} className="atlas-node-group" style={{ opacity }}>
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
                  dominantBaseline="middle"
                  fill={color.text}
                  onPointerEnter={() => setHoveredAtlasLabel(node.title)}
                  onPointerLeave={() => setHoveredAtlasLabel((current) => (current === node.title ? null : current))}
                  textAnchor="start"
                  x={0}
                  y={0}
                >
                  {node.title}
                </text>
              </g>

              <circle
                aria-label={node.title}
                className="atlas-node-hit"
                cx={layout.dot.x}
                cy={layout.dot.y}
                fill="transparent"
                onClick={() => handleNodeSelect(node.slug)}
                onFocus={() => setHoveredAtlasLabel(node.title)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleNodeSelect(node.slug);
                  }
                }}
                onPointerEnter={() => setHoveredAtlasLabel(node.title)}
                onPointerLeave={() => setHoveredAtlasLabel((current) => (current === node.title ? null : current))}
                onPointerDownCapture={(event) => event.stopPropagation()}
                onBlur={() => setHoveredAtlasLabel((current) => (current === node.title ? null : current))}
                r={16}
                role="button"
                tabIndex={visible ? 0 : -1}
              />
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
          <text className="atlas-core__title" textAnchor="middle" x={center} y={center + 62}>
            Когнитивные искажения
          </text>
          <text className="atlas-core__subtitle" textAnchor="middle" x={center} y={center + 96}>
            4 режима • 160+ уроков
          </text>
        </g>
      </svg>
    ),
    [activeSection, atlasLayout.branchLayouts, atlasLayout.nodeLayouts, atlasLayout.sectionLayouts, graph.nodes, graph.sections, orbitDots, selectedSlug, visibleNodeIds]
  );

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
                placeholder="Например, якорь, пик, нарратив, статус-кво, доступность"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
          </label>

          <div className="atlas-filter-list">
            {graph.sections.map((section) => (
              <button
                key={section.id}
                className={`filter-pill filter-pill--${section.colorToken}${activeSection === section.id ? ' filter-pill--active' : ''}`}
                type="button"
                onClick={() => setActiveSection(section.id)}
              >
                {section.shortTitle}
              </button>
            ))}
            <button
              className={activeSection === "all" ? "filter-pill filter-pill--active" : "filter-pill"}
              type="button"
              onClick={() => setActiveSection("all")}
            >
              Вся карта
            </button>
          </div>
        </div>
      </div>

      <div className="glass-card radial-atlas-frame">
        <div
          ref={viewportRef}
          className={isPanning ? "radial-atlas-viewport radial-atlas-viewport--panning" : "radial-atlas-viewport"}
          onPointerCancel={handlePointerUp}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <div className="atlas-section-badges" aria-hidden="true">
            {orderedSections.map((section, sectionIndex) => {
              const color = colorMap[section.colorToken];
              const sectionLayout = atlasLayout.sectionLayouts.get(section.id);
              const sectionSelected = activeSection === "all" || activeSection === section.id;

              if (!sectionLayout) {
                return null;
              }

              return (
                <div
                  key={`badge-${section.id}`}
                  className={sectionCornerClasses[sectionIndex % sectionCornerClasses.length]}
                  style={{ opacity: sectionSelected ? 1 : 0.42 }}
                >
                  <span className="atlas-section-badge__dot" style={{ backgroundColor: color.dot }} />
                  <div className="atlas-section-badge__title">
                    {sectionLayout.titleLines.map((line, lineIndex) => (
                      <span key={`${section.id}-badge-${lineIndex}`}>{line}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className={hoveredAtlasLabel ? "glass-card atlas-hover-label atlas-hover-label--visible" : "glass-card atlas-hover-label"}>
            {hoveredAtlasLabel ?? "Наведи на точку или подпись, чтобы увидеть название"}
          </div>

          <div className="glass-card atlas-canvas-hud">
            <button aria-label="Отдалить атлас" type="button" onClick={() => handleZoomStep(1 / 1.16)}>
              <Minus size={15} />
            </button>
            <span>{Math.round(viewTransform.scale * 100)}%</span>
            <button aria-label="Приблизить атлас" type="button" onClick={() => handleZoomStep(1.16)}>
              <Plus size={15} />
            </button>
            <button aria-label="Сбросить положение атласа" type="button" onClick={handleResetView}>
              <LocateFixed size={15} />
            </button>
          </div>

          <div className="glass-card atlas-controls-hint">
            <div 
              className="atlas-controls-hint__item"
              onMouseEnter={() => setHoveredControlHint("Перетаскивание мышью")}
              onMouseLeave={() => setHoveredControlHint(null)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/>
                <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"/>
                <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/>
                <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>
              </svg>
            </div>
            <div 
              className="atlas-controls-hint__item"
              onMouseEnter={() => setHoveredControlHint("Масштаб: Cmd / Ctrl + колесо")}
              onMouseLeave={() => setHoveredControlHint(null)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 2v4"/>
                <path d="M12 18v4"/>
                <path d="M2 12h4"/>
                <path d="M18 12h4"/>
              </svg>
            </div>
          </div>

          {hoveredControlHint && (
            <div className="glass-card atlas-controls-tooltip">
              {hoveredControlHint}
            </div>
          )}

          <div
            className="radial-atlas-stage"
            style={{
              transform: `translate(${viewTransform.x}px, ${viewTransform.y}px) scale(${viewTransform.scale})`
            }}
          >
            {atlasCanvas}
          </div>
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
