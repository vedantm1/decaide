import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with DOM matchers
expect.extend(matchers);

// Run cleanup after each test case
afterEach(() => {
  cleanup();
});