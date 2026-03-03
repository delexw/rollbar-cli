import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { del, get, patch, post, postForm, put } from '../src/client.ts';

describe('client', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    mockFetch.mockClear();
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function mockResponse(body: unknown, status = 200) {
    mockFetch.mockResolvedValueOnce({
      ok: status >= 200 && status < 300,
      status,
      text: () => Promise.resolve(JSON.stringify(body)),
    });
  }

  describe('get', () => {
    it('sends GET request with auth header', async () => {
      mockResponse({ err: 0, result: { id: 1 } });

      const result = await get('my-token', '/api/1/items/');

      expect(mockFetch).toHaveBeenCalledOnce();
      const [url, opts] = mockFetch.mock.calls[0]!;
      expect(url).toBe('https://api.rollbar.com/api/1/items/');
      expect(opts.method).toBe('GET');
      expect(opts.headers['X-Rollbar-Access-Token']).toBe('my-token');
      expect(result).toEqual({ id: 1 });
    });

    it('appends query parameters', async () => {
      mockResponse({ err: 0, result: [] });

      await get('tok', '/api/1/items/', { status: 'active', page: 2 });

      const [url] = mockFetch.mock.calls[0]!;
      expect(url).toContain('status=active');
      expect(url).toContain('page=2');
    });

    it('skips undefined query parameters', async () => {
      mockResponse({ err: 0, result: [] });

      await get('tok', '/api/1/items/', { status: 'active', level: undefined });

      const [url] = mockFetch.mock.calls[0]!;
      expect(url).toContain('status=active');
      expect(url).not.toContain('level');
    });
  });

  describe('post', () => {
    it('sends POST request with JSON body', async () => {
      mockResponse({ err: 0, result: { id: 42 } });

      const result = await post('tok', '/api/1/item/', { title: 'Bug' });

      const [, opts] = mockFetch.mock.calls[0]!;
      expect(opts.method).toBe('POST');
      expect(opts.headers['Content-Type']).toBe('application/json');
      expect(JSON.parse(opts.body)).toEqual({ title: 'Bug' });
      expect(result).toEqual({ id: 42 });
    });
  });

  describe('patch', () => {
    it('sends PATCH request', async () => {
      mockResponse({ err: 0, result: { updated: true } });

      await patch('tok', '/api/1/item/1', { status: 'resolved' });

      const [, opts] = mockFetch.mock.calls[0]!;
      expect(opts.method).toBe('PATCH');
    });
  });

  describe('put', () => {
    it('sends PUT request', async () => {
      mockResponse({ err: 0, result: {} });

      await put('tok', '/api/1/team/1/user/2');

      const [, opts] = mockFetch.mock.calls[0]!;
      expect(opts.method).toBe('PUT');
    });
  });

  describe('del', () => {
    it('sends DELETE request', async () => {
      mockResponse({ err: 0, result: {} });

      await del('tok', '/api/1/instance/123');

      const [, opts] = mockFetch.mock.calls[0]!;
      expect(opts.method).toBe('DELETE');
    });

    it('sends DELETE with body', async () => {
      mockResponse({ err: 0, result: {} });

      await del('tok', '/api/1/project/1/access_tokens', { access_token: 'xyz' });

      const [, opts] = mockFetch.mock.calls[0]!;
      expect(opts.method).toBe('DELETE');
      expect(JSON.parse(opts.body)).toEqual({ access_token: 'xyz' });
    });
  });

  describe('postForm', () => {
    it('sends POST with FormData', async () => {
      mockResponse({ err: 0, result: { ok: true } });

      const form = new FormData();
      form.append('file', 'content');

      await postForm('tok', '/api/1/sourcemap', form);

      const [, opts] = mockFetch.mock.calls[0]!;
      expect(opts.method).toBe('POST');
      expect(opts.body).toBeInstanceOf(FormData);
      expect(opts.headers['Content-Type']).toBeUndefined();
    });
  });

  describe('error handling', () => {
    it('throws on API error response', async () => {
      mockResponse({ err: 1, message: 'access denied' });

      await expect(get('tok', '/api/1/items/')).rejects.toThrow('Rollbar API error: access denied');
    });

    it('throws on API error with no message', async () => {
      mockResponse({ err: 1 });

      await expect(get('tok', '/api/1/items/')).rejects.toThrow('Unknown error');
    });

    it('throws on non-JSON error response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Internal Server Error'),
      });

      await expect(get('tok', '/api/1/items/')).rejects.toThrow('HTTP 500: Internal Server Error');
    });

    it('returns text as-is for non-JSON success response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve('OK'),
      });

      const result = await get('tok', '/api/1/something');
      expect(result).toBe('OK');
    });
  });
});
