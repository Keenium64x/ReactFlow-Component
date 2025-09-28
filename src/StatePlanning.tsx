import { useState, useCallback } from 'react';
import { ReactFlow, Background, Controls, applyEdgeChanges, applyNodeChanges, addEdge, Handle  } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './StatePlanning.css'

import Workspace from './components/Workspace';



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

  // create a lookup of current node ids
  const nodeIdSet = new Set(nodes.map((n) => n.id));

  // add nodes to dagre
  nodes.forEach((node) => {
    g.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  // only keep edges that connect existing nodes
  const validEdges = edges.filter(
    (edge) => nodeIdSet.has(edge.source) && nodeIdSet.has(edge.target)
  );

  validEdges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  const layoutedNodes = nodes.map((node) => {
    const pos = g.node(node.id);
    // pos should exist because we called setNode for every node
    const position = pos
      ? { x: pos.x - nodeWidth / 2, y: pos.y - nodeHeight / 2 }
      : node.position ?? { x: 0, y: 0 };

    return {
      ...node,
      position,
      sourcePosition: isHorizontal ? "right" : "bottom",
      targetPosition: isHorizontal ? "left" : "top",
    };
  });

  // return only the valid edges (copied to avoid mutation)
  const layoutedEdges = validEdges.map((edge) => {
    const newEdge = { ...edge };
    if (!newEdge.id) newEdge.id = `${newEdge.source}-${newEdge.target}`;
    return newEdge;
  });

  return { nodes: layoutedNodes, edges: layoutedEdges };
};


const initialNodes = [
  { id: "n1", type: 'nodetype', position: { x: 0, y: 0 }, data: { label: "Node 1" } },
  { id: "n2", type: 'nodetype', position: { x: 100, y: 100 }, data: { label: "Node 2" } },
  { id: "n3", type: 'nodetype', position: { x: 250, y: 150 }, data: { label: "Node 3" } },
  { id: "n4", type: 'nodetype', position: { x: 350, y: 150 }, data: { label: "Node 4" } },
  { id: "n5", type: 'nodetype', position: { x: 350, y: 150 }, data: { label: "Node 5" } },
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


export default function StatePlanning() {
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
  (params) => {
    setEdges((edgesSnapshot) => {
      const newEdges = addEdge({ ...params, animated: true }, edgesSnapshot);

      // re-layout using current nodes + new edges
      const { nodes: newLayoutedNodes, edges: newLayoutedEdges } =
        getLayoutedElements(nodes, newEdges, "TB"); // or "LR"

      setNodes(newLayoutedNodes);
      return newLayoutedEdges;
    });
  },
  [nodes, setNodes]
);

const onNodesDelete = useCallback(
  (deletedNodes) => {
    // compute deleted ids from the callback param (avoid relying on external state timing)
    const deletedIds = new Set(deletedNodes.map((n) => n.id));

    // compute remaining nodes & edges explicitly
    const remainingNodes = nodes.filter((n) => !deletedIds.has(n.id));
    const remainingEdges = edges.filter(
      (e) => !deletedIds.has(e.source) && !deletedIds.has(e.target)
    );

    // layout only the remaining graph
    const { nodes: newLayoutedNodes, edges: newLayoutedEdges } =
      getLayoutedElements(remainingNodes, remainingEdges, "TB"); // or "LR"

    setNodes(newLayoutedNodes);
    setEdges(newLayoutedEdges);
  },
  [nodes, edges, setNodes, setEdges]
);

const onEdgesDelete = useCallback(
  (deletedEdges) => {
    // filter out the deleted edges
    const deletedIds = new Set(deletedEdges.map((e) => e.id));
    const remainingEdges = edges.filter((e) => !deletedIds.has(e.id));

    // re-layout using current nodes + remaining edges
    const { nodes: newLayoutedNodes, edges: newLayoutedEdges } =
      getLayoutedElements(nodes, remainingEdges, "TB"); // or "LR"

    setNodes(newLayoutedNodes);
    setEdges(newLayoutedEdges);
  },
  [nodes, edges, setNodes, setEdges]
);


function DefaultNode(node) {

  const onAddChild = useCallback(
  (parentId) => {
    // make a unique id for the new node
    const newNodeId = `node_${+new Date()}`;

    // define the new node
    const newNode = {
      id: newNodeId,
      type: 'nodetype',
      data: { label: `Node ${nodes.length + 1}` },
      position: { x: 0, y: 0 }, // dagre will reposition
    };

    // define the new edge (animated)
    const newEdge = {
      id: `${parentId}-${newNodeId}`,
      source: parentId,
      target: newNodeId,
      animated: true,
    };

    // update state
    const updatedNodes = [...nodes, newNode];
    const updatedEdges = [...edges, newEdge];

    // recalc layout
    const { nodes: newLayoutedNodes, edges: newLayoutedEdges } =
      getLayoutedElements(updatedNodes, updatedEdges, "TB"); // or "LR"

    setNodes(newLayoutedNodes);
    setEdges(newLayoutedEdges);
  },
  [nodes, edges, setNodes, setEdges]
);

  return (
  <div
    className="nodrag react-flow__node-default"
    style={{ position: "relative", padding: 10 }}
  >
    <Handle type="target" position="top" />
    <div>Default Node</div>

    <button
      onClick={() => onAddChild(node.id)}
      style={{
        position: "absolute",
        bottom: -12, // just outside the node
        left: "50%",
        transform: "translateX(-50%)",
        width: 24,
        height: 24,
        borderRadius: "50%",
        border: "none",
        backgroundColor: "#4CAF50",
        color: "white",
        cursor: "pointer",
        fontSize: 16,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
      }}
    >
      +
    </button>

    <Handle style={{opacity: "0", background: "transparent", border: "none", color: "transparent",}} type="source" position="bottom" />
  </div>
  );
}

const nodeTypes = {
  nodetype: DefaultNode,
};


const [showWorkspace, setShowWorkspace] = useState(false);
const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);

function openWorkspace(event: React.MouseEvent, node: string) {
  if (event.target.tagName !== 'BUTTON') { 
    setCurrentNodeId(node);               
    setShowWorkspace((prev) => !prev);      
  }
}



  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <ReactFlow

        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodesDelete={onNodesDelete}
        onEdgesDelete={onEdgesDelete}
        nodeTypes={nodeTypes}
        onNodeClick={openWorkspace}
        noDragClassName='nodrag'
        fitView
        colorMode='dark'
      >
        <Background />
        <Controls />
      </ReactFlow>
      {showWorkspace && <Workspace nodePressed={currentNodeId} />}
    </div>

  );
  
}


