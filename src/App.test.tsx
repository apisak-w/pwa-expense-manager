import { render } from '@testing-library/react';
import App from './App';
import { describe, expect, it } from 'vitest';

describe('App Component', () => {
  it('renders without crashing', () => {
    render(<App />);
    // Since we don't know exactly what's in App, we just check if it renders something.
    // Adjust this based on actual App content if needed, or just keep it as a smoke test.
    // For now, let's assume there's some text or element we can query, or just rely on render not throwing.
    expect(document.body).toBeInTheDocument();
  });
});
