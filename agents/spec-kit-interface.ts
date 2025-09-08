// Simple interface for interacting with the Spec Kit Agent
// You can use this to send feature requests and get back specifications, plans, and tasks

export interface SpecKitRequest {
  featureDescription: string;
  userContext?: string;
  techStack?: string;
  estimatedEffort?: string;
}

export interface SpecKitResponse {
  success: boolean;
  message: string;
  specification?: string;
  technicalPlan?: string;
  tasks?: string;
}

// Example usage:
// const response = await specKitAgent.generate({
//   featureDescription: "Build a conversational AI interface for cursor generation with tool calling",
//   userContext: "This is for the anyacursor platform",
//   techStack: "Vercel AI SDK + Convex + OpenRouter",
//   estimatedEffort: "3-4 days"
// });

export class SpecKitInterface {
  private agent: any; // The spec kit agent instance

  constructor(agent: any) {
    this.agent = agent;
  }

  async generateSpecification(request: SpecKitRequest): Promise<SpecKitResponse> {
    try {
      const result = await this.agent.generate({
        messages: [{
          role: 'user',
          content: `Create a specification for: ${request.featureDescription}${request.userContext ? `\n\nContext: ${request.userContext}` : ''}`
        }]
      });

      return {
        success: true,
        message: 'Specification created successfully',
        specification: result.text,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to create specification: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  async generateTechnicalPlan(specification: string, techStack?: string): Promise<SpecKitResponse> {
    try {
      const result = await this.agent.generate({
        messages: [{
          role: 'user',
          content: `Create a technical plan for this specification:\n\n${specification}\n\nTech Stack: ${techStack || 'Vercel AI SDK + Convex + OpenRouter'}`
        }]
      });

      return {
        success: true,
        message: 'Technical plan created successfully',
        technicalPlan: result.text,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to create technical plan: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  async generateTasks(technicalPlan: string, estimatedEffort?: string): Promise<SpecKitResponse> {
    try {
      const result = await this.agent.generate({
        messages: [{
          role: 'user',
          content: `Create a task breakdown for this technical plan:\n\n${technicalPlan}\n\nEstimated Effort: ${estimatedEffort || '3-4 days'}`
        }]
      });

      return {
        success: true,
        message: 'Task breakdown created successfully',
        tasks: result.text,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to create task breakdown: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  async generateCompleteWorkflow(request: SpecKitRequest): Promise<SpecKitResponse> {
    try {
      // Step 1: Generate specification
      const specResponse = await this.generateSpecification(request);
      if (!specResponse.success) {
        return specResponse;
      }

      // Step 2: Generate technical plan
      const planResponse = await this.generateTechnicalPlan(
        specResponse.specification!,
        request.techStack
      );
      if (!planResponse.success) {
        return planResponse;
      }

      // Step 3: Generate tasks
      const tasksResponse = await this.generateTasks(
        planResponse.technicalPlan!,
        request.estimatedEffort
      );
      if (!tasksResponse.success) {
        return tasksResponse;
      }

      return {
        success: true,
        message: 'Complete workflow generated successfully',
        specification: specResponse.specification,
        technicalPlan: planResponse.technicalPlan,
        tasks: tasksResponse.tasks,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to generate complete workflow: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }
}

// Helper function to create a simple request
export function createSpecKitRequest(
  featureDescription: string,
  options?: {
    userContext?: string;
    techStack?: string;
    estimatedEffort?: string;
  }
): SpecKitRequest {
  return {
    featureDescription,
    userContext: options?.userContext,
    techStack: options?.techStack,
    estimatedEffort: options?.estimatedEffort,
  };
}

// Example requests for common anyacursor features
export const exampleRequests = {
  cursorGeneration: createSpecKitRequest(
    "Build a conversational AI interface for cursor generation with tool calling",
    {
      userContext: "This is for the anyacursor platform where users can generate custom cursors",
      techStack: "Vercel AI SDK + Convex + OpenRouter",
      estimatedEffort: "3-4 days"
    }
  ),

  cursorManagement: createSpecKitRequest(
    "Create a cursor collection management system with search and filtering",
    {
      userContext: "Users need to organize and manage their generated cursor collections",
      techStack: "Next.js + Convex + Tailwind CSS",
      estimatedEffort: "2-3 days"
    }
  ),

  cursorSharing: createSpecKitRequest(
    "Build a cursor sharing and collaboration system",
    {
      userContext: "Users want to share their cursor designs with others and collaborate",
      techStack: "Convex + Next.js + Real-time updates",
      estimatedEffort: "4-5 days"
    }
  ),

  cursorExport: createSpecKitRequest(
    "Implement cursor export functionality with multiple formats",
    {
      userContext: "Users need to download their cursors in various formats (cur, ani, png)",
      techStack: "Convex Storage + File processing",
      estimatedEffort: "2-3 days"
    }
  ),
};
