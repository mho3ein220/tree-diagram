# 🌳 TreeDiagram (React + D3.js)

A React component for rendering and interacting with hierarchical **tree diagrams** using **D3.js**.  
Perfect for displaying hierarchical data such as **organizational structures, project steps, legal frameworks, or workflows**.  

---

## 🚀 Features

- 📂 Render hierarchical data as an interactive tree.  
- 🖱️ Expand/Collapse nodes on click.  
- 🔍 Zoom and Pan with mouse or buttons.  
- 🎯 Auto-center and zoom to clicked nodes.  
- 🎨 Fully customizable styles with **CSS Modules**.  
- ⚡ Smooth D3 transitions and animations.  
- 📱 Responsive and mobile-friendly.  

---

## Props

| Prop               | Type     | Default  | Description                                                                |
| ------------------ | -------- | -------- | -------------------------------------------------------------------------- |
| `data`             | `object` | required | Tree data in a hierarchical format (`{ name, children, stage, percent }`). |
| `initialOpenDepth` | `number` | `1`      | Depth of the tree that should be expanded initially.                       |


## 📦 Installation

```bash
npm install tree-diagram-react
# or
yarn add tree-diagram-react

```

## 🛠️ Usage

```jsx
import React from "react";
import TreeDiagram from "tree-diagram-react";
import "tree-diagram-react/styles.css"; // import styles

const data = {
  name: "Root",
  children: [
    {
      name: "Child 1",
      stage: "Phase 1",
      percent: 60,
      children: [
        { name: "Child 1.1", stage: "Subphase" },
        { name: "Child 1.2", percent: 80 },
      ],
    },
    {
      name: "Child 2",
    },
  ],
};

export default function App() {
  return <TreeDiagram data={data} initialOpenDepth={1} />;
}
