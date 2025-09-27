import type{ Node, Edge, FitViewOptions, OnConnect, OnNodesChange, OnEdgesChange, OnNodeDrag, DefaultEdgeOptions,
} from '@xyflow/react';

import { ReactFlow, Background, Controls } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useState, useCallback } from 'react';
import { applyEdgeChanges, applyNodeChanges, addEdge } from '@xyflow/react';
import { Handle } from '@xyflow/react';
import './App.css'



import dagre from "dagre";

const nodeWidth = 172;
const nodeHeight = 36;

export function getLayoutedElements(
  nodes,
  edges,
  direction: "LR" | "TB" = "LR"
) {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));

  const isHorizontal = direction === "LR";
  g.setGraph({ rankdir: direction });

  // add nodes
  nodes.forEach((node) => {
    g.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  // add edges
  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  // update node positions
  const layoutedNodes = nodes.map((node) => {
    const pos = g.node(node.id);
    return {
      ...node,
      position: {
        x: pos.x - nodeWidth / 2,
        y: pos.y - nodeHeight / 2,
      },
      sourcePosition: isHorizontal ? "right" : "bottom",
      targetPosition: isHorizontal ? "left" : "top",
    };
  });

  return { nodes: layoutedNodes, edges };
}
const aaa = "Node 1"

const initialNodes = [
  { id: "n1", position: { x: 0, y: 0 }, data: { label: aaa } },
  { id: "n2", position: { x: 100, y: 100 }, data: { label: "Node 2" } },
  { id: "n3", position: { x: 250, y: 150 }, data: { label: "Node 3" } },
  { id: "n4", position: { x: 350, y: 150 }, data: { label: "Node 4" } },
];

const initialEdges = [
  { id: "n1-n2", source: "n1", target: "n2", animated: true },
  { id: "n1-n3", source: "n1",  target: "n3", animated: true },
  { id: "n1-n4", source: "n1",  target: "n4", animated: true },
];

const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
  initialNodes,
  initialEdges,
  "TB" // or "LR"
);



export default function App() {
  const [nodes, setNodes] = useState(layoutedNodes);
  const [edges, setEdges] = useState(layoutedEdges);

  const onNodesChange = useCallback(
  (changes) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
  [],
);
const onEdgesChange = useCallback(
  (changes) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
  [],
);
const onConnect = useCallback(
  (params) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
  [],
);

  return (
    <div className='nodrag' style={{ height: '100vh', width: '100vw' }}>
      <ReactFlow
        className='nodrag'
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        colorMode='dark'
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}


