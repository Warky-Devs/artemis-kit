interface ClaudeCompletionResponse {
  id: string;
  type: string;
  role: string;
  content: Array<{
    type: string;
    text?: string;
  }>;
  model: string;
  stop_reason: string;
  stop_sequence: string | null;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

interface ClaudeCompletionOptions {
  prompt: string;
  options?: {
    url?: string;
    apiKey?: string;
    model?: string;
    maxTokens?: number;
    temperature?: number;
    topP?: number;
    stopSequences?: string[];
    system?: string;
  };
}

export async function getClaudeCompletion({
  prompt,
  options: {
    url = "https://api.anthropic.com/v1/messages",
    apiKey = "x-demo",
    model = "claude-3-sonnet-20240229",
    maxTokens = 1024,
    temperature = 0.7,
    topP = 1,
    stopSequences = [],
    system = "",
  } = {},
}: ClaudeCompletionOptions): Promise<string> {
  try {
    if (!prompt) {
      throw new Error("Blank prompt");
    }

    if (!url) {
      throw new Error("Claude API URL is not set");
    }

    if (!apiKey) {
      throw new Error("Claude API key is not set");
    }

    const requestBody: any = {
      model,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: maxTokens,
      temperature,
      top_p: topP,
    };

    if (stopSequences && stopSequences.length > 0) {
      requestBody.stop_sequences = stopSequences;
    }

    if (system) {
      requestBody.system = system;
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.statusText}`);
    }

    const data: ClaudeCompletionResponse = await response.json();
    
    // Extract text from the response
    let responseText = "";
    for (const content of data.content) {
      if (content.type === "text" && content.text) {
        responseText += content.text;
      }
    }
    
    return responseText.trim();
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}