const graph_data1 = {
  version: 0.3,
  loop: {
    while: ":people",
  },
  nodes: {
    people: {
      value: ["Steve Jobs", "Elon Musk", "Nikola Tesla"],
      update: ":retriever.array",
    },
    result: {
      value: [],
      update: ":reducer2",
      isResult: true,
    },
    retriever: {
      agent: "shiftAgent",
      inputs: [":people"],
    },
    query: {
      agent: "slashGPTAgent",
      params: {
        manifest: {
          prompt: "Describe about the person in less than 100 words",
        },
      },
      inputs: [":retriever.item"],
    },
    reducer1: {
      agent: "popAgent",
      inputs: [":query"],
    },
    reducer2: {
      agent: "pushAgent",
      inputs: [":result", ":reducer1.item"],
    },
  },
};

const graph_data2 = {
  version: 0.3,
  nodes: {
    query: {
      inputs: [{}],
      agent: "streamMockAgent",
      params: {
        isStreaming: true,
        message: "this is from the server",
      },
      isResult: true,
    },
    answer: {
      agent: "sleeperAgent",
      inputs: ["query.choices.$0.message"],
    },
  },
};

const graph_data3 = {
  version: 0.3,
  nodes: {
    node1: {
      value: "Please tell me about photosynthesis in 50 words.",
    },
    node2: {
      agent: "openAIAgent",
      inputs: [":node1"],
      isResult: true,
    },
  },
};

export const graphDataSet = [graph_data1, graph_data2, graph_data3];
