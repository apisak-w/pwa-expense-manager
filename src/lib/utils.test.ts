import { cn } from './utils';
import { describe, it, expect } from 'vitest';

describe('cn utility', () => {
  it('should merge class names correctly', () => {
    expect(cn('c1', 'c2')).toBe('c1 c2');
  });

  it('should handle conditional classes', () => {
    const condition1 = true;
    const condition2 = false;
    expect(cn('c1', condition1 && 'c2', condition2 && 'c3')).toBe('c1 c2');
  });

  it('should handle arrays', () => {
    expect(cn(['c1', 'c2'])).toBe('c1 c2');
  });

  it('should handle tailwind conflicts', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2');
  });
});
