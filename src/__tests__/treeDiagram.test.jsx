import React from "react";                 // 👈 این خط باید اضافه بشه
import { render, screen } from "@testing-library/react";
import TreeDiagram from "../components/TreeDiagram/TreeDiagram";

test("renders root node", () => {
  const data = { name: "root" };
  render(<TreeDiagram data={data} />);
  expect(screen.getByText(/root/i)).toBeInTheDocument();
});
