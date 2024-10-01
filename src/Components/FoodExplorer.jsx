import React, { useState, useEffect } from "react";
import ReactFlow, {
  Background,
  Controls,
  addEdge,
  useEdgesState,
} from "react-flow-renderer";
import useFetch from "../hooks/useFetch";

const initialNodes = [
  {
    id: "1",
    data: { label: "Explore" },
    position: { x: 50, y: 250 },
    type: "input",
    style: { backgroundColor: "lightGrey" },
  },
];

const initialEdges = [];

const FoodExplorer = () => {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useEdgesState(initialEdges);

  const { data: categories, loading } = useFetch(
    "https://www.themealdb.com/api/json/v1/1/categories.php"
  );

  const edgeExists = (source, target) => {
    return edges.some(
      (edge) => edge.source === source && edge.target === target
    );
  };

  useEffect(() => {
    if (!loading && categories.length > 0) {
      const categoryNodes = categories.map((category, index) => ({
        id: `category-${index}`,
        data: { label: category.strCategory },
        position: { x: 200, y: index * 100 + 50 },
        style: { backgroundColor: "#FFA07A" },
      }));
      setNodes((nds) => [...initialNodes, ...categoryNodes]);

      const newEdges = categoryNodes
        .filter((categoryNode) => !edgeExists("1", categoryNode.id))
        .map((categoryNode) => ({
          id: `edge-${categoryNode.id}`,
          source: "1",
          target: categoryNode.id,
          markerEnd: {
            type: "arrowclosed",
          },
        }));

      setEdges((eds) => [...eds, ...newEdges]);
    }
  }, [loading, categories]);

  const onNodesChange = (changes) =>
    setNodes((nds) => nds.map((node) => ({ ...node, ...changes })));
  const onConnect = (params) => {
    if (!edgeExists(params.source, params.target)) {
      setEdges((eds) =>
        addEdge({ ...params, markerEnd: { type: "arrowclosed" } }, eds)
      );
    }
  };

  const onNodeClick = (event, node) => {
    if (node.id.startsWith("category")) {
      fetch(
        `https://www.themealdb.com/api/json/v1/1/filter.php?c=${node.data.label}`
      )
        .then((res) => res.json())
        .then((mealsData) => {
          const filteredNodes = nodes.filter((n) => !n.id.startsWith("meal"));
          const filteredEdges = edges.filter(
            (e) => !e.source.startsWith("meal")
          );

          const mealNodes = mealsData.meals.slice(0, 5).map((meal, index) => ({
            id: `meal-${index}-${node.id}`,
            data: { label: meal.strMeal },
            position: { x: 400, y: index * 100 + 50 },
            style: { backgroundColor: "#87CEFA" },
          }));

          const mealEdges = mealNodes.map((mealNode) => ({
            id: `edge-${mealNode.id}`,
            source: node.id,
            target: mealNode.id,
            markerEnd: { type: "arrowclosed" },
          }));
          setNodes([
            ...filteredNodes,
            ...mealNodes,
            ...nodes.filter((n) => n.id.startsWith("category") || n.id === "1"),
          ]);
          setEdges([
            ...filteredEdges,
            ...mealEdges,
            ...edges.filter((e) => e.source === "1"),
          ]);
        });
    }
  };

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        fitView
      >
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
};

export default FoodExplorer;