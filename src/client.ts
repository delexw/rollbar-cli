const BASE_URL = 'https://api.rollbar.com';

export interface ApiResponse<T = unknown> {
  err: number;
  message?: string;
  result: T;
}

export interface RequestOptions {
  method?: string;
  token: string;
  path: string;
  body?: unknown;
  query?: Record<string, string | number | undefined>;
  formData?: FormData;
}

function buildUrl(path: string, query?: Record<string, string | number | undefined>): string {
  const url = new URL(path, BASE_URL);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

async function request<T = unknown>(opts: RequestOptions): Promise<T> {
  const { method = 'GET', token, path, body, query, formData } = opts;
  const url = buildUrl(path, query);

  const headers: Record<string, string> = {
    'X-Rollbar-Access-Token': token,
  };

  let fetchBody: BodyInit | undefined;
  if (formData) {
    fetchBody = formData;
  } else if (body) {
    headers['Content-Type'] = 'application/json';
    fetchBody = JSON.stringify(body);
  }

  const res = await fetch(url, { method, headers, body: fetchBody });
  const text = await res.text();

  let data: ApiResponse<T>;
  try {
    data = JSON.parse(text) as ApiResponse<T>;
  } catch {
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${text}`);
    }
    return text as unknown as T;
  }

  if (data.err !== 0) {
    throw new Error(`Rollbar API error: ${data.message ?? 'Unknown error'}`);
  }

  return data.result;
}

export function get<T = unknown>(
  token: string,
  path: string,
  query?: Record<string, string | number | undefined>,
): Promise<T> {
  return request<T>({ token, path, query });
}

export function post<T = unknown>(token: string, path: string, body?: unknown): Promise<T> {
  return request<T>({ method: 'POST', token, path, body });
}

export function patch<T = unknown>(token: string, path: string, body?: unknown): Promise<T> {
  return request<T>({ method: 'PATCH', token, path, body });
}

export function put<T = unknown>(token: string, path: string, body?: unknown): Promise<T> {
  return request<T>({ method: 'PUT', token, path, body });
}

export function del<T = unknown>(token: string, path: string, body?: unknown): Promise<T> {
  return request<T>({ method: 'DELETE', token, path, body });
}

export function postForm<T = unknown>(token: string, path: string, formData: FormData): Promise<T> {
  return request<T>({ method: 'POST', token, path, formData });
}
