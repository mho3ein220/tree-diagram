import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import styles from "./treeDiagram.module.css";

const TreeDiagram = ({ data, initialOpenDepth = 1 }) => {
  const svgRef = useRef(null);
  const gRef = useRef(null);
  const zoomRef = useRef(null);

  useEffect(() => {
    if (!data) return;

    const container = svgRef.current.parentElement;
    const containerWidth = container.clientWidth;
    const containerHeight = 800;

    const margin = { top: 400, right: 200, bottom: 40, left: 100 };
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;
    const duration = 750;

    let i = 0;

    const root = d3.hierarchy(data);
    root.y0 = height / 3;
    root.x0 = 0;

    collapseToDepth(root, 0, initialOpenDepth);

    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    svg.selectAll("*").remove();

    // --- IMPORTANT CHANGE: create g without manual transform and let zoom own the transform ---
    const g = svg.append("g"); // no translate/scale here
    gRef.current = g;

    const zoom = d3
      .zoom()
      .scaleExtent([0.5, 2])
      .on("zoom", (event) => {
        // zoom handler now fully controls g's transform
        g.attr("transform", event.transform);
      });

    zoomRef.current = zoom;
    svg.call(zoom);

    // set initial transform so zoom behavior has the same starting translate+scale
    const initialTransform = d3.zoomIdentity
      .translate(margin.left + width, margin.top)
      .scale(0.7);
    // this sets the current zoom transform (and triggers the zoom handler to update g)
    d3.select(svgRef.current).call(zoom.transform, initialTransform);

    const treeLayout = d3.tree().nodeSize([120, -280]);

    const diagonal = d3
      .linkHorizontal()
      .x((d) => d.y)
      .y((d) => d.x);

    function collapseToDepth(node, currentDepth, maxDepth) {
      if (!node.children) return;
      if (currentDepth >= maxDepth) {
        node._children = node.children;
        node._children.forEach((child) =>
          collapseToDepth(child, currentDepth + 1, maxDepth)
        );
        node.children = null;
      } else {
        node.children.forEach((child) =>
          collapseToDepth(child, currentDepth + 1, maxDepth)
        );
      }
    }

    function zoomToNode(d) {
      const isMobile = window.innerWidth < 768;
      const scale = isMobile ? 1 : 1.2;

      const bbox = svgRef.current.getBoundingClientRect();
      const svgWidth = bbox.width;
      const svgHeight = bbox.height;

      // node screen coords without any transform are (d.y, d.x)
      const x = d.y;
      const y = d.x;

      // To center the node: tx = svgWidth/2 - scale * x, ty = svgHeight/2 - scale * y
      const translate =isMobile?[svgWidth / 0.8 - x * scale, svgHeight / 2 - y * scale]: [svgWidth / 2 - x * scale, svgHeight / 2 - y * scale];

      d3.select(svgRef.current)
        .transition()
        .duration(duration)
        .call(
          zoomRef.current.transform,
          d3.zoomIdentity.translate(...translate).scale(scale)
        );
    }

    function update(source) {
      const treeData = treeLayout(root);
      const nodes = treeData.descendants();
      const links = treeData.links();

      const node = g
        .selectAll("g.node")
        .data(nodes, (d) => d.id || (d.id = ++i));

      const nodeEnter = node
        .enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", (_) => `translate(${source.y0},${source.x0})`)
        .on("click", (_, d) => {
          if (d.children) {
            d._children = d.children;
            d.children = null;
            update(d);
            zoomToNode(d);
          } else {
            d.children = d._children;
            d._children = null;
            update(d);
            zoomToNode(d);
          }
        });

      nodeEnter
        .append("foreignObject")
        .attr("x", -190)
        .attr("y", (d) => (d.data.stage ? -35 : -18.5))
        .attr("width", 190)
        .attr("height", 120)
        .append("xhtml:div")
        .attr(
          "class",
          (d) =>
            `${styles.nodeBox} ${
              d._children || d.children ? styles.hasChildren : ""
            }`
        )
        .html(
          (d) =>
            `<div  style="display:flex"  >
              
            <div style="width:100%" >
            ${
              d.data.stage
                ? `<div 
              style="background-color:white;border-radius:0px 6px 0px 0px;padding:5px" 
              >
              ${d.data.stage}
              </div>`
                : "<div></div>"
            }
            <div 
            style="margin-top:${d.data.stage ? "5px" : "0px"};padding:5px" 
            >
            ${d.data.name}
            </div>
            </div>
            ${
              d.data.percent
                ? `<div style="width:50%;background-color:white;display:flex;align-items:center;justify-content:center;border-radius:6px 0px 0px 6px;border-right:solid 1px var(--adl-yellow)" >${
                    d.data.percent + "%"
                  }</div>`
                : "<div></div>"
            }
            </div>`
        );

      const nodeUpdate = nodeEnter.merge(node);

      nodeUpdate
        .transition()
        .duration(duration)
        .attr("transform", (d) => `translate(${d.y},${d.x})`);

      node
        .exit()
        .transition()
        .duration(duration)
        .attr("transform", (_) => `translate(${source.y},${source.x})`)
        .remove();

      const link = g.selectAll("path.link").data(links, (d) => d.target.id);

      const linkEnter = link
        .enter()
        .insert("path", "g")
        .attr("class", "link")
        .attr("d", (_) => {
          const o = { x: source.x0, y: source.y0 };
          return diagonal({ source: o, target: o });
        });

      linkEnter.merge(link).transition().duration(duration).attr("d", diagonal);

      link
        .exit()
        .transition()
        .duration(duration)
        .attr("d", (_) => {
          const o = { x: source.x, y: source.y };
          return diagonal({ source: o, target: o });
        })
        .remove();

      nodes.forEach((d) => {
        d.x0 = d.x;
        d.y0 = d.y;
      });
    }

    update(root);
  }, [data, initialOpenDepth]);

  const zoomIn = () => {
    if (zoomRef.current && svgRef.current) {
      d3.select(svgRef.current).transition().call(zoomRef.current.scaleBy, 1.2);
    }
  };

  const zoomOut = () => {
    if (zoomRef.current && svgRef.current) {
      d3.select(svgRef.current).transition().call(zoomRef.current.scaleBy, 0.8);
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <svg ref={svgRef} className={styles.container} />

      <div className={styles.zoomButtons}>
        <button className={styles.zoomButton} onClick={zoomIn}>
          +
        </button>
        <button className={styles.zoomButton} onClick={zoomOut}>
          −
        </button>
      </div>
    </div>
  );
};

export default TreeDiagram;
