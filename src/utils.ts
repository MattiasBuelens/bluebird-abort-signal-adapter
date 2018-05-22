export function createAbortError(): Error {
    let abortError: Error;
    try {
        abortError = new DOMException('Aborted', 'AbortError');
    } catch (err) {
        // IE 11 does not support calling the DOMException constructor, use a
        // regular error object on it instead.
        abortError = new Error('Aborted');
        abortError.name = 'AbortError';
    }
    return abortError;
}

export function isAbortError(error: any): error is Error {
    return error instanceof Error && error.name === 'AbortError';
}
