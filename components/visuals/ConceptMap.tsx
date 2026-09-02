"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as d3 from "d3";

type NodeType = {
  id: string;
  label: string;
  description?: string;
};

type EdgeType = {
  from: string;
  to: string;
  label?: string;
};

interface ConceptMapData {
  nodes: NodeType[];
  edges: EdgeType[];
  title?: string;
}

// Fixed design canvas — scaled to fit the container, so the layout math
// below (radii, card sizes, force strengths) never has to think about
// the viewport.
const DESIGN_W = 900;
const DESIGN_H = 600;

type Tier = { bg: string; border: string; text: string; dot: string; label: string };

// Depth in the concept graph maps to a tier. Main concept is depth 0.
const TIERS: Tier[] = [
  { bg: "#EEF2FF", border: "#6366F1", text: "#3730A3", dot: "#6366F1", label: "Main concept" },
  { bg: "#EFF6FF", border: "#3B82F6", text: "#1E40AF", dot: "#3B82F6", label: "Major idea" },
  { bg: "#ECFEFF", border: "#06B6D4", text: "#155E75", dot: "#06B6D4", label: "Supporting concept" },
  { bg: "#FFF7ED", border: "#F59E0B", text: "#92400E", dot: "#F59E0B", label: "Detail" },
];
const tierFor = (depth: number) => TIERS[Math.min(depth, TIERS.length - 1)];

const EDGE_COLOR = "#CBD5E1";
const EDGE_ACTIVE = "#94A3B8";

type D3Node = d3.SimulationNodeDatum & NodeType & { depth: number; hasChildren: boolean };
type D3Link = d3.SimulationLinkDatum<D3Node> & { label?: string };

const cardSize = (depth: number) => (depth === 0 ? { w: 200, h: 64 } : { w: 168, h: 56 });
const radiusForDepth = (depth: number) => (depth === 0 ? 0 : 90 + depth * 100);

export function ConceptMap({ data }: { data: ConceptMapData }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [selectedNode, setSelectedNode] = useState<NodeType | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  // Keep the fixed-size design canvas scaled to fill the container's width,
  // so the component stays usable from phone widths up to a wide desktop.
  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / DESIGN_W);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const toggleCollapse = useCallback((id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  useEffect(() => {
    if (!svgRef.current || !overlayRef.current) return;

    // ---- Derive hierarchy from the graph itself (no schema change needed) ----
    // Root = the node nothing points to. Depth = BFS distance from root.
    const inDegree = new Map<string, number>();
    data.nodes.forEach((n) => inDegree.set(n.id, 0));
    data.edges.forEach((e) => inDegree.set(e.to, (inDegree.get(e.to) || 0) + 1));
    const root = data.nodes.find((n) => (inDegree.get(n.id) || 0) === 0) || data.nodes[0];

    const undirectedAdjacency = new Map<string, string[]>();
    const childrenMap = new Map<string, string[]>();
    data.nodes.forEach((n) => {
      undirectedAdjacency.set(n.id, []);
      childrenMap.set(n.id, []);
    });
    data.edges.forEach((e) => {
      undirectedAdjacency.get(e.from)?.push(e.to);
      undirectedAdjacency.get(e.to)?.push(e.from);
      childrenMap.get(e.from)?.push(e.to);
    });

    const depthMap = new Map<string, number>();
    if (root) {
      depthMap.set(root.id, 0);
      const queue = [root.id];
      while (queue.length) {
        const current = queue.shift()!;
        const d = depthMap.get(current)!;
        for (const next of undirectedAdjacency.get(current) || []) {
          if (!depthMap.has(next)) {
            depthMap.set(next, d + 1);
            queue.push(next);
          }
        }
      }
    }
    data.nodes.forEach((n) => {
      if (!depthMap.has(n.id)) depthMap.set(n.id, 1);
    });

    // ---- Collapse: hide descendants of any collapsed node ----
    const hidden = new Set<string>();
    const hideDescendants = (id: string) => {
      for (const child of childrenMap.get(id) || []) {
        if (!hidden.has(child)) {
          hidden.add(child);
          hideDescendants(child);
        }
      }
    };
    collapsed.forEach((id) => hideDescendants(id));

    const visibleNodes = data.nodes.filter((n) => !hidden.has(n.id));
    const visibleIds = new Set(visibleNodes.map((n) => n.id));
    const visibleEdges = data.edges.filter((e) => visibleIds.has(e.from) && visibleIds.has(e.to));

    const nodesData: D3Node[] = visibleNodes.map((n) => ({
      ...n,
      depth: depthMap.get(n.id) ?? 1,
      hasChildren: (childrenMap.get(n.id) || []).length > 0,
      x: undefined,
      y: undefined,
    }));
    const linksData: D3Link[] = visibleEdges.map((e) => ({
      source: e.from,
      target: e.to,
      label: e.label,
    }));

    const idOf = (end: string | D3Node) => (typeof end === "string" ? end : end.id);
    const neighborsOf = (id: string) => {
      const set = new Set<string>();
      linksData.forEach((l) => {
        const s = idOf(l.source as string | D3Node);
        const t = idOf(l.target as string | D3Node);
        if (s === id) set.add(t);
        if (t === id) set.add(s);
      });
      return set;
    };

    // ---- Force simulation: radial rings by depth keep the hierarchy
    // legible while still adapting to however many nodes sit on each ring ----
    const simulation = d3
      .forceSimulation(nodesData)
      .force(
        "link",
        d3
          .forceLink<D3Node, D3Link>(linksData)
          .id((d) => d.id)
          .distance((l) => {
            const s = l.source as D3Node;
            const t = l.target as D3Node;
            return Math.abs((t.depth ?? 1) - (s.depth ?? 0)) * 90 + 60;
          })
          .strength(0.5)
      )
      .force("charge", d3.forceManyBody().strength(-220))
      .force("radial", d3.forceRadial<D3Node>((d) => radiusForDepth(d.depth), DESIGN_W / 2, DESIGN_H / 2).strength(0.85))
      .force("collision", d3.forceCollide<D3Node>((d) => cardSize(d.depth).w / 2 + 14))
      .force("x", d3.forceX(DESIGN_W / 2).strength(0.02))
      .force("y", d3.forceY(DESIGN_H / 2).strength(0.02));

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${DESIGN_W} ${DESIGN_H}`).style("background", "transparent");

    svg
      .append("defs")
      .append("marker")
      .attr("id", "cm-arrow")
      .attr("viewBox", "0 0 10 10")
      .attr("refX", 9)
      .attr("refY", 5)
      .attr("markerWidth", 7)
      .attr("markerHeight", 7)
      .attr("orient", "auto-start-reverse")
      .append("path")
      .attr("d", "M0 0L10 5L0 10Z")
      .attr("fill", EDGE_COLOR);

    const zoomLayer = svg.append("g");

    const overlay = d3.select(overlayRef.current);
    overlay.selectAll("*").remove();
    const overlayInner = overlay
      .append("div")
      .style("position", "absolute")
      .style("inset", "0")
      .style("transform-origin", "0 0");

    // Pan/zoom the SVG layer, then mirror the exact same transform onto the
    // HTML card layer so both stay perfectly aligned.
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 2.2])
      .on("zoom", (event) => {
        zoomLayer.attr("transform", event.transform.toString());
        overlayInner.style(
          "transform",
          `translate(${event.transform.x}px, ${event.transform.y}px) scale(${event.transform.k})`
        );
      });
    svg.call(zoom);
    svg.on("dblclick.zoom", null);

    const selectedIdRef: { current: string | null } = { current: null };

    function applyHighlight(id: string | null) {
      if (!id) {
        cards.style("opacity", "1");
        link.attr("stroke", EDGE_COLOR).style("opacity", "1");
        return;
      }
      const neighbors = neighborsOf(id);
      cards.style("opacity", (d) => (d.id === id || neighbors.has(d.id) ? "1" : "0.35"));
      link
        .attr("stroke", (l) => {
          const s = idOf(l.source as string | D3Node);
          const t = idOf(l.target as string | D3Node);
          return s === id || t === id ? EDGE_ACTIVE : EDGE_COLOR;
        })
        .style("opacity", (l) => {
          const s = idOf(l.source as string | D3Node);
          const t = idOf(l.target as string | D3Node);
          return s === id || t === id ? "1" : "0.25";
        });
    }

    // Deselect when clicking empty canvas.
    svg.on("click", () => {
      selectedIdRef.current = null;
      setSelectedNode(null);
      applyHighlight(null);
    });

    // ---- Edges: soft curved connectors with a subtle arrowhead ----
    const link = zoomLayer
      .append("g")
      .selectAll("path")
      .data(linksData)
      .enter()
      .append("path")
      .attr("fill", "none")
      .attr("stroke", EDGE_COLOR)
      .attr("stroke-width", 1.4)
      .attr("marker-end", "url(#cm-arrow)")
      .style("transition", "stroke 150ms ease, opacity 150ms ease");

    // ---- Node cards, rendered in HTML so they can look like real learning
    // objects (typography, elevation, badges) rather than floating dots ----
    const cards = overlayInner
      .selectAll<HTMLDivElement, D3Node>("div.cm-card")
      .data(nodesData, (d) => d.id)
      .enter()
      .append("div")
      .attr("class", "cm-card")
      .style("position", "absolute")
      .style("pointer-events", "auto")
      .style("cursor", "grab")
      .style("user-select", "none")
      .style("width", (d) => `${cardSize(d.depth).w}px`)
      .style("border-radius", "14px")
      .style("border", (d) => `1.5px solid ${tierFor(d.depth).border}`)
      .style("background", (d) => (d.depth === 0 ? tierFor(0).bg : "#FFFFFF"))
      .style("box-shadow", (d) =>
        d.depth === 0 ? "0 6px 16px rgba(51,65,85,0.14)" : "0 1px 3px rgba(51,65,85,0.08)"
      )
      .style("padding", (d) => (d.depth === 0 ? "14px 16px" : "10px 12px"))
      .style("transition", "opacity 150ms ease, box-shadow 150ms ease")
      .on("mouseenter", function (_, d) {
        d3.select(this).style(
          "box-shadow",
          d.depth === 0 ? "0 8px 20px rgba(51,65,85,0.18)" : "0 4px 10px rgba(51,65,85,0.14)"
        );
        if (!selectedIdRef.current) applyHighlight(d.id);
      })
      .on("mouseleave", function (_, d) {
        d3.select(this).style(
          "box-shadow",
          d.depth === 0 ? "0 6px 16px rgba(51,65,85,0.14)" : "0 1px 3px rgba(51,65,85,0.08)"
        );
        if (!selectedIdRef.current) applyHighlight(null);
      })
      .on("click", function (event, d) {
        event.stopPropagation();
        selectedIdRef.current = d.id;
        setSelectedNode(d);
        applyHighlight(d.id);
      })
      .call(
        d3
          .drag<HTMLDivElement, D3Node>()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    cards.each(function (d) {
      const el = d3.select(this);
      const tier = tierFor(d.depth);

      const header = el
        .append("div")
        .style("display", "flex")
        .style("align-items", "center")
        .style("gap", "6px")
        .style("margin-bottom", "4px");

      header
        .append("span")
        .style("width", "6px")
        .style("height", "6px")
        .style("border-radius", "50%")
        .style("background", tier.dot)
        .style("flex", "none");

      header
        .append("span")
        .text(tier.label)
        .style("font-size", "10px")
        .style("font-weight", "600")
        .style("letter-spacing", "0.04em")
        .style("text-transform", "uppercase")
        .style("color", tier.text)
        .style("opacity", "0.75");

      if (d.hasChildren) {
        header
          .append("button")
          .attr("type", "button")
          .attr("aria-label", collapsed.has(d.id) ? "Expand branch" : "Collapse branch")
          .text(collapsed.has(d.id) ? "+" : "\u2212")
          .style("margin-left", "auto")
          .style("width", "16px")
          .style("height", "16px")
          .style("line-height", "14px")
          .style("border-radius", "50%")
          .style("border", `1px solid ${tier.border}`)
          .style("background", "#FFFFFF")
          .style("color", tier.text)
          .style("font-size", "11px")
          .style("cursor", "pointer")
          .on("click", (event) => {
            event.stopPropagation();
            toggleCollapse(d.id);
          });
      }

      el.append("div")
        .text(d.label)
        .style("font-size", d.depth === 0 ? "14px" : "13px")
        .style("font-weight", "600")
        .style("color", "#1E293B")
        .style("line-height", "1.3");

      if (d.description && d.depth <= 1) {
        el.append("div")
          .text(d.description)
          .style("font-size", "11px")
          .style("color", "#64748B")
          .style("margin-top", "3px")
          .style("line-height", "1.4")
          .style("display", "-webkit-box")
          .style("-webkit-line-clamp", "2")
          .style("-webkit-box-orient", "vertical")
          .style("overflow", "hidden");
      }
    });

    simulation.on("tick", () => {
      link.attr("d", (l: D3Link) => {
        const s = l.source as D3Node;
        const t = l.target as D3Node;
        const mx = (s.x! + t.x!) / 2;
        const my = (s.y! + t.y!) / 2;
        // Pull the curve's control point gently toward the canvas center
        // so connections feel like soft arcs instead of straight spokes.
        const cx = mx + (DESIGN_W / 2 - mx) * 0.12;
        const cy = my + (DESIGN_H / 2 - my) * 0.12;
        return `M${s.x},${s.y} Q${cx},${cy} ${t.x},${t.y}`;
      });

      cards
        .style("left", (d) => `${d.x! - cardSize(d.depth).w / 2}px`)
        .style("top", (d) => `${d.y! - cardSize(d.depth).h / 2}px`);
    });

    return () => {
      simulation.stop();
    };
  }, [data, collapsed, toggleCollapse]);

  return (
    <div
      ref={outerRef}
      className="relative w-full rounded-2xl border overflow-hidden"
      style={{ aspectRatio: "3 / 2", background: "#F8F9FB", borderColor: "#E2E8F0" }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: `${DESIGN_W}px`,
          height: `${DESIGN_H}px`,
          transform: `scale(${scale})`,
          transformOrigin: "0 0",
        }}
      >
        <svg ref={svgRef} width={DESIGN_W} height={DESIGN_H} />
        <div ref={overlayRef} style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
      </div>

      <div
        className="absolute top-3 right-3 flex flex-col gap-1.5 rounded-lg border bg-white/90 p-2.5 text-[11px]"
        style={{ borderColor: "#E2E8F0", backdropFilter: "blur(4px)" }}
      >
        {TIERS.map((t) => (
          <div key={t.label} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: t.dot }} />
            <span style={{ color: "#475569" }}>{t.label}</span>
          </div>
        ))}
      </div>

      {selectedNode && (
        <div
          className="absolute bottom-3 left-3 w-72 rounded-xl border bg-white p-4"
          style={{ borderColor: "#E2E8F0", boxShadow: "0 8px 24px rgba(51,65,85,0.12)" }}
        >
          <div className="flex justify-between items-start gap-3">
            <strong className="text-sm text-slate-800">{selectedNode.label}</strong>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-slate-400 hover:text-slate-600 text-sm leading-none"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            {selectedNode.description || "No description available."}
          </p>
        </div>
      )}
    </div>
  );
}