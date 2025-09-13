import { render } from "@testing-library/react";
import TreeDiagram from "../components/TreeDiagram/TreeDiagram";

test("renders without crashing", () => {
  const data = { name: "root" };
  const { getByText } = render(<TreeDiagram data={data} />);
  expect(getByText(/root/i)).toBeTruthy();
});
