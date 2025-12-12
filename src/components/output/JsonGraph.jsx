import React, { useEffect, useCallback } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    Handle,
    Position,
    ReactFlowProvider,
    useReactFlow
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import {
    Box,
    Type,
    Hash,
    Braces,
    Brackets,
    ChevronDown,
    Check,
    Circle
} from 'lucide-react';

// --- Utils ---
const getNodeTypeIcon = (type) => {
    switch (type) {
        case 'object': return <Braces size={14} className="text-indigo-500" />;
        case 'array': return <Brackets size={14} className="text-emerald-500" />;
        case 'string': return <Type size={14} className="text-amber-500" />;
        case 'number': return <Hash size={14} className="text-blue-500" />;
        case 'boolean': return <Check size={14} className="text-rose-500" />;
        case 'null': return <Circle size={14} className="text-slate-500" />;
        default: return <Circle size={14} className="text-slate-500" />;
    }
};

const getLayoutedElements = (nodes, edges) => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    dagreGraph.setGraph({ rankdir: 'LR', ranksep: 100, nodesep: 50 }); // Left to Right layout

    nodes.forEach((node) => {
        // Approximate width/height based on content and GlassNode styling
        dagreGraph.setNode(node.id, { width: 220, height: 80 });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        return {
            ...node,
            targetPosition: 'left',
            sourcePosition: 'right',
            position: {
                x: nodeWithPosition.x - 110, // Center offset
                y: nodeWithPosition.y - 40,
            },
        };
    });

    return { nodes: layoutedNodes, edges };
};

// --- Custom Node ---
const GlassNode = ({ data }) => {
    const isExpandable = data.type === 'object' || data.type === 'array';
    const Icon = getNodeTypeIcon(data.type);

    return (
        <div className={`
            group relative min-w-[180px] rounded-xl border transition-all duration-300
            ${data.isExpanded
                ? 'bg-white/90 dark:bg-slate-800/90 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.2)]'
                : 'bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-indigo-300'
            }
            backdrop-blur-md
        `}>
            <Handle type="target" position={Position.Left} className="!bg-slate-300 dark:!bg-slate-600 !w-2 !h-2" />

            <div className="px-4 py-3 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    {Icon}
                </div>

                <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">
                        {data.type === 'array' ? `Array [${data.childCount}]` : data.label || 'Root'}
                    </p>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate font-mono">
                        {data.preview}
                    </p>
                </div>

                {isExpandable && (
                    <div className={`
                        text-slate-400 transition-transform duration-300
                        ${data.isExpanded ? 'rotate-180 text-indigo-500' : ''}
                    `}>
                        <ChevronDown size={16} />
                    </div>
                )}
            </div>

            <Handle type="source" position={Position.Right} className="!bg-indigo-500 !w-2 !h-2" />
        </div>
    );
};

const nodeTypes = { glass: GlassNode };

// --- Main Components ---

export function JsonGraph(props) {
    return (
        <ReactFlowProvider>
            <JsonGraphContent {...props} />
        </ReactFlowProvider>
    );
}

function JsonGraphContent({ data }) {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const { fitView } = useReactFlow();

    // Initialize Graph
    useEffect(() => {
        if (!data) {
            setNodes([]);
            setEdges([]);
            return;
        }

        const rootNode = {
            id: 'root',
            type: 'glass',
            position: { x: 0, y: 0 },
            data: {
                label: 'Root',
                type: Array.isArray(data) ? 'array' : typeof data,
                value: data, // Store the actual data for expansion
                preview: Array.isArray(data) ? `Array(${data.length})` : (typeof data === 'object' ? 'Object' : String(data)),
                isExpanded: false,
                childCount: (typeof data === 'object' && data !== null) ? Object.keys(data).length : 0
            }
        };

        setNodes([rootNode]);
        setEdges([]);
        setTimeout(() => fitView({ padding: 0.2 }), 50);

    }, [data, fitView, setNodes, setEdges]);

    const handleNodeClick = useCallback((event, node) => {
        // Only expand/collapse if the node has a value and it's an object or array
        if (!node.data.value || (typeof node.data.value !== 'object' && !Array.isArray(node.data.value))) {
            return;
        }

        const isExpanded = node.data.isExpanded;
        const nodeId = node.id;
        const childrenData = node.data.value;

        if (!isExpanded) {
            // EXPAND
            const newNodes = [];
            const newEdges = [];

            Object.entries(childrenData).forEach(([key, value]) => {
                const id = `${nodeId}-${key}`;
                const type = Array.isArray(value) ? 'array' : (value === null ? 'null' : typeof value);

                let preview = String(value);
                if (type === 'object') preview = '{...}';
                if (type === 'array') preview = `[${value.length}]`;
                if (type === 'string') preview = `"${value.substring(0, 20)}${value.length > 20 ? '...' : ''}"`;
                if (type === 'null') preview = 'null';
                if (type === 'undefined') preview = 'undefined';

                newNodes.push({
                    id,
                    type: 'glass',
                    position: { x: 0, y: 0 }, // Position will be set by layout
                    data: {
                        label: key,
                        type,
                        value, // Store child data for further expansion
                        preview,
                        isExpanded: false,
                        childCount: (typeof value === 'object' && value !== null) ? Object.keys(value).length : 0
                    }
                });

                newEdges.push({
                    id: `${nodeId}->${id}`,
                    source: nodeId,
                    target: id,
                    animated: true,
                    style: { stroke: '#6366f1' }
                });
            });

            // Mark clicked node as expanded
            const updatedNodes = nodes.map(n => n.id === nodeId ? { ...n, data: { ...n.data, isExpanded: true } } : n);
            const finalNodes = [...updatedNodes, ...newNodes];
            const finalEdges = [...edges, ...newEdges];

            // Re-run layout
            const layout = getLayoutedElements(finalNodes, finalEdges);
            setNodes(layout.nodes);
            setEdges(layout.edges);

            // Wait for render then fit view if needed, or just let user pan?
            // Users usually prefer not to lose context, so maybe don't fitView completely, or just gentle animation.
            // But let's keep it simple for now.
            setTimeout(() => fitView({ padding: 0.2 }), 50);

        } else {
            // COLLAPSE
            // Find all descendants recursively
            const getDescendants = (parentId, currentEdges) => {
                let descendants = [];
                const directChildren = currentEdges.filter(e => e.source === parentId).map(e => e.target);
                descendants = [...directChildren];
                directChildren.forEach(childId => {
                    descendants = [...descendants, ...getDescendants(childId, currentEdges)];
                });
                return descendants;
            };

            const nodesToRemove = getDescendants(nodeId, edges);

            // Filter nodes
            const remainingNodes = nodes.filter(n => !nodesToRemove.includes(n.id) && n.id !== nodeId);

            // Mark clicked node as collapsed
            remainingNodes.push({ ...node, data: { ...node.data, isExpanded: false } });

            // Filter edges
            const remainingEdges = edges.filter(e =>
                !nodesToRemove.includes(e.target) &&
                !nodesToRemove.includes(e.source) &&
                e.source !== nodeId
            );

            const layout = getLayoutedElements(remainingNodes, remainingEdges);
            setNodes(layout.nodes);
            setEdges(layout.edges);
            setTimeout(() => fitView({ padding: 0.2 }), 50);
        }
    }, [nodes, edges, setNodes, setEdges, fitView]);

    return (
        <div className="h-full w-full bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl overflow-hidden backdrop-blur-sm border border-slate-200 dark:border-slate-800">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={handleNodeClick}
                nodeTypes={nodeTypes}
                fitView
                className="transition-opacity duration-500"
                minZoom={0.1}
                maxZoom={2}
                proOptions={{ hideAttribution: true }}
            >
                <Background color="#6366f1" variant="dots" gap={24} size={1} className="opacity-20" />
                <Controls className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-xl" />
                <MiniMap
                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-xl rounded-lg overflow-hidden"
                    nodeColor={n => n.data.type === 'object' || n.data.type === 'array' ? '#6366f1' : '#cbd5e1'}
                />
            </ReactFlow>
        </div>
    );
}
