const BASE_URL = 'https://api.rollbar.com';

export interface ApiResponse<T = unknown> {
  err: number;
  message?: string;
  result: T;
}

export interface Auth {
  token: string;
  projectId?: number;
}

export interface RequestOptions {
  method?: string;
  auth: Auth;
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
  const { method = 'GET', auth, path, body, query, formData } = opts;
  const url = buildUrl(path, { ...query, project_id: auth.projectId });

  const headers: Record<string, string> = {
    'X-Rollbar-Access-Token': auth.token,
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
  auth: Auth,
  path: string,
  query?: Record<string, string | number | undefined>,
): Promise<T> {
  return request<T>({ auth, path, query });
}

export function post<T = unknown>(auth: Auth, path: string, body?: unknown): Promise<T> {
  return request<T>({ method: 'POST', auth, path, body });
}

export function patch<T = unknown>(auth: Auth, path: string, body?: unknown): Promise<T> {
  return request<T>({ method: 'PATCH', auth, path, body });
}

export function put<T = unknown>(auth: Auth, path: string, body?: unknown): Promise<T> {
  return request<T>({ method: 'PUT', auth, path, body });
}

export function del<T = unknown>(auth: Auth, path: string, body?: unknown): Promise<T> {
  return request<T>({ method: 'DELETE', auth, path, body });
}

export function postForm<T = unknown>(auth: Auth, path: string, formData: FormData): Promise<T> {
  return request<T>({ method: 'POST', auth, path, formData });
}
