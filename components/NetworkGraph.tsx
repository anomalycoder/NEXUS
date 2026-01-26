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
    } else {
      setViewBox("0 0 1600 900");
    }
  }, [selectedId, accounts]);

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
        className="w-full h-full smooth-camera"
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
        style={{ pointerEvents: 'all' }}
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

          // Opacity Logic
          const opacity = selectedId ? (isSelected || isNeighbor ? 1 : 0.5) : 1;

          // LOD Logic: Show labels if zoomed in significantly (viewBox width < 800)
          const currentZoomWidth = parseFloat(viewBox.split(' ')[2]);
          const showLabel = currentZoomWidth < 800;

          return (
            <g
              key={node.id}
              onClick={(e) => {
                e.stopPropagation();
                onNodeClick(node.id);
              }}
              className="cursor-pointer transition-all duration-500"
              style={{ opacity, pointerEvents: 'all' }}
            >
              {/* LARGE INVISIBLE HIT AREA - Ensures easy touch/click */}
              <circle cx={node.x} cy={node.y} r={40} fill="transparent" stroke="none" style={{ pointerEvents: 'all' }} />

              {/* Core Node with Blink Animation for Critical */}
              <circle
                cx={node.x}
                cy={node.y}
                r={isCritical ? 7 : 5}
                fill={isCritical ? color : isDarkMode ? '#000' : '#fff'}
                stroke={color}
                strokeWidth={isSelected ? 3 : 2}
                className={isCritical ? "blink-critical" : "transition-all duration-300"}
                style={{ pointerEvents: 'none' }}
              />

              {/* LOD Label (Only visible when zoomed in) */}
              {showLabel && (
                <text
                  x={node.x}
                  y={node.y + 15}
                  textAnchor="middle"
                  fill={color}
                  fontSize="6"
                  fontWeight="bold"
                  className="pointer-events-none select-none drop-shadow-md"
                >
                  {node.name.length > 10 ? node.name.slice(0, 8) + '...' : node.name}
                </text>
              )}

              {/* Glow Effect Circle - Show for Critical OR Neighbors when selected OR Selected Node */}
              <circle
                cx={node.x}
                cy={node.y}
                r={isCritical ? 20 : (isNeighbor || isSelected) ? 15 : 10}
                fill={color}
                opacity={isCritical ? 0.4 : (isNeighbor || isSelected) ? 0.3 : 0.15}
                className={isCritical || isNeighbor || isSelected ? "blink-critical" : ""}
                style={{ pointerEvents: 'none' }}
              />

              {/* Selection Ring */}
              {isSelected && (
                <circle cx={node.x} cy={node.y} r={28} fill="none" stroke={isDarkMode ? "#fff" : "#000"} strokeWidth="1" strokeDasharray="4 2" className="animate-[spin_10s_linear_infinite]" opacity="0.8" style={{ pointerEvents: 'none' }} />
              )}

              {/* Neighbor Connection Ring */}
              {isNeighbor && (
                <circle cx={node.x} cy={node.y} r={18} fill="none" stroke={color} strokeWidth="1" opacity="0.6" className="animate-pulse" style={{ pointerEvents: 'none' }} />
              )}
            </g>
          );
        })}
      </svg>

      {/* Zoom Controls */}
      <div className="absolute bottom-6 left-6 z-20 flex flex-col gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setViewBox(prev => {
              const [x, y, w, h] = prev.split(' ').map(Number);
              const zoomFactor = 0.8; // Zoom In
              const newW = w * zoomFactor;
              const newH = h * zoomFactor;
              // Center zoom
              const newX = x + (w - newW) / 2;
              const newY = y + (h - newH) / 2;
              return `${newX} ${newY} ${newW} ${newH}`;
            });
          }}
          className="p-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/10 text-white hover:bg-white/20 transition-all font-bold"
          title="Zoom In"
        >
          <span className="text-xl leading-none">+</span>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setViewBox("0 0 1600 900");
          }}
          className="p-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/10 text-white hover:bg-white/20 transition-all font-bold"
          title="Reset View"
        >
          <Radio size={20} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setViewBox(prev => {
              const [x, y, w, h] = prev.split(' ').map(Number);
              const zoomFactor = 1.25; // Zoom Out (inverse of 0.8)
              const newW = w * zoomFactor;
              const newH = h * zoomFactor;
              const newX = x + (w - newW) / 2;
              const newY = y + (h - newH) / 2;
              return `${newX} ${newY} ${newW} ${newH}`;
            });
          }}
          className="p-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/10 text-white hover:bg-white/20 transition-all font-bold"
          title="Zoom Out"
        >
          <span className="text-xl leading-none">−</span>
        </button>
      </div>

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