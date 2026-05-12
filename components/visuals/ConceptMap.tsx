"use client";

import { useEffect, useRef, useState } from "react";
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

export function ConceptMap({ data }: { data: ConceptMapData }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<NodeType | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 900;
    const height = 600;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const container = svg
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("background", "transparent");

    const g = container.append("g");

    // Zoom + Pan
    container.call(
      d3.zoom<SVGSVGElement, unknown>().on("zoom", (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        g.attr("transform", event.transform.toString());
      })
    );

    type D3Node = d3.SimulationNodeDatum & NodeType;
    type D3Link = d3.SimulationLinkDatum<D3Node> & { label?: string };

    const nodesData: D3Node[] = data.nodes.map((n) => ({ ...n, x: undefined, y: undefined }));
    // Convert from/to to source/target
    const linksData: D3Link[] = data.edges.map((e) => ({
      source: e.from,
      target: e.to,
      label: e.label,
    }));

    // Simulation
    const simulation = d3
      .forceSimulation(nodesData)
      .force(
        "link",
        d3.forceLink<D3Node, D3Link>(linksData).id((d) => d.id).distance(120)
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide(40));

    // Edges
    const link = g
      .append("g")
      .selectAll("line")
      .data(linksData)
      .enter()
      .append("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.5);

    // Nodes
    const node = g
      .append("g")
      .selectAll("circle")
      .data(nodesData)
      .enter()
      .append("circle")
      .attr("r", 8)
      .attr("fill", "#6366f1")
      .call(
        d3
          .drag<SVGCircleElement, D3Node>()
          .on("start", (event: d3.D3DragEvent<SVGCircleElement, D3Node, D3Node>, d: D3Node) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event: d3.D3DragEvent<SVGCircleElement, D3Node, D3Node>, d: D3Node) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event: d3.D3DragEvent<SVGCircleElement, D3Node, D3Node>, d: D3Node) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      )
      .on("click", (_, d) => {
        setSelectedNode(d);
      });

    // Labels
    const label = g
      .append("g")
      .selectAll("text")
      .data(nodesData)
      .enter()
      .append("text")
      .text((d) => d.label)
      .attr("font-size", 12)
      .attr("dx", 12)
      .attr("dy", 4)
      .attr("fill", "#fff");

    // Simulation tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d: D3Link) => (d.source as D3Node).x!)
        .attr("y1", (d: D3Link) => (d.source as D3Node).y!)
        .attr("x2", (d: D3Link) => (d.target as D3Node).x!)
        .attr("y2", (d: D3Link) => (d.target as D3Node).y!);

      node
        .attr("cx", (d: D3Node) => d.x!)
        .attr("cy", (d: D3Node) => d.y!);

      label
        .attr("x", (d: D3Node) => d.x!)
        .attr("y", (d: D3Node) => d.y!);
    });

    // Cleanup: stop simulation and return nothing
    return () => {
      simulation.stop();
    };
  }, [data]);

  return (
    <div className="relative w-full h-[600px] border rounded-xl bg-black">
      <svg ref={svgRef} className="w-full h-full" />

      {selectedNode && (
        <div className="absolute bottom-4 left-4 bg-white text-black p-3 rounded-lg w-64 shadow-lg">
          <div className="flex justify-between items-center">
            <strong>{selectedNode.label}</strong>
            <button onClick={() => setSelectedNode(null)} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>
          <p className="text-sm mt-2">
            {selectedNode.description || "No description"}
          </p>
        </div>
      )}
    </div>
  );
}