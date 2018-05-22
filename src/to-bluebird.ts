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
 * @param {PromiseLike<T>} promise
 * @param {AbortSignal} signal
 * @returns {Bluebird<T>}
 */
export function toBluebird<T>(promise: PromiseLike<T>, signal: AbortSignal): Bluebird<T> {
    const onAbort = () => {
        bluebirdPromise.cancel();
    };
    const bluebirdPromise = new Bluebird<T>((resolve, reject) => {
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
    signal.addEventListener('abort', onAbort, {once: true});
    return bluebirdPromise;
}
