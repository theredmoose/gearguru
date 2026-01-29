import '@testing-library/jest-dom/vitest';
import { vi, afterEach } from 'vitest';

// Mock window.confirm for delete confirmations
vi.spyOn(window, 'confirm').mockImplementation(() => true);

// Reset all mocks between tests
afterEach(() => {
  vi.clearAllMocks();
});
