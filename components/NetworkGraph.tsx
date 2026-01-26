import React, { useEffect, useState } from 'react';
import { Account } from '../types';
import { Activity, Shield, Zap, Radio } from 'lucide-react';

interface NetworkGraphProps {
  accounts: Account[];
  selectedId: string | null;
  onNodeClick: (id: string) => void;
  isDarkMode: boolean;
  currency: string;
}

const NetworkGraph: React.FC<NetworkGraphProps> = ({ accounts, selectedId, onNodeClick, isDarkMode, currency }) => {
  const [viewBox, setViewBox] = useState("0 0 1600 900");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (selectedId) {
      const node = accounts.find(a => a.id === selectedId);
      if (node) {
        const zoomW = 600;
        const zoomH = 400;
        const x = Math.max(0, Math.min(1600 - zoomW, node.x - zoomW / 2));
        const y = Math.max(0, Math.min(900 - zoomH, node.y - zoomH / 2));
        setViewBox(`${x} ${y} ${zoomW} ${zoomH}`);
      }
    }
  }, [selectedId]);

  // Distinct Neon Palette
  const getNodeColor = (account: Account) => {
    if (account.riskScore > 80) return '#ff0033'; // Vibrant Neon Red
    if (account.riskScore > 50) return '#f59e0b'; // Amber-500 (Warning)
    return '#10b981'; // Emerald-500 (Safe)
  };

  return (
    <div
      className="w-full h-full relative bg-slate-100/50 dark:bg-[#050505] rounded-xl overflow-hidden border border-slate-200 dark:border-white/5 group cursor-default transition-colors duration-500 font-mono"
    >
      {/* HUD Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none p-6 flex flex-col justify-between">
        {/* Top Bar Removed */}
        <div />

        {/* Bottom Bar */}
        <div className="flex justify-between items-end">
          {/* Legend */}
          <div className="flex items-center gap-6 bg-white/50 dark:bg-black/40 backdrop-blur-md p-3 rounded-lg border border-slate-200 dark:border-white/5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10b981] shadow-[0_0_5px_#10b981]" />
              <span className="text-[10px] font-bold text-slate-500 uppercase">Safe</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#f59e0b] shadow-[0_0_5px_#f59e0b]" />
              <span className="text-[10px] font-bold text-slate-500 uppercase">Warning</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#ff0033] animate-pulse shadow-[0_0_8px_#ff0033]" />
              <span className="text-[10px] font-bold text-slate-500 uppercase">Critical</span>
            </div>
          </div>

          {/* Stats */}
          <div className="text-right">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
              {accounts.length}
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Entities</p>
          </div>
        </div>
      </div>

      <style>
        {`
                @keyframes blink-red {
                    0%, 100% { opacity: 1; filter: drop-shadow(0 0 8px #ff0033); }
                    50% { opacity: 0.6; filter: drop-shadow(0 0 25px #ff0033); }
                }
                .blink-critical {
                    animation: blink-red 1.5s infinite ease-in-out;
                }
                .smooth-camera {
                    transition: all 1.5s cubic-bezier(0.16, 1, 0.3, 1);
                }
            `}
      </style>



      {/* Subtle Grid (Optional - Re-adding very faintly if desired, but user asked to remove. Spotlight acts as the interaction) */}

      <svg
        className={`w-full h-full ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
        style={{ pointerEvents: 'all' }}
        onMouseDown={(e) => {
          setIsDragging(true);
          setDragStart({ x: e.clientX, y: e.clientY });
        }}
        onMouseMove={(e) => {
          if (!isDragging) return;

          e.preventDefault();
          const dx = e.clientX - dragStart.x;
          const dy = e.clientY - dragStart.y;

          // Convert pixel movement to SVG unit movement
          // We need to know how many svg units 1 screen pixel represents.
          const svgRect = e.currentTarget.getBoundingClientRect();
          const [vx, vy, vw, vh] = viewBox.split(' ').map(Number);

          const ratioX = vw / svgRect.width;
          const ratioY = vh / svgRect.height;

          const svgDx = dx * ratioX;
          const svgDy = dy * ratioY;

          // Update Viewbox
          // Moving mouse RIGHT should move viewbox LEFT (to pan) -> subtract dx
          setViewBox(`${vx - svgDx} ${vy - svgDy} ${vw} ${vh}`);
          setDragStart({ x: e.clientX, y: e.clientY });
        }}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onWheel={(e) => {
          e.stopPropagation();
          // Parse current ViewBox
          const [vx, vy, vw, vh] = viewBox.split(' ').map(Number);

          // Zoom Factor
          // deltaY > 0 -> Zoom Out (Increase dimensions)
          // deltaY < 0 -> Zoom In (Decrease dimensions)
          const zoomFactor = e.deltaY > 0 ? 1.05 : 0.95;

          // Calculate new dimensions
          let newW = vw * zoomFactor;
          let newH = vh * zoomFactor;

          // Clamp zoom levels (prevent infinite zoom in/out)
          if (newW < 200) { newW = 200; newH = 200 * (9 / 16); } // Max Zoom In
          if (newW > 3200) { newW = 3200; newH = 3200 * (9 / 16); } // Max Zoom Out

          // Get Mouse Position relative to SVG container
          const svgRect = e.currentTarget.getBoundingClientRect();
          const mouseX = e.clientX - svgRect.left;
          const mouseY = e.clientY - svgRect.top;

          // Convert Mouse Pos to SVG Coordinates (ratio)
          const ratioX = mouseX / svgRect.width;
          const ratioY = mouseY / svgRect.height;

          // Calculate new X/Y to keep mouse point stable
          // NewX = OldX + (widthDiff * ratioX)
          // If we zoom in (widthDiff is negative), we move X to the right (add negative)
          // If we zoom out (widthDiff is positive), we move X to the left (subtract positive)

          // Correct Formula: 
          // We want the point under mouse (P_m) to stay at same screen pos.
          // P_m_screen = (P_m_world - ViewBox_x) / ViewBox_w
          // Keeping P_m_screen constant.

          const dx = (vw - newW) * ratioX;
          const dy = (vh - newH) * ratioY;

          const newX = vx + dx;
          const newY = vy + dy;

          setViewBox(`${newX} ${newY} ${newW} ${newH}`);
        }}
      >
        <defs>
          <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 1. Draw Edges */}
        {accounts.map(source =>
          source.connections.map(targetId => {
            const target = accounts.find(a => a.id === targetId);
            if (!target) return null;

            const isCritical = source.riskScore > 80 && target.riskScore > 80;
            const isRelated = selectedId && (source.id === selectedId || target.id === selectedId);

            return (
              <line
                key={`${source.id}-${target.id}`}
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke={isCritical ? '#ff0033' : isRelated ? '#6366f1' : isDarkMode ? '#334155' : '#cbd5e1'}
                strokeWidth={isRelated ? 2 : 1}
                strokeOpacity={isRelated || isCritical ? 0.8 : 0.15}
                className="transition-all duration-500"
                style={{ pointerEvents: 'none' }}
              />
            );
          })
        )}

        {/* 2. Draw Nodes */}
        {accounts.map(node => {
          const isSelected = selectedId === node.id;
          const selectedNode = accounts.find(a => a.id === selectedId);
          const isNeighbor = selectedNode ? selectedNode.connections.includes(node.id) : false;

          const isCritical = node.riskScore > 80;
          const color = getNodeColor(node);

          // LOD Logic: Show labels if zoomed in significantly (viewBox width < 800)
          const currentZoomWidth = parseFloat(viewBox.split(' ')[2]);
          const showLabel = currentZoomWidth < 800;

          const isHovered = hoveredId === node.id;
          const isHoverNeighbor = hoveredId ? accounts.find(a => a.id === hoveredId)?.connections.includes(node.id) : false;

          // Opacity Logic: 
          // If Selection Active: Focus on Selection.
          // If No Selection but Hover: Focus on Hover.
          // Else: 1
          let opacity = 1;
          if (selectedId) {
            opacity = (isSelected || isNeighbor) ? 1 : 0.2;
          } else if (hoveredId) {
            opacity = (isHovered || isHoverNeighbor) ? 1 : 0.2;
          }

          // Highlighting
          const isHighlight = isSelected || isHovered;

          return (
            <g
              key={node.id}
              onClick={(e) => {
                e.stopPropagation();
                onNodeClick(node.id);
              }}
              onMouseEnter={() => setHoveredId(node.id)}
              onMouseLeave={() => setHoveredId(null)}
              onMouseDown={(e) => e.stopPropagation()}
              className="cursor-pointer transition-all duration-300 ease-out"
              style={{ opacity, pointerEvents: 'all' }}
            >
              {/* HIT AREA */}
              <circle cx={node.x} cy={node.y} r={20} fill="transparent" stroke="none" style={{ pointerEvents: 'all' }} />

              {/* Core Node */}
              <circle
                cx={node.x}
                cy={node.y}
                r={isCritical ? 8 : 5}
                fill={isCritical ? color : isDarkMode ? '#000' : '#fff'}
                stroke={color}
                strokeWidth={isHighlight ? 3 : 2}
                className={isCritical ? "blink-critical" : "transition-all duration-300"}
                style={{ pointerEvents: 'none', filter: isHighlight ? `drop-shadow(0 0 8px ${color})` : 'none' }}
              />

              {/* Hover/Selection Label */}
              {(isHovered || showLabel) && (
                <g style={{ pointerEvents: 'none' }}>
                  <rect
                    x={node.x - 40}
                    y={node.y + 12}
                    width="80"
                    height="20"
                    rx="4"
                    fill={isDarkMode ? "rgba(0,0,0,0.8)" : "rgba(255,255,255,0.9)"}
                    className="backdrop-blur-sm"
                  />
                  <text
                    x={node.x}
                    y={node.y + 25}
                    textAnchor="middle"
                    fill={color}
                    fontSize="10"
                    fontWeight="bold"
                    className="select-none"
                  >
                    {node.name.length > 12 ? node.name.slice(0, 10) + '...' : node.name}
                  </text>
                </g>
              )}

              {/* Glow Effects */}
              <circle
                cx={node.x}
                cy={node.y}
                r={isCritical ? 20 : (isNeighbor || isSelected || isHovered || isHoverNeighbor) ? 15 : 10}
                fill={color}
                opacity={isCritical ? 0.4 : (isHighlight || isNeighbor || isHoverNeighbor) ? 0.3 : 0}
                className={isCritical ? "blink-critical" : ""}
                style={{ pointerEvents: 'none' }}
              />

              {/* Rings */}
              {isHighlight && (
                <circle cx={node.x} cy={node.y} r={24} fill="none" stroke={color} strokeWidth="1" strokeDasharray="4 2" className="animate-[spin_4s_linear_infinite]" opacity="0.6" style={{ pointerEvents: 'none' }} />
              )}
            </g>
          );
        })}
      </svg>



      {/* Reset Button (Selection) */}
      {selectedId && (
        <button
          onClick={(e) => { e.stopPropagation(); onNodeClick(''); }}
          className="absolute top-6 right-6 bg-slate-900/10 dark:bg-white/10 hover:bg-slate-900/20 dark:hover:bg-white/20 text-slate-900 dark:text-white text-[10px] font-bold tracking-widest px-4 py-2 rounded-full backdrop-blur-md border border-slate-300 dark:border-white/10 transition-all z-10"
        >
          RESET OPTICS
        </button>
      )}
    </div>
  );
};

export default NetworkGraph;