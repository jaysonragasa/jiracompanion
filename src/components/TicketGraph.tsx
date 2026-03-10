import { useEffect, useRef, useState } from "react";
import { Network } from "vis-network";
import { DataSet } from "vis-data";
import { JiraTicket } from "../types";
import { useAppContext } from "../utils/AppContext";
import { getTypeStyle } from "../utils/theme";
import {
  Network as NetworkIcon,
  Pause,
  Play,
  Shrink,
  Expand,
  Palette,
  X,
  Target,
  Fish,
} from "lucide-react";
import TicketSidebar from "./TicketSidebar";

export default function TicketGraph({ tickets }: { tickets: JiraTicket[] }) {
  const { settings, setSettings, tickets: allTickets, findMatches, findIndex } = useAppContext();
  const isDark = settings.theme === "dark";

  const containerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<Network | null>(null);
  const nodesRef = useRef<DataSet<any> | null>(null);
  const edgesRef = useRef<DataSet<any> | null>(null);
  const fishCanvasRef = useRef<HTMLCanvasElement>(null);
  const fishAnimationRef = useRef<number | null>(null);

  const [isPhysicsEnabled, setIsPhysicsEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const [focusNodeId, setFocusNodeId] = useState<string | null>(null);
  const [focusDepth, setFocusDepth] = useState<number>(-1);

  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    nodeId: string;
  } | null>(null);
  const [sidebarNodeId, setSidebarNodeId] = useState<string | null>(null);

  const toggleFishPond = () => {
    setSettings({ ...settings, fishPondEnabled: !settings.fishPondEnabled });
  };

  useEffect(() => {
    if (settings.fishPondEnabled && !isLoading && networkRef.current && fishCanvasRef.current) {
      startFishSimulation(networkRef.current, fishCanvasRef.current);
    } else {
      if (fishAnimationRef.current) {
        cancelAnimationFrame(fishAnimationRef.current);
        fishAnimationRef.current = null;
      }
      if (fishCanvasRef.current) {
        const ctx = fishCanvasRef.current.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, fishCanvasRef.current.width, fishCanvasRef.current.height);
      }
    }
    return () => {
      if (fishAnimationRef.current) {
        cancelAnimationFrame(fishAnimationRef.current);
        fishAnimationRef.current = null;
      }
    };
  }, [settings.fishPondEnabled, isLoading]);

  const startFishSimulation = (network: Network, canvas: HTMLCanvasElement) => {
    const wrapper = document.getElementById('graph-wrapper');
    if (!canvas || !wrapper) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = wrapper.clientWidth;
    let height = wrapper.clientHeight;
    canvas.width = width;
    canvas.height = height;

    const resizeObserver = new ResizeObserver(() => {
        if (document.getElementById('fish-canvas')) {
            width = wrapper.clientWidth;
            height = wrapper.clientHeight;
            canvas.width = width;
            canvas.height = height;
        }
    });
    resizeObserver.observe(wrapper);

    const fishes: any[] = [];
    const numFishes = 20;
    const colors = ['#00ffff', '#ff00ff', '#ff0055', '#00ffaa', '#ffff00', '#3366ff', '#ff4400'];

    for (let i = 0; i < numFishes; i++) {
        fishes.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            size: 2.5 + Math.random() * 3,
            color: colors[Math.floor(Math.random() * colors.length)],
            offset: Math.random() * 1000,
            targetSpeed: 0.8 + Math.random() * 1.5,
            heldNodeId: null,
            holdTimer: 0
        });
    }

    const ripples: any[] = [];
    
    if (network) {
        network.on("dragEnd", function (params) {
            if (params.nodes.length > 0) {
                const nodeId = params.nodes[0];
                const pos = network.getPositions([nodeId])[nodeId];
                const domPos = network.canvasToDOM(pos);
                ripples.push({
                    x: domPos.x,
                    y: domPos.y,
                    radius: 15,
                    life: 1.0
                });
            }
        });
    }

    function animate() {
        if (!document.getElementById('fish-canvas')) {
            resizeObserver.disconnect();
            return;
        }
        
        ctx!.clearRect(0, 0, width, height);
        ctx!.globalCompositeOperation = 'lighter';

        let nodePositions: any = {};
        if (network && (network as any).body && (network as any).body.data.nodes.length > 0) {
            try {
                const positions = network.getPositions();
                for (let id in positions) {
                    nodePositions[id] = network.canvasToDOM(positions[id]);
                }
            } catch(e) {}
        }

        let currentlyHeldNodes = new Set(fishes.map(f => f.heldNodeId).filter(Boolean));

        for (let i = ripples.length - 1; i >= 0; i--) {
            let r = ripples[i];
            r.radius += 6;
            r.life -= 0.015;
            
            if (r.life <= 0) {
                ripples.splice(i, 1);
                continue;
            }

            ctx!.beginPath();
            ctx!.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
            ctx!.strokeStyle = `rgba(0, 255, 255, ${r.life * 0.4})`;
            ctx!.lineWidth = 2;
            ctx!.stroke();
            
            if (r.radius > 40) {
                ctx!.beginPath();
                ctx!.arc(r.x, r.y, r.radius - 30, 0, Math.PI * 2);
                ctx!.strokeStyle = `rgba(0, 255, 255, ${r.life * 0.2})`;
                ctx!.lineWidth = 1;
                ctx!.stroke();
            }
        }

        fishes.forEach(fish => {
            const margin = 80;
            const turnFactor = 0.05;
            if (fish.x < margin) fish.vx += turnFactor;
            if (fish.x > width - margin) fish.vx -= turnFactor;
            if (fish.y < margin) fish.vy += turnFactor;
            if (fish.y > height - margin) fish.vy -= turnFactor;

            let nodeFear = false;

            ripples.forEach(r => {
                const dx = fish.x - r.x;
                const dy = fish.y - r.y;
                const distSq = dx*dx + dy*dy;
                const dist = Math.sqrt(distSq);
                
                if (Math.abs(dist - r.radius) < 40) {
                    fish.vx += (dx / dist) * 2.5 * r.life;
                    fish.vy += (dy / dist) * 2.5 * r.life;
                    nodeFear = true;
                }
            });

            if (nodeFear && fish.heldNodeId) {
                fish.heldNodeId = null;
            }

            if (fish.heldNodeId) {
                fish.holdTimer--;
                if (fish.holdTimer <= 0) {
                    fish.heldNodeId = null;
                } else {
                    try {
                        const angle = Math.atan2(fish.vy, fish.vx);
                        const mouthX = fish.x + Math.cos(angle) * fish.size * 2;
                        const mouthY = fish.y + Math.sin(angle) * fish.size * 2;
                        const canvasPos = network.DOMtoCanvas({x: mouthX, y: mouthY});
                        network.moveNode(fish.heldNodeId, canvasPos.x, canvasPos.y);
                        
                        fish.vx *= 0.8;
                        fish.vy *= 0.8;
                    } catch(e) {
                        fish.heldNodeId = null;
                    }
                }
            } else {
                for (let id in nodePositions) {
                    const node = nodePositions[id];
                    if (!node) continue;
                    const dx = fish.x - node.x;
                    const dy = fish.y - node.y;
                    const distSq = dx*dx + dy*dy;
                    
                    if (distSq < 15000) {
                        const dist = Math.sqrt(distSq);
                        
                        if (!nodeFear && dist < 40 && !currentlyHeldNodes.has(id) && Math.random() < 0.2) {
                            fish.heldNodeId = id;
                            fish.holdTimer = 100 + Math.random() * 200;
                            currentlyHeldNodes.add(id);
                        } else if (!fish.heldNodeId) {
                            fish.vx += (dx / dist) * 0.5;
                            fish.vy += (dy / dist) * 0.5;
                            nodeFear = true;
                        }
                    }
                }
            }

            fishes.forEach(other => {
                if (fish !== other) {
                    const dx = fish.x - other.x;
                    const dy = fish.y - other.y;
                    const distSq = dx*dx + dy*dy;
                    if (distSq < 1600) {
                        const dist = Math.sqrt(distSq);
                        fish.vx += (dx / dist) * 0.05;
                        fish.vy += (dy / dist) * 0.05;
                    }
                }
            });

            if (!nodeFear && Math.random() < 0.05) {
                fish.vx += (Math.random() - 0.5) * 0.5;
                fish.vy += (Math.random() - 0.5) * 0.5;
            }

            const speed = Math.sqrt(fish.vx*fish.vx + fish.vy*fish.vy);
            const maxSpeed = nodeFear ? fish.targetSpeed * 3 : fish.targetSpeed * 1.5; 
            const minSpeed = fish.heldNodeId ? fish.targetSpeed * 0.2 : fish.targetSpeed * 0.5;
            
            if (speed > maxSpeed) {
                fish.vx = (fish.vx / speed) * maxSpeed;
                fish.vy = (fish.vy / speed) * maxSpeed;
            } else if (speed < minSpeed) {
                fish.vx = (fish.vx / speed) * minSpeed;
                fish.vy = (fish.vy / speed) * minSpeed;
            }

            fish.x += fish.vx;
            fish.y += fish.vy;
            
            if (fish.x < -50) fish.x = width + 50;
            if (fish.x > width + 50) fish.x = -50;
            if (fish.y < -50) fish.y = height + 50;
            if (fish.y > height + 50) fish.y = -50;

            const angle = Math.atan2(fish.vy, fish.vx);
            ctx!.save();
            ctx!.translate(fish.x, fish.y);
            ctx!.rotate(angle);

            ctx!.shadowBlur = 12;
            ctx!.shadowColor = fish.color;
            ctx!.fillStyle = fish.color;
            ctx!.strokeStyle = fish.color;

            const time = Date.now() / (250 / Math.max(1, speed)); 
            const tailAngle = Math.sin(time + fish.offset) * 0.6;
            const finAngle = Math.sin(time + fish.offset) * 0.4;

            ctx!.beginPath();
            ctx!.ellipse(0, 0, fish.size * 2, fish.size, 0, 0, Math.PI * 2);
            ctx!.fill();

            ctx!.beginPath();
            ctx!.moveTo(-fish.size * 1.5, 0);
            ctx!.lineTo(-fish.size * 4, -fish.size * Math.sin(tailAngle + 1));
            ctx!.lineTo(-fish.size * 4, fish.size * Math.sin(tailAngle - 1));
            ctx!.closePath();
            ctx!.fill();

            ctx!.lineWidth = fish.size * 0.4;
            ctx!.lineCap = 'round';
            
            ctx!.beginPath();
            ctx!.moveTo(0, fish.size * 0.8);
            ctx!.lineTo(-fish.size, fish.size * 2 + finAngle * fish.size);
            ctx!.stroke();

            ctx!.beginPath();
            ctx!.moveTo(0, -fish.size * 0.8);
            ctx!.lineTo(-fish.size, -fish.size * 2 - finAngle * fish.size);
            ctx!.stroke();

            ctx!.shadowBlur = 0;
            ctx!.fillStyle = '#000';
            ctx!.beginPath();
            ctx!.arc(fish.size, -fish.size * 0.4, fish.size * 0.25, 0, Math.PI * 2);
            ctx!.arc(fish.size, fish.size * 0.4, fish.size * 0.25, 0, Math.PI * 2);
            ctx!.fill();

            ctx!.restore();
        });

        fishAnimationRef.current = requestAnimationFrame(animate);
    }

    animate();
  };

  useEffect(() => {
    return () => {
      if (networkRef.current) {
        networkRef.current.destroy();
        networkRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const allNodesMap = new Map();
    const allEdges: any[] = [];
    const linkCounts = new Map();

    tickets.forEach((ticket) => {
      const links = ticket.fields.issuelinks || [];
      linkCounts.set(
        ticket.key,
        (linkCounts.get(ticket.key) || 0) + links.length,
      );

      links.forEach((link) => {
        const linkedTicket = link.outwardIssue || link.inwardIssue;
        if (linkedTicket) {
          linkCounts.set(
            linkedTicket.key,
            (linkCounts.get(linkedTicket.key) || 0) + 1,
          );
        }
      });
    });

    tickets.forEach((ticket) => {
      const typeName = ticket.fields.issuetype?.name || "Task";
      const style = getTypeStyle(typeName, isDark);
      const connectionCount = linkCounts.get(ticket.key) || 0;

      const assignee = ticket.fields.assignee;
      const avatarUrl =
        assignee?.avatarUrls?.["48x48"] || assignee?.avatarUrls?.["32x32"];

      if (!allNodesMap.has(ticket.key)) {
        allNodesMap.set(ticket.key, {
          id: ticket.key,
          label: `${ticket.key}\n${ticket.fields.status?.name || ""}`,
          title: `${ticket.fields.summary}\nType: ${typeName}\nAssignee: ${assignee ? assignee.displayName : "Unassigned"}`,
          shape: avatarUrl ? "circularImage" : "dot",
          image: avatarUrl || undefined,
          shapeProperties: { useBorderWithImage: true },
          size: 15 + connectionCount * 4,
          color: {
            border: style.hexBorder,
            background: style.hexBg,
            highlight: {
              border: isDark ? "#ffffff" : "#000000",
              background: style.hexBg,
            },
          },
          font: {
            color: isDark ? "#e2e8f0" : "#475569",
            face: "Inter, system-ui, sans-serif",
            size: 12,
            bold: true,
          },
          borderWidth: 3,
          borderWidthSelected: 5,
        });
      }

      const links = ticket.fields.issuelinks || [];
      links.forEach((link) => {
        const linkedTicket = link.outwardIssue || link.inwardIssue;
        if (!linkedTicket) return;

        const isOutward = !!link.outwardIssue;
        const linkType = isOutward ? link.type.outward : link.type.inward;

        if (!allNodesMap.has(linkedTicket.key)) {
          const lConnCount = linkCounts.get(linkedTicket.key) || 0;
          const lTypeName = linkedTicket.fields?.issuetype?.name || "Task";
          const lStyle = getTypeStyle(lTypeName, isDark);

          const lAssignee = linkedTicket.fields?.assignee;
          const lAvatarUrl =
            lAssignee?.avatarUrls?.["48x48"] ||
            lAssignee?.avatarUrls?.["32x32"];

          allNodesMap.set(linkedTicket.key, {
            id: linkedTicket.key,
            label: `${linkedTicket.key}\n${linkedTicket.fields?.status?.name || "?"}`,
            title: `${linkedTicket.fields?.summary || "External Ticket"}\nType: ${lTypeName}\nAssignee: ${lAssignee ? lAssignee.displayName : "Unassigned"}`,
            shape: lAvatarUrl ? "circularImage" : "dot",
            image: lAvatarUrl || undefined,
            shapeProperties: { useBorderWithImage: true },
            size: 10 + lConnCount * 3,
            color: {
              border: lStyle.hexBorder,
              background: lStyle.hexBg,
              highlight: {
                border: isDark ? "#ffffff" : "#000000",
                background: lStyle.hexBg,
              },
            },
            font: {
              color: isDark ? "#71717a" : "#94a3b8",
              face: "Inter, system-ui, sans-serif",
              size: 10,
            },
            borderWidth: 2,
            borderWidthSelected: 3,
          });
        }

        allEdges.push({
          id: `${isOutward ? ticket.key : linkedTicket.key}-${isOutward ? linkedTicket.key : ticket.key}-${linkType}`,
          from: isOutward ? ticket.key : linkedTicket.key,
          to: isOutward ? linkedTicket.key : ticket.key,
          label: linkType,
          font: {
            align: "middle",
            size: 10,
            color: isDark ? "#a1a1aa" : "#64748b",
            face: "Inter, system-ui, sans-serif",
            strokeWidth: 2,
            strokeColor: isDark ? "#050505" : "#ffffff",
          },
          arrows: { to: { enabled: true, scaleFactor: 1.5 } },
          width: 3,
          color: {
            color: isDark ? "#71717a" : "#94a3b8",
            highlight: isDark ? "#f8fafc" : "#334155",
          },
          smooth: { type: "dynamic" },
        });
      });
    });

    let renderNodesArray = Array.from(allNodesMap.values());
    let renderEdgesArray = allEdges;

    if (focusNodeId) {
      const connectedNodes = new Set([focusNodeId]);

      if (focusDepth !== 0) {
        let currentLevel = [focusNodeId];
        let currentDepth = 0;

        while (
          currentLevel.length > 0 &&
          (focusDepth === -1 || currentDepth < focusDepth)
        ) {
          let nextLevel: string[] = [];
          allEdges.forEach((edge) => {
            if (
              currentLevel.includes(edge.from) &&
              !connectedNodes.has(edge.to)
            ) {
              connectedNodes.add(edge.to);
              nextLevel.push(edge.to);
            }
            if (
              currentLevel.includes(edge.to) &&
              !connectedNodes.has(edge.from)
            ) {
              connectedNodes.add(edge.from);
              nextLevel.push(edge.from);
            }
          });
          currentLevel = nextLevel;
          currentDepth++;
        }
      }

      renderNodesArray = renderNodesArray.filter((n) =>
        connectedNodes.has(n.id),
      );
      renderEdgesArray = allEdges.filter(
        (e) => connectedNodes.has(e.from) && connectedNodes.has(e.to),
      );
    }

    if (!networkRef.current) {
      nodesRef.current = new DataSet(renderNodesArray);
      edgesRef.current = new DataSet(renderEdgesArray);

      const data = { nodes: nodesRef.current, edges: edgesRef.current };

      const options = {
        physics: {
          enabled: isPhysicsEnabled,
          solver: "barnesHut",
          barnesHut: {
            gravitationalConstant: -2500,
            centralGravity: 0.1,
            springLength: 100,
            springConstant: 0.04,
            damping: 0.09,
            avoidOverlap: 0.1,
          },
          stabilization: { enabled: true, iterations: 150, updateInterval: 25 },
        },
        interaction: { hover: true, tooltipDelay: 200 },
      };

      setIsLoading(true);
      networkRef.current = new Network(containerRef.current, data, options);

      networkRef.current.on("stabilizationIterationsDone", () => {
        setIsLoading(false);
        if (!isPhysicsEnabled) {
          networkRef.current?.setOptions({ physics: { enabled: false } });
        }
      });

      networkRef.current.on("selectNode", (params) => {
        if (params.nodes.length > 0) {
          setSidebarNodeId(params.nodes[0]);
        }
      });

      networkRef.current.on("deselectNode", (params) => {
        if (params.nodes.length === 0) {
          setSidebarNodeId(null);
        }
      });

      networkRef.current.on("oncontext", (params) => {
        params.event.preventDefault();
        const nodeId = networkRef.current?.getNodeAt(params.pointer.DOM);

        if (nodeId) {
          const wrapperRect = document
            .getElementById("graph-wrapper")
            ?.getBoundingClientRect();
          if (wrapperRect) {
            const menuX = params.event.clientX - wrapperRect.left;
            const menuY = params.event.clientY - wrapperRect.top;
            setContextMenu({ x: menuX, y: menuY, nodeId: nodeId as string });
          }
        } else {
          setContextMenu(null);
        }
      });

      networkRef.current.on("click", () => setContextMenu(null));
      networkRef.current.on("dragStart", () => setContextMenu(null));
    } else {
      // Update existing network silently
      if (nodesRef.current && edgesRef.current) {
        const currentNodes = nodesRef.current.getIds();
        const newNodes = renderNodesArray.map((n) => n.id);
        const nodesToRemove = currentNodes.filter((id) => !newNodes.includes(id));

        nodesRef.current.remove(nodesToRemove);
        nodesRef.current.update(renderNodesArray);

        const currentEdges = edgesRef.current.getIds();
        const newEdges = renderEdgesArray.map((e) => e.id);
        const edgesToRemove = currentEdges.filter((id) => !newEdges.includes(id));

        edgesRef.current.remove(edgesToRemove);
        edgesRef.current.update(renderEdgesArray);
      }
    }
  }, [tickets, isDark, focusNodeId, focusDepth]);

  useEffect(() => {
    if (networkRef.current) {
      networkRef.current.setOptions({ physics: { enabled: isPhysicsEnabled } });
    }
  }, [isPhysicsEnabled]);

  const toggleWorkspaceFullscreen = () => {
    const contentArea = document.getElementById("dashboard-content");
    if (!document.fullscreenElement && contentArea) {
      contentArea.requestFullscreen().catch((err) => console.error(err));
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  const legendTypes = [
    "Bug",
    "Story",
    "Sub-Task",
    "Task",
    "Epic",
    "Enhancement",
    "Support",
    "Other",
  ];

  return (
    <div
      id="graph-wrapper"
      className="relative w-full h-[600px] bg-white dark:bg-[#050505] border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden transition-colors"
    >
      <canvas
        id="fish-canvas"
        ref={fishCanvasRef}
        className={`absolute inset-0 pointer-events-none z-0 w-full h-full ${settings.fishPondEnabled ? '' : 'hidden'}`}
      ></canvas>

      {isLoading && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/80 dark:bg-[#050505]/80 backdrop-blur-sm transition-opacity duration-300">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-200 dark:border-zinc-800 border-t-blue-600 dark:border-t-blue-500 rounded-full animate-spin"></div>
            <span className="text-sm font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest animate-pulse">
              Calculating Layout...
            </span>
          </div>
        </div>
      )}

      <div
        ref={containerRef}
        className="w-full h-full vis-network outline-none relative z-10"
      ></div>

      <div className="absolute top-4 left-4 z-10 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col gap-1 pointer-events-none transition-all">
        <div className="flex items-center gap-2">
          <NetworkIcon className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
            Graph View
          </span>
        </div>
        <span className="text-[10px] font-medium text-slate-500 dark:text-zinc-400 ml-6">
          Right-click node for details / depth filtering
        </span>
      </div>

      <div className="absolute top-4 right-4 z-10 flex items-center gap-2 transition-all">
        <button
          onClick={toggleFishPond}
          className="p-2 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm border border-slate-200 dark:border-zinc-800 rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors text-slate-600 dark:text-slate-300"
          title="Toggle Fish Pond"
        >
          <Fish className={`w-4 h-4 ${settings.fishPondEnabled ? 'text-blue-500 dark:text-blue-400' : ''}`} />
        </button>
        <button
          onClick={() => setIsPhysicsEnabled(!isPhysicsEnabled)}
          className="p-2 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm border border-slate-200 dark:border-zinc-800 rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors text-slate-600 dark:text-slate-300"
          title="Toggle Animation (Freeze Nodes)"
        >
          {isPhysicsEnabled ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </button>
        <button
          onClick={toggleWorkspaceFullscreen}
          className="p-2 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm border border-slate-200 dark:border-zinc-800 rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors text-slate-600 dark:text-slate-300"
          title="Toggle Fullscreen"
        >
          {document.fullscreenElement ? (
            <Shrink className="w-4 h-4" />
          ) : (
            <Expand className="w-4 h-4" />
          )}
        </button>
      </div>

      <div className="absolute bottom-4 left-4 z-10 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-lg pointer-events-none flex flex-col gap-2 transition-all">
        <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest mb-1 border-b border-slate-200 dark:border-zinc-800 pb-1.5 flex items-center gap-1.5">
          <Palette className="w-3 h-3" /> Border Colors
        </span>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
          {legendTypes.map((t) => {
            const style = getTypeStyle(t, isDark);
            return (
              <div key={t} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full border-[3px]"
                  style={{
                    borderColor: style.hexBorder,
                    backgroundColor: style.hexBg,
                  }}
                ></div>
                <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                  {t}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {focusNodeId && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md px-6 py-4 rounded-xl border border-blue-200 dark:border-blue-900 shadow-xl flex items-center gap-6 animate-in slide-in-from-bottom-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
              Focusing on
            </span>
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
              {focusNodeId}
            </span>
          </div>
          <div className="h-8 w-px bg-slate-200 dark:bg-zinc-700"></div>
          <div className="flex flex-col gap-1 min-w-[150px]">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-400">
              <span>Connection Depth</span>
              <span className="text-blue-600 dark:text-blue-400">
                {focusDepth === -1 ? "All" : focusDepth}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="4"
              value={focusDepth === -1 ? "4" : focusDepth}
              onChange={(e) =>
                setFocusDepth(
                  e.target.value === "4" ? -1 : parseInt(e.target.value),
                )
              }
              className="w-full accent-blue-600 cursor-grab active:cursor-grabbing"
            />
            <div className="flex justify-between text-[8px] text-slate-400 px-1 mt-0.5 font-bold">
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>ALL</span>
            </div>
          </div>
          <button
            onClick={() => {
              setFocusNodeId(null);
              setFocusDepth(-1);
            }}
            className="p-2 bg-slate-100 dark:bg-zinc-800 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 text-slate-500 dark:text-slate-300 rounded-lg transition-colors ml-2"
            title="Clear Focus"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <TicketSidebar
        nodeId={sidebarNodeId}
        onClose={() => {
          setSidebarNodeId(null);
          if (networkRef.current) networkRef.current.unselectAll();
        }}
        allTickets={allTickets}
      />

      {contextMenu && (
        <div
          className="absolute z-50 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl shadow-xl py-1 w-48 overflow-hidden"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            onClick={() => {
              setFocusNodeId(contextMenu.nodeId);
              setFocusDepth(-1);
              setContextMenu(null);
            }}
            className="w-full text-left px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-2 transition-colors"
          >
            <Target className="w-4 h-4" /> Show Only This
          </button>
        </div>
      )}
    </div>
  );
}
