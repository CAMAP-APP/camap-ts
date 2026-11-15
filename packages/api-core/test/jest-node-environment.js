const NodeEnvironment = require('jest-environment-node');

/**
 * Jest 27's node environment only exposes a fixed list of Node globals.
 * Libraries such as undici (used by @nestjs/axios / remote-content) rely on
 * Node 20 globals (ReadableStream, Blob, DOMException, structuredClone...)
 * that are missing from it. Copy every global of the host Node runtime that
 * the sandbox does not already define.
 */
class CamapNodeEnvironment extends NodeEnvironment {
  constructor(config, context) {
    super(config, context);
    for (const key of Object.getOwnPropertyNames(globalThis)) {
      if (key in this.global) continue;
      // Copy the resolved value: some Node globals are accessors that must be
      // invoked with the real global object as `this`.
      Object.defineProperty(this.global, key, {
        value: globalThis[key],
        writable: true,
        configurable: true,
        enumerable: false,
      });
    }
  }
}

module.exports = CamapNodeEnvironment;
