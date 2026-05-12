"use client";
import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { TreemapData, TreemapNode } from "@/types/visuals";

export function Treemap({ data }: { data: TreemapData }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });

  // Resize observer
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;
      const height = Math.max(420, Math.floor(width * 0.62));
      setDimensions({ width: Math.floor(width), height });
    });

    if (containerRef.current) observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  // Main Treemap effect
  useEffect(() => {
    if (!svgRef.current || !data.data?.length) return;

    const { width, height } = dimensions;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const rootNode: TreemapNode = {
      name: "root",
      value: 0,
      children: data.data,
    };

    const root = d3.hierarchy(rootNode).sum((d: any) => d.value ?? 0);

    d3.treemap<TreemapNode>()
      .size([width, height])
      .paddingInner(4)
      .paddingOuter(6)
      .round(true)(root);

    const color = d3.scaleSequential(d3.interpolateViridis)
      .domain([0, root.leaves().length]);

    const cells = svg
      .selectAll("g")
      .data(root.leaves())
      .enter()
      .append("g")
      .attr("transform", (d: any) => `translate(${d.x0},${d.y0})`);

    // Rectangles
    cells
      .append("rect")
      .attr("width", (d: any) => d.x1 - d.x0)
      .attr("height", (d: any) => d.y1 - d.y0)
      .attr("rx", 6)
      .attr("fill", (_d: any, i: number) => color(i))
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 2)
      .style("transition", "all 0.2s ease")
      .style("cursor", "pointer")
      .on("mouseover", function () {
        d3.select(this)
          .attr("stroke-width", 3)
          .style("filter", "brightness(1.15)");
      })
      .on("mouseout", function () {
        d3.select(this)
          .attr("stroke-width", 2)
          .style("filter", "none");
      });

    // Name label
    cells
      .append("text")
      .attr("x", 12)
      .attr("y", 22)
      .text((d: any) => (d.data as TreemapNode).name)
      .attr("font-size", "13px")
      .attr("font-weight", "600")
      .attr("fill", "#ffffff")
      .style("text-shadow", "0 1px 3px rgba(0,0,0,0.6)")
      .style("pointer-events", "none")
      .each(function (d: any) {
        const bbox = (this as SVGTextElement).getBBox();
        const rectWidth = d.x1 - d.x0;
        if (bbox.width > rectWidth - 24) d3.select(this).style("display", "none");
      });

    // Value label
    cells
      .append("text")
      .attr("x", 12)
      .attr("y", 42)
      .text((d: any) => (d.data as TreemapNode).value.toLocaleString())
      .attr("font-size", "11px")
      .attr("fill", "rgba(255,255,255,0.85)")
      .style("text-shadow", "0 1px 3px rgba(0,0,0,0.6)")
      .style("pointer-events", "none")
      .each(function (d: any) {
        if (d.y1 - d.y0 < 55) d3.select(this).style("display", "none");
      });

    // Tooltip
    const tooltip = d3.select("body")
      .append("div")
      .attr("class", "absolute hidden bg-zinc-900 text-white text-sm px-3 py-2 rounded-lg pointer-events-none border border-zinc-700 shadow-xl z-50");

    cells
      .on("mousemove", function (event: MouseEvent, d: any) {
        tooltip
          .style("display", "block")
          .style("left", `${event.pageX + 12}px`)
          .style("top", `${event.pageY - 10}px`)
          .html(`
            <div class="font-semibold">${(d.data as TreemapNode).name}</div>
            <div class="text-emerald-400">${(d.data as TreemapNode).value.toLocaleString()}</div>
          `);
      })
      .on("mouseout", () => {
        tooltip.style("display", "none");
      });

    // Proper cleanup
    return () => {
      tooltip.remove();
    };
  }, [data, dimensions]);

  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-bold bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 bg-clip-text text-transparent">
        {data.title}
      </h3>

      <div
        ref={containerRef}
        className="w-full bg-card rounded-2xl shadow-sm border border-border p-4 overflow-hidden"
      >
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          className="w-full h-auto"
        />
      </div>
    </div>
  );
}