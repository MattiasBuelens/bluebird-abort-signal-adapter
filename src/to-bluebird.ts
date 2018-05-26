import Bluebird from 'bluebird';
import {isAbortError} from './utils';

/**
 * Converts a native promise and abort signal into a cancellable Bluebird promise.
 *
 * - If the native promise resolves, the Bluebird promise resolves.
 * - If the native promise rejects with an AbortError, the Bluebird promise cancels.
 * - If the native promise rejects with another reason, the Bluebird promise rejects.
 * - If the abort signal is aborted, the Bluebird promise cancels.
 *
 * @param promise
 * @param controller
 * @param [bluebirdConstructor]
 * @returns {Bluebird<T>}
 */
export function toBluebird<T>(promise: PromiseLike<T>,
                              controller: AbortController,
                              bluebirdConstructor: typeof Bluebird = Bluebird): Bluebird<T> {
    const onAbort = () => {
        controller.signal.removeEventListener('abort', onAbort);
        bluebirdPromise.cancel();
    };
    const bluebirdPromise = new bluebirdConstructor<T>((resolve, reject, onCancel) => {
        if (onCancel) {
            onCancel(() => {
                controller.abort();
            })
        }
        promise.then(
            value => {
                controller.signal.removeEventListener('abort', onAbort);
                resolve(value);
            },
            reason => {
                controller.signal.removeEventListener('abort', onAbort);
                if (isAbortError(reason)) {
                    bluebirdPromise.cancel();
                } else {
                    reject(reason);
                }
            });
    });
    if (controller.signal.aborted) {
        onAbort();
    } else {
        controller.signal.addEventListener('abort', onAbort);
    }
    return bluebirdPromise;
}
