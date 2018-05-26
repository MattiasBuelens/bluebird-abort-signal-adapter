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
 * @param signal
 * @param [bluebirdConstructor]
 * @returns {Bluebird<T>}
 */
export function toBluebird<T>(promise: PromiseLike<T>,
                              signal: AbortSignal,
                              bluebirdConstructor: typeof Bluebird = Bluebird): Bluebird<T> {
    // TODO What if returned Bluebird promise is cancelled externally?
    const onAbort = () => {
        signal.removeEventListener('abort', onAbort);
        bluebirdPromise.cancel();
    };
    const bluebirdPromise = new bluebirdConstructor<T>((resolve, reject) => {
        promise.then(
            value => {
                signal.removeEventListener('abort', onAbort);
                resolve(value);
            },
            reason => {
                signal.removeEventListener('abort', onAbort);
                if (isAbortError(reason)) {
                    bluebirdPromise.cancel();
                } else {
                    reject(reason);
                }
            });
    });
    if (signal.aborted) {
        onAbort();
    } else {
        signal.addEventListener('abort', onAbort);
    }
    return bluebirdPromise;
}
