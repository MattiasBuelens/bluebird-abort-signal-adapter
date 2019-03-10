import Bluebird = require("bluebird");

export function noop() {
    return;
}

export function delay<T>(value: T, timeout: number): Promise<T> {
    return new Promise<T>(resolve => setTimeout(() => resolve(value), timeout));
}

export enum PromiseState {
    PENDING = 'pending',
    FULFILLED = 'fulfilled',
    REJECTED = 'rejected'
}

export function inspectPromise(promise: PromiseLike<any>): Promise<PromiseState> {
    const sentinel = {};
    // Assume that the promise won't settle before the next turn of the event loop
    return Promise.race([promise, delay(sentinel, 0)])
        .then(
            value => (value === sentinel) ? PromiseState.PENDING : PromiseState.FULFILLED,
            () => PromiseState.REJECTED
        );
}

function nextEvent(target: EventTarget, type: string): Promise<Event> {
    return new Promise<Event>(resolve => {
        target.addEventListener(type, function listener(event) {
            target.removeEventListener(type, listener);
            resolve(event);
        });
    })
}

export function becomesCancelled(bluebirdPromise: Bluebird<any>): Bluebird<boolean> {
    return bluebirdPromise.reflect().then(inspection => inspection.isCancelled());
}

export function becomesAborted(signal: AbortSignal): Promise<boolean> {
    if (signal.aborted) {
        return Promise.resolve(true);
    } else {
        return nextEvent(signal, 'abort').then(() => true);
    }
}
