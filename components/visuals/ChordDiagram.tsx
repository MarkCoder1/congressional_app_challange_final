"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { ChordData } from "@/types/visuals";

export function ChordDiagram({ data }: { data: ChordData }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 800;
    const height = 800;
    const outerRadius = Math.min(width, height) / 2 - 40;
    const innerRadius = outerRadius - 30;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`).style("background", "transparent");

    const g = svg.append("g").attr("transform", `translate(${width / 2},${height / 2})`);

    const chord = d3.chord().padAngle(0.05).sortSubgroups(d3.descending)(data.matrix);
    const arc = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius);
    const ribbon = d3.ribbon().radius(innerRadius);

    const colors = d3.scaleOrdinal(d3.schemeTableau10);

    // Draw groups (outer arcs)
    g.selectAll("g")
      .data(chord.groups)
      .enter()
      .append("g")
      .append("path")
      .attr("d", arc as any)
      .attr("fill", (d) => colors(String(d.index)))   // convert number to string
      .attr("stroke", "#fff");

    // Draw ribbons (inner chords)
    g.selectAll("path.ribbon")
      .data(chord)
      .enter()
      .append("path")
      .attr("class", "ribbon")
      .attr("d", ribbon as any)
      .attr("fill", (d) => colors(String(d.source.index))) // convert number to string
      .attr("opacity", 0.7)
      .on("mouseover", function () {
        d3.select(this).attr("opacity", 1);
      })
      .on("mouseout", function () {
        d3.select(this).attr("opacity", 0.7);
      });

    // Add text labels
    g.selectAll("text")
      .data(chord.groups)
      .enter()
      .append("text")
      .attr("dy", ".35em")
      .attr("text-anchor", (d) => (d.startAngle + d.endAngle) / 2 > Math.PI ? "end" : "start")
      .attr("transform", (d) => {
        const angle = (d.startAngle + d.endAngle) / 2;
        const x = (outerRadius + 15) * Math.sin(angle);
        const y = -(outerRadius + 15) * Math.cos(angle);
        return `translate(${x},${y}) rotate(${(angle * 180) / Math.PI - 90})`;
      })
      .text((d) => data.labels[Number(d.index)])
      .attr("font-size", "12px")
      .attr("fill", "currentColor");
  }, [data]);

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
        {data.title}
      </h3>
      <div className="w-full overflow-x-auto">
        <svg ref={svgRef} width={800} height={800} className="mx-auto" />
      </div>
    </div>
  );
}