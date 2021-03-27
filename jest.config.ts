import type { Config } from "@jest/types";
import { compilerOptions } from "./tsconfig.json";
import { pathsToModuleNameMapper } from "ts-jest/utils";

const config: Config.InitialOptions = {
  preset: "ts-jest",
  roots: ["<rootDir>"],
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  },
  setupFilesAfterEnv: ["<rootDir>/test/setup.ts"],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths || {}, { prefix: "<rootDir>/" }),
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"]
};

export default config;
