import { describe, expect, it, vi } from 'vitest';
import { formatOutput, parseJsonArg, printOutput } from '../src/output.ts';

describe('output', () => {
  describe('formatOutput - json', () => {
    it('pretty-prints JSON', () => {
      const result = formatOutput({ foo: 'bar' }, 'json');
      expect(result).toBe('{\n  "foo": "bar"\n}');
    });

    it('formats arrays as JSON', () => {
      const result = formatOutput([1, 2, 3], 'json');
      expect(result).toBe('[\n  1,\n  2,\n  3\n]');
    });
  });

  describe('formatOutput - table', () => {
    it('formats array of objects as table', () => {
      const data = [
        { name: 'Alice', age: 30 },
        { name: 'Bob', age: 25 },
      ];
      const result = formatOutput(data, 'table');
      const lines = result.split('\n');

      expect(lines[0]).toContain('name');
      expect(lines[0]).toContain('age');
      expect(lines[1]).toMatch(/^-+/);
      expect(lines[2]).toContain('Alice');
      expect(lines[3]).toContain('Bob');
    });

    it('returns (empty) for empty array', () => {
      expect(formatOutput([], 'table')).toBe('(empty)');
    });

    it('formats single object as key-value pairs', () => {
      const result = formatOutput({ name: 'test', count: 5 }, 'table');
      expect(result).toContain('name');
      expect(result).toContain('"test"');
      expect(result).toContain('count');
      expect(result).toContain('5');
    });

    it('formats primitive as string', () => {
      expect(formatOutput(42, 'table')).toBe('42');
      expect(formatOutput('hello', 'table')).toBe('hello');
    });
  });

  describe('formatOutput - plain', () => {
    it('returns strings as-is', () => {
      expect(formatOutput('hello world', 'plain')).toBe('hello world');
    });

    it('JSON-stringifies non-strings', () => {
      expect(formatOutput({ a: 1 }, 'plain')).toBe('{"a":1}');
    });
  });

  describe('printOutput', () => {
    it('calls console.log with formatted output', () => {
      const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
      printOutput({ x: 1 }, 'json');
      expect(spy).toHaveBeenCalledWith('{\n  "x": 1\n}');
      spy.mockRestore();
    });
  });

  describe('parseJsonArg', () => {
    it('parses valid JSON', () => {
      expect(parseJsonArg('{"status":"resolved"}')).toEqual({ status: 'resolved' });
    });

    it('parses JSON arrays', () => {
      expect(parseJsonArg('[1,2,3]')).toEqual([1, 2, 3]);
    });

    it('throws on invalid JSON', () => {
      expect(() => parseJsonArg('not-json')).toThrow('Invalid JSON: not-json');
    });
  });
});
