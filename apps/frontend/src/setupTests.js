// Extend Jest with Testing Library matchers
import '@testing-library/jest-dom';

const originalError = console.error;
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation((...args) => {
    const msg = typeof args[0] === 'string' ? args[0] : '';
    if (msg.includes('ReactDOMTestUtils.act is deprecated')) return;
    originalError(...args);
  });
});

afterAll(() => {
  console.error.mockRestore();
});
