import ollama from "ollama";

export const askLocalLLM = async (llm: string, user_query: string) => {
  try {
    const response = await ollama.chat({
      model: llm,
      messages: [
        {
          role: "user",
          content: user_query,
        },
      ],
    });
    return {
      error_occurred: false,
      response: { type: "others", content: response.message.content },
      error: null,
    };
  } catch (error) {
    return {
      error_occurred: true,
      response: null,
      error: error,
    };
  }
};
