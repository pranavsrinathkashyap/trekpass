import React, { useState, useEffect, useRef } from 'react';
import { Network, Info, Eye, Layers, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

const NODE_COLORS = {
  Trekker: '#0284c7',       // Sky blue
  TrekPass: '#d97706',      // Amber
  Trail: '#059669',         // Emerald
  Checkpoint: '#7c3aed',    // Purple
  RangerStation: '#e11d48', // Rose
  Zone: '#4f46e5',          // Indigo
};

export default function GraphCanvas({ data, onSelectNode, selectedNode }) {
  const canvasRef = useRef(null);
  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [draggingNode, setDraggingNode] = useState(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const animFrameRef = useRef(null);

  // Initialize nodes with layout positions
  useEffect(() => {
    if (!data || !data.nodes) return;

    const width = 800;
    const height = 550;
    const count = data.nodes.length;

    const initializedNodes = data.nodes.map((n, i) => {
      let angle = (i / count) * 2 * Math.PI;
      let radius = 160 + (i % 3) * 40;
      if (n.label === 'Checkpoint') radius = 110;
      if (n.label === 'Trail') radius = 220;
      if (n.label === 'TrekPass') radius = 180;
      if (n.label === 'Trekker') radius = 250;

      return {
        ...n,
        x: width / 2 + Math.cos(angle) * radius + (Math.random() - 0.5) * 30,
        y: height / 2 + Math.sin(angle) * radius + (Math.random() - 0.5) * 30,
        vx: 0,
        vy: 0,
        radius: n.label === 'Trail' ? 22 : n.label === 'Checkpoint' ? 18 : 16,
      };
    });

    setNodes(initializedNodes);
    setLinks(data.links || []);
  }, [data]);

  // Gentle force simulation step
  useEffect(() => {
    let active = true;

    const simulate = () => {
      if (!active || nodes.length === 0) return;

      // Repulsion between nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          if (dist < 180) {
            const force = (180 - dist) / dist * 0.4;
            nodes[i].vx -= dx * force * 0.02;
            nodes[i].vy -= dy * force * 0.02;
            nodes[j].vx += dx * force * 0.02;
            nodes[j].vy += dy * force * 0.02;
          }
        }
      }

      // Spring force on links
      const nodeMap = new Map(nodes.map(n => [n.id, n]));
      for (const link of links) {
        const source = nodeMap.get(link.source);
        const target = nodeMap.get(link.target);
        if (source && target) {
          const dx = target.x - source.x;
          const dy = target.y - source.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const desiredDist = 120;
          const force = (dist - desiredDist) * 0.02;
          source.vx += (dx / dist) * force;
          source.vy += (dy / dist) * force;
          target.vx -= (dx / dist) * force;
          target.vy -= (dy / dist) * force;
        }
      }

      // Center gravity & apply velocities
      const centerX = 400;
      const centerY = 275;
      for (const node of nodes) {
        if (draggingNode && draggingNode.id === node.id) continue;
        node.vx += (centerX - node.x) * 0.002;
        node.vy += (centerY - node.y) * 0.002;
        node.vx *= 0.85;
        node.vy *= 0.85;
        node.x += node.vx;
        node.y += node.vy;
      }

      drawCanvas();
      animFrameRef.current = requestAnimationFrame(simulate);
    };

    animFrameRef.current = requestAnimationFrame(simulate);
    return () => {
      active = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [nodes, links, draggingNode, zoom, offset, selectedNode]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);
    ctx.save();

    // Background gradient
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, width, height);

    // Pan and zoom
    ctx.translate(offset.x, offset.y);
    ctx.scale(zoom, zoom);

    const nodeMap = new Map(nodes.map(n => [n.id, n]));

    // Draw Links
    for (const link of links) {
      const source = nodeMap.get(link.source);
      const target = nodeMap.get(link.target);
      if (!source || !target) continue;

      const isPassable = link.properties?.is_passable !== false;

      ctx.beginPath();
      ctx.moveTo(source.x, source.y);
      ctx.lineTo(target.x, target.y);
      ctx.strokeStyle = isPassable ? 'rgba(148, 163, 184, 0.45)' : 'rgba(239, 68, 68, 0.7)';
      ctx.lineWidth = link.type === 'LEADS_TO' ? 2 : 1.2;
      if (!isPassable) {
        ctx.setLineDash([4, 4]);
      } else {
        ctx.setLineDash([]);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Relationship label in middle
      if (zoom >= 0.9) {
        const midX = (source.x + target.x) / 2;
        const midY = (source.y + target.y) / 2;
        ctx.fillStyle = 'rgba(71, 85, 105, 0.8)';
        ctx.font = '8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(link.type, midX, midY - 2);
      }
    }

    // Draw Nodes
    for (const node of nodes) {
      const isSelected = selectedNode && selectedNode.id === node.id;
      const color = NODE_COLORS[node.label] || '#64748b';

      // Outer glow for selected
      if (isSelected) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + 6, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(13, 148, 136, 0.2)';
        ctx.fill();
        ctx.strokeStyle = '#0d9488';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Node Body
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Node Label / Name
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 10px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      
      const displayName = node.name.length > 14 ? node.name.slice(0, 12) + '…' : node.name;
      ctx.fillText(displayName, node.x, node.y + node.radius + 12);
      
      // Node type label
      ctx.fillStyle = 'rgba(100, 116, 139, 0.9)';
      ctx.font = '8px monospace';
      ctx.fillText(node.label, node.x, node.y - node.radius - 4);
    }

    ctx.restore();
  };

  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - offset.x) / zoom;
    const mouseY = (e.clientY - rect.top - offset.y) / zoom;

    const clickedNode = nodes.find(n => {
      const dx = n.x - mouseX;
      const dy = n.y - mouseY;
      return Math.sqrt(dx * dx + dy * dy) <= n.radius + 5;
    });

    if (clickedNode) {
      setDraggingNode(clickedNode);
      if (onSelectNode) onSelectNode(clickedNode);
    } else {
      setIsPanning(true);
      setPanStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
      if (onSelectNode) onSelectNode(null);
    }
  };

  const handleMouseMove = (e) => {
    if (draggingNode) {
      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left - offset.x) / zoom;
      const mouseY = (e.clientY - rect.top - offset.y) / zoom;
      draggingNode.x = mouseX;
      draggingNode.y = mouseY;
    } else if (isPanning) {
      setOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setDraggingNode(null);
    setIsPanning(false);
  };

  const resetView = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  return (
    <div className="relative w-full h-[580px] rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-inner">
      
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={800}
        height={550}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />

      {/* Legend */}
      <div className="absolute top-4 left-4 flex flex-wrap gap-2 p-2 rounded-xl bg-white/90 border border-slate-200 shadow-sm backdrop-blur-md text-[11px]">
        {Object.entries(NODE_COLORS).map(([label, color]) => (
          <div key={label} className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-100">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
            <span className="font-semibold text-slate-700">{label}</span>
          </div>
        ))}
      </div>

      {/* Canvas Controls */}
      <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-white/90 p-1.5 rounded-xl border border-slate-200 shadow-sm backdrop-blur-md">
        <button
          onClick={() => setZoom(z => Math.min(z + 0.2, 2.5))}
          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          onClick={() => setZoom(z => Math.max(z - 0.2, 0.4))}
          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          onClick={resetView}
          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          title="Reset View"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      {/* Helper text */}
      <div className="absolute bottom-4 left-4 text-[10px] text-slate-500 font-medium">
        💡 Drag nodes to rearrange • Click node to inspect details • Drag background to pan
      </div>
    </div>
  );
}
