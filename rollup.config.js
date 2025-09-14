import peerDepsExternal from "rollup-plugin-peer-deps-external";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import babel from "@rollup/plugin-babel";
import postcss from "rollup-plugin-postcss";
import { terser } from "rollup-plugin-terser";

const extensions = [".js", ".jsx"];

export default {
  input: "src/index.js",
  output: [
    {
      file: "dist/index.esm.js",
      format: "es",
      sourcemap: true
    },
    {
      file: "dist/index.cjs.js",
      format: "cjs",
      exports: "named",
      sourcemap: true
    }
  ],
  plugins: [
    peerDepsExternal(),
    resolve({ extensions }),
    commonjs(),
    postcss({
      modules: {
        generateScopedName: "[name]__[local]___[hash:base64:5]"
      },
      extract: "styles.css", // استخراج CSS به یک فایل
      minimize: true,
      sourceMap: true,
      plugins: []
    }),
    babel({
      babelHelpers: "bundled",
      extensions,
      include: ["src/**/*"],
      presets: ["@babel/preset-env", "@babel/preset-react"]
    }),
    terser()
  ],
  external: ["react", "react-dom", "d3"]
};
