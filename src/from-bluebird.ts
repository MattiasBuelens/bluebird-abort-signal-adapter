import Bluebird from 'bluebird';
import {createAbortError} from "./utils";

interface PromiseAndAbortController<T> {
    promise: Promise<T>;
    controller: AbortController;
}

/**
 * Converts a cancellable Bluebird promise into a native promise and abort controller.
 *
 * - If the Bluebird promise resolves/rejects, the native promise resolves/rejects.
 * - If the Bluebird promise is cancelled, the native promise rejects with an AbortError.
 * - If the abort controller signals abort, the Bluebird promise cancels.
 *
 * @param {Bluebird<T>} bluebirdPromise
 * @returns {PromiseAndAbortController<T>}
 */
export function fromBluebird<T>(bluebirdPromise: Bluebird<T>): PromiseAndAbortController<T> {
    const controller = new AbortController();
    const onAbort = () => {
        bluebirdPromise.cancel();
    };
    const promise = new Promise<T>((resolve, reject) => {
        bluebirdPromise.reflect().then(inspection => {
            controller.signal.removeEventListener('abort', onAbort);
            if (inspection.isFulfilled()) {
                resolve(inspection.value());
            } else if (inspection.isRejected()) {
                reject(inspection.reason());
            } else if (inspection.isCancelled()) {
                // TODO Signal abort on controller?
                reject(createAbortError());
            }
        });
    });
    controller.signal.addEventListener('abort', onAbort, {once: true});
    return {promise, controller};
}
