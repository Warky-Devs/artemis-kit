interface OpenAICompletionResponse {
  choices: {
    text: string;
    index: number;
    logprobs: any;
    finish_reason: string;
  }[];
  created: number;
  id: string;
  model: string;
  object: string;
}

interface CompletionOptions {
  prompt: string;
  options?: {
    url?: string;
    apiKey?: string;
    maxTokens?: number;
    temperature?: number;
    topP?: number;
    n?: number;
    stream?: boolean;
    stop?: string | string[];
  };
}

export async function getTextCompletion({
  prompt,
  options: {
    url = "https://api.openai.com/v1/completions",
    apiKey = "x-demo",
    maxTokens = 50,
    temperature = 0.7,
    topP = 1,
    n = 1,
    stream = false,
    stop = null,
  },
}: CompletionOptions): Promise<string> {
  try {
    if (!prompt) {
      throw new Error("Blank prompt");
    }

    if (!url) {
      throw new Error("OpenAI API URL is not set");
    }

    if (!apiKey) {
      throw new Error("OpenAI API key is not set");
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "text-davinci-003",
        prompt,
        max_tokens: maxTokens,
        temperature,
        top_p: topP,
        n,
        stream,
        stop,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data: OpenAICompletionResponse = await response.json();
    return data.choices[0].text.trim();
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}
