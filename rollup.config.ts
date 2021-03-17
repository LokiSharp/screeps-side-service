/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import sourceMaps from "rollup-plugin-sourcemaps";
import typescript from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";
import builtins from "rollup-plugin-node-builtins";
import globals from "rollup-plugin-node-globals";

const pkg = require("./package.json");

const libraryName = "screeps-side-service";

export default {
  input: `src/${libraryName}.ts`,
  output: [
    { file: pkg.main, name: libraryName, format: "umd", sourcemap: true },
    { file: pkg.module, format: "es", sourcemap: true }
  ],
  // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
  external: [],
  watch: {
    include: "src/**"
  },
  plugins: [
    globals(),
    builtins(),
    // Allow json resolution
    json(),
    // Compile TypeScript files
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    typescript(),
    // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
    commonjs(),
    // Allow node_modules resolution, so you can use 'external' to control
    // which external modules to include in the bundle
    // https://github.com/rollup/rollup-plugin-node-resolve#usage
    nodeResolve(),

    // Resolve source maps to the original source
    sourceMaps()
  ]
};
