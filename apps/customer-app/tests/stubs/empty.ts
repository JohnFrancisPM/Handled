// Empty stub for the `server-only` marker package under Vitest. The real package
// only guards against importing server modules into a client bundle; in the test
// runner (node) it has no behavior, so an empty module is the correct alias.
export {};
