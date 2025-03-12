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

// Example Usage (for demonstration purposes)

/**
 * @async
 * @function processOrder
 * @description Simulates processing an order using the Tracer.
 * @param {Tracer} tracer - The Tracer instance.
 * @param {string} orderId - The ID of the order.
 */
async function processOrder(tracer, orderId) {
  const rootSpan = tracer.startSpan('processOrder');

  try {
    console.log(`Processing order: ${orderId}`);

    await validateOrder(tracer, orderId, rootSpan.spanId);
    await updateInventory(tracer, orderId, rootSpan.spanId);
    await processPayment(tracer, orderId, rootSpan.spanId);

    console.log(`Order ${orderId} processed successfully.`);
    tracer.endSpan(rootSpan, 'OK');
  } catch (err) {
    console.error(`Error processing order ${orderId}:`, err);
    tracer.endSpan(rootSpan, 'ERROR', { error: err.message });
    throw err;
  }
}

/**
 * @async
 * @function validateOrder
 * @description Simulates validating an order.
 * @param {Tracer} tracer - The Tracer instance.
 * @param {string} orderId - The ID of the order.
 * @param {string} parentSpanId - The ID of the parent span.
 */
async function validateOrder(tracer, orderId, parentSpanId) {
  const span = tracer.startSpan('validateOrder', parentSpanId);
  try {
    console.log(`Validating order: ${orderId}`);
    await new Promise((resolve) => setTimeout(resolve, 50));
    console.log(`Order ${orderId} validated.`);
    tracer.endSpan(span, 'OK');
  } catch (err) {
    tracer.endSpan(span, 'ERROR', { error: err.message });
    throw err;
  }
}

/**
 * @async
 * @function updateInventory
 * @description Simulates updating inventory for an order.
 * @param {Tracer} tracer - The Tracer instance.
 * @param {string} orderId - The ID of the order.
 * @param {string} parentSpanId - The ID of the parent span.
 */
async function updateInventory(tracer, orderId, parentSpanId) {
  const span = tracer.startSpan('updateInventory', parentSpanId);
  try {
    console.log(`Updating inventory for order: ${orderId}`);
    await new Promise((resolve) => setTimeout(resolve, 100));
    console.log(`Inventory updated for order ${orderId}.`);
    tracer.endSpan(span, 'OK');
  } catch (err) {
    tracer.endSpan(span, 'ERROR', { error: err.message });
    throw err;
  }
}

/**
 * @async
 * @function processPayment
 * @description Simulates processing payment for an order.
 * @param {Tracer} tracer - The Tracer instance.
 * @param {string} orderId - The ID of the order.
 * @param {string} parentSpanId - The ID of the parent span.
 */
async function processPayment(tracer, orderId, parentSpanId) {
  const span = tracer.startSpan('processPayment', parentSpanId);
  try {
    console.log(`Processing payment for order: ${orderId}`);
    await new Promise((resolve) => setTimeout(resolve, 150));
    console.log(`Payment processed for order ${orderId}.`);
    tracer.endSpan(span, 'OK');
  } catch (err) {
    tracer.endSpan(span, 'ERROR', { error: err.message });
    throw err;
  }
}

/**
 * @async
 * @function runExample
 * @description Runs an example of using the Tracer.
 */
async function runExample() {
  try {
    const myTracer = new Tracer('my-secure-service');
    await processOrder(myTracer, 'ORD-123');
    myTracer.exportTraces();
  } catch (error) {
    console.log('process order failed');
  }
}

// Run the example
runExample();

// Export the Tracer class if needed
module.exports = { Tracer };
