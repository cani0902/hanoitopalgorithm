
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { TreeNode, AlgorithmType } from '../types';

interface Props {
  data: TreeNode;
  algorithm: AlgorithmType;
}

const TreeVisualization: React.FC<Props> = ({ data, algorithm }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight || 800;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg.append('g');

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    const treeLayout = d3.tree<TreeNode>().nodeSize([280, 500]);
    const root = d3.hierarchy(data);
    treeLayout(root);

    // Links
    g.append('g')
      .attr('fill', 'none')
      .attr('stroke', '#ccc')
      .attr('stroke-width', 2)
      .selectAll('path')
      .data(root.links())
      .join('path')
      .attr('d', d3.linkVertical<any, any>()
        .x(d => d.x)
        .y(d => d.y)
      )
      .attr('stroke', d => (d.target.data.isPath ? '#ef4444' : '#cbd5e1'))
      .attr('stroke-width', d => (d.target.data.isPath ? 8 : 3));

    // Nodes
    const node = g.append('g')
      .selectAll('g')
      .data(root.descendants())
      .join('g')
      .attr('transform', d => `translate(${d.x},${d.y})`);

    const nodeWidth = 220;
    const nodeHeight = 280;

    // Node background rectangle
    node.append('rect')
      .attr('x', -nodeWidth / 2)
      .attr('y', -nodeHeight / 2)
      .attr('width', nodeWidth)
      .attr('height', nodeHeight)
      .attr('fill', d => {
        const isGoal = d.data.state.every(p => p === 2);
        if (isGoal) return '#fff1f2'; // Goal light red tint
        if (d.data.parentId === null) return '#f8fafc'; // Root
        return '#fff';
      })
      .attr('stroke', d => {
        const isGoal = d.data.state.every(p => p === 2);
        if (isGoal) return '#ef4444';
        if (d.data.isPath) return '#ef4444';
        return '#94a3b8';
      })
      .attr('stroke-width', d => (d.data.isPath ? 6 : 2))
      .attr('rx', 12);

    // Inner content using foreignObject
    node.append('foreignObject')
      .attr('x', -nodeWidth / 2)
      .attr('y', -nodeHeight / 2)
      .attr('width', nodeWidth)
      .attr('height', nodeHeight)
      .append('xhtml:div')
      .attr('style', 'width: 100%; height: 100%; display: flex; flex-direction: column; font-family: "JetBrains Mono", monospace; font-size: 16px; padding: 16px; box-sizing: border-box;')
      .html(d => {
        const state = d.data.state;
        const numDisks = d.data.numDisks;
        const pegs: number[][] = [[], [], []];
        // Corrected loop to push largest to smallest for [bottom, ..., top]
        for (let i = numDisks - 1; i >= 0; i--) {
          pegs[state[i]].push(i + 1);
        }
        
        const maxLen = Math.max(numDisks, 5);
        const displayPegs = pegs.map(p => {
          const result = new Array(maxLen).fill('&nbsp;');
          for (let i = 0; i < p.length; i++) {
            // p[0] is bottom, p[p.length-1] is top
            // result[maxLen-1] is bottom, result[maxLen-p.length] is top
            result[maxLen - 1 - i] = p[i];
          }
          return result;
        });

        const diskColors = ['#60a5fa', '#34d399', '#fbbf24', '#f87171', '#a78bfa'];

        let extraInfo = '';
        if (algorithm === 'A-Star' && d.data.f !== undefined) {
          extraInfo = ` <span style="font-size: 12px; opacity: 0.8; margin-left: 4px;">[f:${d.data.f} (g:${d.data.g}+h:${d.data.h})]</span>`;
        } else if (algorithm === 'Best-First' && d.data.h !== undefined) {
          extraInfo = ` <span style="font-size: 12px; opacity: 0.8; margin-left: 4px;">[h:${d.data.h}]</span>`;
        }

        return `
          <div style="display: flex; justify-content: space-between; border-bottom: 4px solid #cbd5e1; padding-bottom: 8px; margin-bottom: 12px; font-weight: 900; font-size: 22px; color: #0f172a;">
            <span style="flex: 1; text-align: center;">A</span>
            <span style="flex: 1; text-align: center;">B</span>
            <span style="flex: 1; text-align: center;">C</span>
          </div>
          <div style="display: flex; flex: 1; line-height: 1.1; overflow: hidden;">
            <div style="display: flex; flex: 1;">
              ${displayPegs.map(p => `
                <div style="flex: 1; display: flex; flex-direction: column; align-items: center; border-right: 1px solid #f1f5f9; position: relative;">
                  <div style="position: absolute; width: 4px; height: 100%; background: #e2e8f0; left: 50%; transform: translateX(-50%); z-index: 0;"></div>
                  ${p.map(val => {
                    if (val === '&nbsp;') return `<div style="height: 30px; z-index: 1;"></div>`;
                    const size = parseInt(val.toString());
                    const widthPercent = 30 + (size / numDisks) * 60;
                    return `
                      <div style="height: 26px; width: ${widthPercent}%; background: ${diskColors[size-1]}; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 14px; margin-bottom: 4px; border: 1px solid rgba(0,0,0,0.2); z-index: 1; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">
                        ${val}
                      </div>
                    `;
                  }).join('')}
                </div>
              `).join('')}
            </div>
          </div>
          <div style="text-align: center; font-size: 14px; color: #ef4444; margin-top: 12px; font-weight: 900; background: #fee2e2; border-radius: 6px; padding: 4px 0; border: 1px solid #fecaca; display: flex; align-items: center; justify-content: center; flex-wrap: wrap;">
            <span>방문순서: #${d.data.order}</span>
            ${extraInfo}
          </div>
        `;
      });

    // Initial transform to center the root
    svg.call(zoom.transform, d3.zoomIdentity.translate(width / 2, 100).scale(0.8));

  }, [data, algorithm]);

  return (
    <div ref={containerRef} className="w-full h-full bg-slate-50 relative overflow-hidden border border-slate-200 rounded-xl shadow-inner">
      <svg ref={svgRef} className="w-full h-full cursor-move" />
      <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm p-3 rounded-lg border border-slate-200 text-xs space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span>초기 상태</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          <span>목표 상태</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span>최적 경로</span>
        </div>
        <div className="mt-2 text-slate-500 italic">마우스 휠로 확대/축소, 드래그로 이동</div>
      </div>
    </div>
  );
};

export default TreeVisualization;
