/**
 * @module Tracer
 * @description A simplified, secure tracing implementation using native Node.js libraries.
 */

const crypto = require('crypto');

/**
 * @class Tracer
 * @description A basic tracer for creating and managing spans.
 */
class Tracer {
  /**
   * @constructor
   * @param {string} serviceName - The name of the service being traced.
   */
  constructor(serviceName) {
    /** @private */
    this.serviceName = serviceName;
    /** @private */
    this.traces = {};
  }

  /**
   * @private
   * @function generateSecureId
   * @description Generates a cryptographically secure random ID.
   * @returns {string} - A hexadecimal string representing the ID.
   */
  generateSecureId() {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * @function startSpan
   * @description Starts a new span.
   * @param {string} name - The name of the span.
   * @param {string} [parentSpanId] - The ID of the parent span (if any).
   * @returns {object} - The newly created span object.
   */
  startSpan(name, parentSpanId = null) {
    const traceId = parentSpanId ? this.traces[parentSpanId][0].traceId : this.generateSecureId();
    const spanId = this.generateSecureId();
    const startTime = Date.now();

    const span = {
      traceId,
      spanId,
      parentSpanId,
      name,
      startTime,
      endTime: null,
      attributes: {},
      status: 'UNSET',
    };

    if (!this.traces[traceId]) {
      this.traces[traceId] = [];
    }
    this.traces[traceId].push(span);

    return span;
  }

  /**
   * @function endSpan
   * @description Ends a span and sets its status and attributes.
   * @param {object} span - The span object to end.
   * @param {string} [status='OK'] - The status of the span ('OK' or 'ERROR').
   * @param {object} [attributes={}] - Additional attributes to add to the span.
   */
  endSpan(span, status = 'OK', attributes = {}) {
    span.endTime = Date.now();
    span.status = status;
    span.attributes = { ...span.attributes, ...attributes };
  }

  /**
   * @function getTrace
   * @description Retrieves all spans for a given trace ID.
   * @param {string} traceId - The ID of the trace.
   * @returns {array} - An array of span objects.
   */
  getTrace(traceId) {
    return this.traces[traceId];
  }

  /**
   * @function exportTraces
   * @description Exports the collected traces (simulated in this example).
   */
  exportTraces() {
    console.log('Exporting traces...');
    console.log(JSON.stringify(this.traces, null, 2));
  }
}

module.exports = { Tracer };
