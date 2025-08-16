import "@testing-library/jest-dom";
import { server } from "./mocks/server";
/* global beforeAll, afterEach, afterAll */

// Start server before all tests
beforeAll(() =>
  server.listen({
    onUnhandledRequest: "warn",
  })
);

// Reset handlers after each test
afterEach(() => server.resetHandlers());

// Close server after all tests
afterAll(() => server.close());
