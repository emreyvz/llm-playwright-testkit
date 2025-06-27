import axios, { AxiosInstance, AxiosError } from 'axios';
import { config } from '../base/configManager';
import logger from '../utils/logger';
import { ErrorHandler, ErrorType, CustomError } from '../base/errorHandler';

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
  context?: number[];
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
      }, true);
    }

    this.httpClient = axios.create({
      baseURL: this.provider !== 'local' ? this.endpoint : undefined,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (this.provider === 'openai' && this.apiKey) {
      this.httpClient.defaults.headers.common['Authorization'] = `Bearer ${this.apiKey}`;
      this.modelName = config.OPENAI_MODEL_NAME || 'gpt-3.5-turbo';
    } else if (this.provider === 'local') {
      this.modelName = config.LOCAL_LLM_MODEL_NAME || 'llama2';
    }
  }

  private handleError(error: any, operationContext: string): LLMResponse {
    const handledError = ErrorHandler.handle(error, ErrorType.LLM_ERROR);
    return { success: false, error: handledError.message };
  }

  async questionAnswer(prompt: string, systemPrompt?: string): Promise<LLMResponse> {
    logger.info(`Sending prompt to LLM (${this.provider}, model: ${this.modelName}) for question/answer.`);
    try {
      if (this.provider === 'openai') {
        let messages: any[] = [];
        if (systemPrompt) {
          messages.push({ role: 'system', content: systemPrompt });
        }
        messages.push({ role: 'user', content: prompt });

        const response = await this.httpClient.post<OpenAIResponse>('',
          {
            model: this.modelName,
            messages: messages,
          }
        );
        if (response.data.choices && response.data.choices.length > 0) {
          logger.debug('OpenAI Q/A response successful.');
          return { success: true, data: response.data.choices[0].message?.content?.trim() };
        } else {
          logger.warn('No response choices from OpenAI for Q/A.', { responseData: response.data });
          return { success: false, error: 'No response choices from OpenAI.' };
        }
      } else if (this.provider === 'local') {
        const payload: any = {
          model: this.modelName,
          prompt: prompt,
          stream: false,
        };
        if (systemPrompt) {
          payload.system = systemPrompt;
        }
        const response = await this.httpClient.post<OllamaResponse>(this.endpoint, payload);
        logger.debug('Local LLM Q/A response successful.');
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

  async solveCaptcha(imageBase64: string, instructions?: string): Promise<LLMResponse> {
    const promptText = instructions || "Extract the text from this image. Respond only with the characters you see.";
    logger.info(`Sending CAPTCHA image to LLM (${this.provider}, model: ${this.modelName}) for solving.`);

    try {
      if (this.provider === 'openai') {
        if (!this.modelName?.includes('vision')) {
            logger.warn(`OpenAI model ${this.modelName} may not support vision. CAPTCHA solving might fail or produce incorrect results.`, {
              model: this.modelName
            });
        }
        const response = await this.httpClient.post<OpenAIResponse>(this.endpoint,
            {
            model: this.modelName,
            messages: [
              {
                role: 'user',
                content: [
                  { type: 'text', text: promptText },
                  {
                    type: 'image_url',
                    image_url: {
                      url: `data:image/png;base64,${imageBase64}`,
                      detail: "low"
                    },
                  },
                ],
              },
            ],
            max_tokens: 100,
          });
        if (response.data.choices && response.data.choices.length > 0) {
          logger.debug('OpenAI CAPTCHA response successful.');
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
        logger.debug('Local LLM CAPTCHA response successful.');
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
