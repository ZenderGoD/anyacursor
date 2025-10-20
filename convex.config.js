import { defineApp } from "convex/server";
import agentComponent from "./convex/agent-component.js";

export default defineApp({
  agent: agentComponent,
});
