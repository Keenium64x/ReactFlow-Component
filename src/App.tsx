

import '@xyflow/react/dist/style.css';

import { useState, useCallback } from 'react';
import { ReactFlow, Background, Controls, applyEdgeChanges, applyNodeChanges, addEdge, useReactFlow, ReactFlowProvider, Handle  } from '@xyflow/react';

import './App.css'

export function DefaultNode() {

  return (
    <div className="nodrag react-flow__node-default">
      <Handle type="target" position="top" />
      <div>Default Node</div>
      <Handle type="source" position="bottom" />
    </div>
  );
}

const nodeTypes = {
  nodetype: DefaultNode,
};

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



const initialNodes = [
  { id: "n1", type: 'nodetype', position: { x: 0, y: 0 }, data: { label: "Node 1" } },
  { id: "n2", type: 'nodetype', position: { x: 100, y: 100 }, data: { label: "Node 2" } },
  { id: "n3", type: '', position: { x: 250, y: 150 }, data: { label: "Node 3" } },
  { id: "n4", type: '', position: { x: 350, y: 150 }, data: { label: "Node 4" } },
  { id: "n5", type: '', position: { x: 350, y: 150 }, data: { label: "Node 5" } },
];

const initialEdges = [
  { id: "n1-n2", source: "n1", target: "n2", animated: true },
  { id: "n1-n3", source: "n1",  target: "n3", animated: true },
  { id: "n1-n4", source: "n1",  target: "n4", animated: true },
  { id: "n2-n5", source: "n2",  target: "n5", animated: true },
  { id: "n1-n5", source: "n1",  target: "n5", animated: true },
];

let { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
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

function openWorkspace() {
  
};




  return (
    <div className="react-flow__node nodrag" style={{ height: '100vh', width: '100vw' }}>

      <ReactFlow
        className='react-flow__node nodrag'
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        onNodeClick={openWorkspace}
        noDragClassName='nodrag'
        fitView
        colorMode='dark'
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>

  );
}


