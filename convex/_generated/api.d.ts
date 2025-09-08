/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as agents_enhanced_spec_kit_agent from "../agents/enhanced-spec-kit-agent.js";
import type * as agents_enhancedSpecKitAgent from "../agents/enhancedSpecKitAgent.js";
import type * as agents_spec_kit_agent from "../agents/spec-kit-agent.js";
import type * as agents_specKitAgent from "../agents/specKitAgent.js";
import type * as agents_task_coordination from "../agents/task-coordination.js";
import type * as agents_taskCoordination from "../agents/taskCoordination.js";
import type * as auth from "../auth.js";
import type * as chat from "../chat.js";
import type * as conversations from "../conversations.js";
import type * as cursors_ai_agents from "../cursors/ai/agents.js";
import type * as cursors_ai_node_actions from "../cursors/ai/node/actions.js";
import type * as cursors_ai_response from "../cursors/ai/response.js";
import type * as cursors_ai_tools from "../cursors/ai/tools.js";
import type * as cursors_mutations from "../cursors/mutations.js";
import type * as cursors_queries from "../cursors/queries.js";
import type * as messages from "../messages.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "agents/enhanced-spec-kit-agent": typeof agents_enhanced_spec_kit_agent;
  "agents/enhancedSpecKitAgent": typeof agents_enhancedSpecKitAgent;
  "agents/spec-kit-agent": typeof agents_spec_kit_agent;
  "agents/specKitAgent": typeof agents_specKitAgent;
  "agents/task-coordination": typeof agents_task_coordination;
  "agents/taskCoordination": typeof agents_taskCoordination;
  auth: typeof auth;
  chat: typeof chat;
  conversations: typeof conversations;
  "cursors/ai/agents": typeof cursors_ai_agents;
  "cursors/ai/node/actions": typeof cursors_ai_node_actions;
  "cursors/ai/response": typeof cursors_ai_response;
  "cursors/ai/tools": typeof cursors_ai_tools;
  "cursors/mutations": typeof cursors_mutations;
  "cursors/queries": typeof cursors_queries;
  messages: typeof messages;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
