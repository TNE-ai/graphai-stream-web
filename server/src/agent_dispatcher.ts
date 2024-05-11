import express from "express";
import { defaultTestAgents } from "graphai/lib/utils/test_agents";

import { streamAgentFilterGenerator } from "graphai/lib/experimental_agent_filters/stream";
import { slashGPTAgent } from "graphai/lib/experimental_agents/llm_agents/slashgpt_agent";
import { agentFilterRunnerBuilder } from "graphai/lib/utils/test_utils";

import { AgentFunctionContext, AgentFunctionDictonary } from "graphai/lib/type";

export const agentDispatcher = async (req: express.Request, res: express.Response) => {
  const { params } = req;
  const { agentId } = params; // from url
  const { nodeId, retry, params: agentParams, inputs } = req.body; // post body
  const agents = {...defaultTestAgents, ...{ slashGPTAgent } as AgentFunctionDictonary}; 
  const agent = agents[agentId];
  const isStreaming  = agentParams?.isStreaming || false;
  console.log(req.body, isStreaming);
  if (agent === undefined) {
    return res.status(404).send({ message: "Agent not found" });
  }
  
  const context = {
    params: agentParams || {},
    inputs,
    debugInfo: {
      nodeId,
      retry,
      verbose: false,
    },
    filterParams: {},
    agents: agents,
  };
  if (!isStreaming) {
    const result = await agent(context);
    return res.json(result);
  }

  res.setHeader("Content-Type", "text/event-stream;charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("X-Accel-Buffering", "no");

  const callback = (context: AgentFunctionContext, token: string) => {
    if (token) {
      res.write(token)
    }
  };

  const agentFilters = [
    {
      name: "streamAgentFilter",
      agent: streamAgentFilterGenerator<string>(callback),
    },
  ];

  const agentFilterRunner = agentFilterRunnerBuilder(agentFilters);
  const result = await agentFilterRunner(context, agent);

  // end of stream
  const json_data = JSON.stringify(result);
  res.write("___END___");
  res.write(json_data);
  return res.end();
  
};
