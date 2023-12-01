/**
 * @file Error thrown when cancelling a Promise.
 *       This is currently used by the RequestToServer service to cancel listener requests.
 */

export class CancelledPromiseError extends Error {
    constructor() {
        super('Promise was cancelled');
    }
}
