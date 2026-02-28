import { expect } from 'vitest';

// Ensure global expect is available for jest-dom before importing it
(globalThis as any).expect = expect;
import '@testing-library/jest-dom';
