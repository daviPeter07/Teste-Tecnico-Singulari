type ApiErrorPayload = {
  statusCode?: number;
  message?: string | string[];
  error?: string;
  errorCode?: string;
  details?: unknown;
  path?: string;
};

const getMessages = (message: ApiErrorPayload["message"], fallback: string) => {
  if (Array.isArray(message)) {
    const messages = message.filter(Boolean);
    return messages.length > 0 ? messages : [fallback];
  }

  if (typeof message === "string" && message.trim().length > 0) {
    return [message];
  }

  return [fallback];
};

export class ApiError extends Error {
  readonly statusCode: number;
  readonly errorCode?: string;
  readonly details?: unknown;
  readonly path?: string;
  readonly messages: string[];

  constructor({
    statusCode,
    errorCode,
    details,
    path,
    messages,
  }: {
    statusCode: number;
    errorCode?: string;
    details?: unknown;
    path?: string;
    messages: string[];
  }) {
    super(messages[0] ?? "Unexpected API error");

    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.path = path;
    this.messages = messages;
  }

  static async fromResponse(response: Response) {
    const fallback = response.statusText || "Unexpected API error";
    let payload: ApiErrorPayload | null = null;

    try {
      payload = (await response.json()) as ApiErrorPayload;
    } catch {
      payload = null;
    }

    return new ApiError({
      statusCode: payload?.statusCode ?? response.status,
      errorCode: payload?.errorCode ?? payload?.error,
      details: payload?.details,
      path: payload?.path,
      messages: getMessages(payload?.message, fallback),
    });
  }
}
