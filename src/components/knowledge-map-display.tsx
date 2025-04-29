
"use client";

import React, { useMemo } from 'react';
import type { GenerateKnowledgeMapOutput, NodeType, EdgeType } from "@/ai/flows/generate-knowledge-map";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, BrainCircuit, ZoomIn, ZoomOut, Minimize2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import ReactMarkdown from 'react-markdown';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Button } from './ui/button';

interface KnowledgeMapDisplayProps {
  map: GenerateKnowledgeMapOutput | null;
  isLoading: boolean;
  error: string | null;
}

// Basic styles for markdown elements (can be customized further)
const markdownComponents = {
    h1: ({node, ...props}: any) => <h1 className="text-2xl font-bold my-4" {...props} />,
    h2: ({node, ...props}: any) => <h2 className="text-xl font-semibold my-3" {...props} />,
    h3: ({node, ...props}: any) => <h3 className="text-lg font-semibold my-2" {...props} />,
    p: ({node, ...props}: any) => <p className="mb-2 leading-relaxed" {...props} />,
    ul: ({node, ...props}: any) => <ul className="list-disc pl-6 mb-3 space-y-1" {...props} />,
    ol: ({node, ...props}: any) => <ol className="list-decimal pl-6 mb-3 space-y-1" {...props} />,
    li: ({node, ...props}: any) => <li className="mb-1" {...props} />,
    strong: ({node, ...props}: any) => <strong className="font-semibold text-foreground" {...props} />,
    a: ({node, ...props}: any) => <a className="text-primary underline hover:text-primary/80" {...props} />,
    code: ({node, ...props}: any) => <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono" {...props} />,
    pre: ({node, ...props}: any) => <pre className="bg-muted p-3 rounded overflow-x-auto text-sm font-mono" {...props} />,
};

// Function to generate initial positions for nodes (simple grid layout)
const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  if (!nodes || nodes.length === 0) {
    return { nodes, edges };
  }

  // Simple grid layout logic (can be replaced with more sophisticated layout algorithms)
  const nodeWidth = 172;
  const nodeHeight = 36;
  const nodesPerRow = Math.floor(800 / (nodeWidth + 20)); // Approx width available

  const layoutedNodes = nodes.map((node, index) => {
    const row = Math.floor(index / nodesPerRow);
    const col = index % nodesPerRow;
    return {
      ...node,
      // Ensure position is defined
      position: node.position || { x: col * (nodeWidth + 50), y: row * (nodeHeight + 50) },
    };
  });

  return { nodes: layoutedNodes, edges };
};

// Custom Node Types (Optional, for styling)
const nodeStyles: Record<NodeType['type'], React.CSSProperties> = {
    person: { background: '#a3e635', color: '#1a2e05', border: '1px solid #4d7c0f', padding: '5px 10px', borderRadius: '3px', fontSize: '12px', textAlign: 'center' },
    action: { background: '#60a5fa', color: '#1e3a8a', border: '1px solid #1d4ed8', padding: '5px 10px', borderRadius: '3px', fontSize: '12px', textAlign: 'center' },
    topic: { background: '#facc15', color: '#713f12', border: '1px solid #a16207', padding: '5px 10px', borderRadius: '3px', fontSize: '12px', textAlign: 'center' },
    timeline: { background: '#fca5a5', color: '#7f1d1d', border: '1px solid #b91c1c', padding: '5px 10px', borderRadius: '3px', fontSize: '12px', textAlign: 'center' },
    context: { background: '#d1d5db', color: '#1f2937', border: '1px solid #4b5563', padding: '5px 10px', borderRadius: '3px', fontSize: '12px', textAlign: 'center' },
};

const CustomNode = ({ data }: { data: { label: string, type: NodeType['type'] } }) => {
    const style = nodeStyles[data.type] || nodeStyles.context; // Fallback style
    return (
        <div style={style}>
            {data.label}
        </div>
    );
};

const nodeTypes = {
    custom: CustomNode, // Register custom node type if needed
};

export function KnowledgeMapDisplay({ map, isLoading, error }: KnowledgeMapDisplayProps) {
    const initialNodes = useMemo(() => {
        if (!map?.nodes) return [];
        // Map GenerateKnowledgeMapOutput nodes to React Flow nodes
        return map.nodes.map(n => ({
            id: n.id,
            type: 'custom', // Use custom node type
            data: { label: n.label, type: n.type },
            position: { x: Math.random() * 400, y: Math.random() * 400 }, // Start with random positions
        } as Node)); // Cast to Node type
    }, [map?.nodes]);

    const initialEdges = useMemo(() => {
        if (!map?.edges) return [];
        // Map GenerateKnowledgeMapOutput edges to React Flow edges
        return map.edges.map(e => ({
            id: e.id,
            source: e.source,
            target: e.target,
            label: e.label,
            animated: e.animated,
            type: 'smoothstep', // Default edge type
        } as Edge)); // Cast to Edge type
    }, [map?.edges]);

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(initialNodes, initialEdges);
    const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

    React.useEffect(() => {
        // Update state when map data changes
        const { nodes: newLayoutedNodes, edges: newLayoutedEdges } = getLayoutedElements(initialNodes, initialEdges);
        setNodes(newLayoutedNodes);
        setEdges(newLayoutedEdges);
    }, [initialNodes, initialEdges, setNodes, setEdges]);


  if (isLoading) {
    return (
      <Card className="mt-6 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BrainCircuit className="text-primary" />
            <span>Knowledge Map</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Skeletons for map loading state */}
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <div className="w-full h-64 md:h-96 bg-muted rounded-lg">
             <Skeleton className="h-full w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mt-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error Generating Knowledge Map</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!map) {
     return null; // Handled by parent
  }

  const hasGraphData = map.nodes && map.nodes.length > 0;

  return (
    <Card className="mt-6 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BrainCircuit className="text-primary" />
          <span>Knowledge Map</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Textual Description */}
        <div className="prose prose-sm max-w-none dark:prose-invert bg-secondary/20 p-4 rounded-lg">
         <h3 className="text-lg font-semibold mb-2 text-foreground">Summary</h3>
         <ReactMarkdown components={markdownComponents}>
            {map.mapDescription}
         </ReactMarkdown>
        </div>

        {/* Graphical Representation */}
        {hasGraphData ? (
             <div className="w-full h-[500px] md:h-[600px] border rounded-lg overflow-hidden bg-muted/10 relative">
                 <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    nodeTypes={nodeTypes} // Pass custom node types
                    fitView
                    className="bg-background"
                >
                    <Controls showInteractive={false}>
                         <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => {}} title="Zoom In"><ZoomIn size={16}/></Button>
                         <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => {}} title="Zoom Out"><ZoomOut size={16}/></Button>
                         <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => {}} title="Fit View"><Minimize2 size={16}/></Button>
                    </Controls>
                    <MiniMap nodeStrokeWidth={3} zoomable pannable nodeColor={n => nodeStyles[n.data.type as NodeType['type']]?.background || '#ccc'} />
                    <Background gap={16} color="#e0e0e0" />
                    <Panel position="top-right" className='text-xs text-muted-foreground'>
                        Drag nodes to rearrange
                    </Panel>
                 </ReactFlow>
             </div>
         ) : (
            <p className="text-muted-foreground text-center italic">No graph data available to display.</p>
         )}
      </CardContent>
    </Card>
  );
}
