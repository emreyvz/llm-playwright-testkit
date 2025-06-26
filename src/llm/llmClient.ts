import axios, { AxiosInstance, AxiosError } from 'axios';
import { config } from '@base/configManager';
import logger from '@utils/logger'; // Import the logger
import { ErrorHandler, ErrorType, CustomError } from '@base/errorHandler'; // Import ErrorHandler

interface LLMResponse {
  success: boolean;
  data?: any;
  error?: string;
}

interface ChatCompletionChoice {
  index: number;
  message: {
    role: string;
    content: string | null;
  };
  finish_reason: string;
}

interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: ChatCompletionChoice[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  context?: number[]; // For conversational context
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}


export class LLMClient {
  private httpClient: AxiosInstance;
  private provider: string;
  private apiKey?: string;
  private endpoint: string;
  private modelName?: string;

  constructor() {
    this.provider = config.LLM_PROVIDER || 'local';
    this.apiKey = config.LLM_API_KEY;
    this.endpoint = config.LLM_ENDPOINT || '';

    if (!this.endpoint) {
      ErrorHandler.newError({
        message: 'LLM_ENDPOINT is not defined in the configuration. LLMClient cannot operate.',
        type: ErrorType.CONFIG_ERROR,
        context: { provider: this.provider }
      }, true); // Log and throw
    }

    this.httpClient = axios.create({
      baseURL: this.provider !== 'local' ? this.endpoint : undefined, // For OpenAI, baseURL is fine. For local, endpoint is the full URL.
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (this.provider === 'openai' && this.apiKey) {
      this.httpClient.defaults.headers.common['Authorization'] = `Bearer ${this.apiKey}`;
      this.modelName = config.OPENAI_MODEL_NAME || 'gpt-3.5-turbo';
    } else if (this.provider === 'local') {
      this.modelName = config.LOCAL_LLM_MODEL_NAME || 'llama2'; // Default local model
    }
    // Add other providers like 'azure' here if needed
  }

  private handleError(error: any, operationContext: string): LLMResponse {
    const handledError = ErrorHandler.handle(error, ErrorType.LLM_ERROR);
    // No need to log again here as ErrorHandler.handle already logs.
    // logger.error(`LLMClient Error during ${operationContext}: ${handledError.message}`, {
    //   originalError: error,
    //   context: operationContext,
    //   provider: this.provider,
    //   model: this.modelName,
    // });
    return { success: false, error: handledError.message };
  }

  async questionAnswer(prompt: string, systemPrompt?: string): Promise<LLMResponse> {
    logger.info(`Sending prompt to LLM (${this.provider}, model: ${this.modelName}) for question/answer.`, {
      prompt: `${prompt.substring(0, 100)}...`,
      provider: this.provider,
      model: this.modelName
    });
    try {
      if (this.provider === 'openai') {
        const messages = [];
        if (systemPrompt) {
          messages.push({ role: 'system', content: systemPrompt });
        }
        messages.push({ role: 'user', content: prompt });

        const response = await this.httpClient.post<OpenAIResponse>(
          this.provider === 'local' ? this.endpoint : '', // For OpenAI, path is empty as baseURL is the full API endpoint path
          {
            model: this.modelName,
            messages: messages,
          }
        );
        if (response.data.choices && response.data.choices.length > 0) {
          logger.debug('OpenAI Q/A response successful.', { data: response.data.choices[0].message?.content });
          return { success: true, data: response.data.choices[0].message?.content?.trim() };
        } else {
          logger.warn('No response choices from OpenAI for Q/A.', { responseData: response.data });
          return { success: false, error: 'No response choices from OpenAI.' };
        }
      } else if (this.provider === 'local') { // Assuming Ollama-like API for local
        const payload: any = {
          model: this.modelName,
          prompt: prompt,
          stream: false,
        };
        if (systemPrompt) {
          payload.system = systemPrompt;
        }
        const response = await this.httpClient.post<OllamaResponse>(this.endpoint, payload);
        logger.debug('Local LLM Q/A response successful.', { data: response.data.response });
        return { success: true, data: response.data.response?.trim() };
      } else {
        logger.warn(`LLM provider "${this.provider}" not supported for questionAnswer.`);
        return { success: false, error: ErrorHandler.newError({
            message: `Provider "${this.provider}" not supported yet for questionAnswer.`,
            type: ErrorType.LLM_ERROR,
            context: { provider: this.provider }
          }).message
        };
      }
    } catch (error) {
      return this.handleError(error, `questionAnswer with ${this.provider}`);
    }
  }

  /**
   * Solves a CAPTCHA by sending its image (as base64) or image URL to an LLM.
   * This method assumes a multimodal LLM that can process images.
   * @param imageBase64 Base64 encoded string of the CAPTCHA image.
   * @param instructions Optional instructions for the LLM (e.g., "What text is in this image?").
   * @returns LLMResponse containing the solved CAPTCHA text or an error.
   */
  async solveCaptcha(imageBase64: string, instructions?: string): Promise<LLMResponse> {
    const promptText = instructions || "Extract the text from this image. Respond only with the characters you see.";
    logger.info(`Sending CAPTCHA image to LLM (${this.provider}, model: ${this.modelName}) for solving.`, {
      provider: this.provider,
      model: this.modelName,
      prompt: promptText,
      // imageBase64: `${imageBase64.substring(0, 30)}...` // Log a snippet for brevity
    });

    try {
      if (this.provider === 'openai') {
        if (!this.modelName?.includes('vision')) {
            logger.warn(`OpenAI model ${this.modelName} may not support vision. CAPTCHA solving might fail or produce incorrect results.`, {
              model: this.modelName
            });
        }
        const response = await this.httpClient.post<OpenAIResponse>(
            this.provider === 'local' ? this.endpoint : '', // For OpenAI, path is empty if baseURL is full endpoint path
            {
            model: this.modelName, // e.g., "gpt-4-vision-preview"
            messages: [
              {
                role: 'user',
                content: [
                  { type: 'text', text: promptText },
                  {
                    type: 'image_url',
                    image_url: {
                      url: `data:image/png;base64,${imageBase64}`, // Assuming PNG, adjust if necessary
                      detail: "low" // or "high" or "auto"
                    },
                  },
                ],
              },
            ],
            max_tokens: 100,
          });
        if (response.data.choices && response.data.choices.length > 0) {
          logger.debug('OpenAI CAPTCHA response successful.', { data: response.data.choices[0].message?.content });
          return { success: true, data: response.data.choices[0].message?.content?.trim() };
        } else {
          logger.warn('No response choices from OpenAI for CAPTCHA.', { responseData: response.data });
          return { success: false, error: 'No response choices from OpenAI for CAPTCHA.' };
        }
      } else if (this.provider === 'local') {
        if (!this.modelName || !['llava', 'bakllava'].some(m => this.modelName!.toLowerCase().includes(m))) {
             logger.warn(`Local model ${this.modelName} may not support vision. CAPTCHA solving might fail. Ensure you are using a multimodal model like LLaVA.`, {
               model: this.modelName
             });
        }
        const payload = {
          model: this.modelName,
          prompt: promptText,
          images: [imageBase64],
          stream: false,
        };
        const response = await this.httpClient.post<OllamaResponse>(this.endpoint, payload);
        logger.debug('Local LLM CAPTCHA response successful.', { data: response.data.response });
        return { success: true, data: response.data.response?.trim() };
      } else {
        logger.warn(`LLM provider "${this.provider}" not supported for solveCaptcha.`);
        return { success: false, error: ErrorHandler.newError({
            message: `CAPTCHA solving for provider "${this.provider}" not supported yet.`,
            type: ErrorType.LLM_ERROR,
            context: { provider: this.provider }
          }).message
        };
      }
    } catch (error) {
      return this.handleError(error, `solveCaptcha with ${this.provider} and model ${this.modelName}`);
    }
  }
}

// Example Usage (for testing purposes, normally instantiated where needed):
// (async () => {
//   const client = new LLMClient();
//   const qaResponse = await client.questionAnswer("What is the capital of France?");
//   console.log("Q/A Response:", qaResponse);

//   // To test captcha, you'd need a base64 image string
//   // const fs = require('fs');
//   // const imageAsBase64 = fs.readFileSync('path/to/your/captcha.png', 'base64');
//   // const captchaResponse = await client.solveCaptcha(imageAsBase64, "What are the characters in this image?");
//   // console.log("CAPTCHA Response:", captchaResponse);
// })();
