import bluebird from 'bluebird';
import {toBluebird} from '../src';
import {createAbortError} from "../src/utils";
import {becomesAborted, becomesCancelled, noop} from './test-utils';

describe('toBluebird', () => {
    let BluebirdPromise: typeof bluebird;
    const abortErrorLike = {
        name: 'AbortError',
        message: 'Aborted'
    };

    beforeAll(() => {
        BluebirdPromise = bluebird.getNewLibraryCopy();
        BluebirdPromise.config({
            cancellation: true
        });
    });

    it('returns a Bluebird promise using the given Bluebird constructor', async () => {
        const input = new Promise(noop);
        const controller = new AbortController();

        const bluebirdPromise = toBluebird(input, controller, BluebirdPromise);

        expect(bluebirdPromise).toBeInstanceOf(BluebirdPromise);
    });

    it('returns a pending Bluebird promise when given a pending promise and non-aborted signal', async () => {
        const input = new Promise(noop);
        const controller = new AbortController();

        const bluebirdPromise = toBluebird(input, controller, BluebirdPromise);

        expect(bluebirdPromise.isPending()).toBe(true);
        expect(controller.signal.aborted).toBe(false);
    });

    it('returns a fulfilled Bluebird promise when given a fulfilled promise and non-aborted signal', async () => {
        const value = 'yay';
        const input = Promise.resolve(value);
        const controller = new AbortController();

        const bluebirdPromise = toBluebird(input, controller, BluebirdPromise);

        await expect(bluebirdPromise).resolves.toBe(value);
        expect(controller.signal.aborted).toBe(false);
    });

    it('returns a rejected Bluebird promise when given a rejected promise and non-aborted signal', async () => {
        const reason = 'boo';
        const input = Promise.reject(reason);
        const controller = new AbortController();

        const bluebirdPromise = toBluebird(input, controller, BluebirdPromise);

        await expect(bluebirdPromise).rejects.toBe(reason);
        expect(controller.signal.aborted).toBe(false);
    });

    it('returns a cancelled Bluebird promise when given a pending promise and aborted signal', async () => {
        const input = new Promise(noop);
        const controller = new AbortController();
        controller.abort();

        const bluebirdPromise = toBluebird(input, controller, BluebirdPromise);

        expect(controller.signal.aborted).toBe(true);
        await expect(becomesCancelled(bluebirdPromise)).resolves.toBe(true);
    });

    it('aborts controller when returned Bluebird promise is cancelled', async () => {
        const input = new Promise(noop);
        const controller = new AbortController();

        const bluebirdPromise = toBluebird(input, controller, BluebirdPromise);
        bluebirdPromise.cancel();

        expect(bluebirdPromise.isCancelled()).toBe(true);
        await expect(becomesAborted(controller.signal)).resolves.toBe(true);
    });

    it('cancels Bluebird promise and aborts controller when given a promise rejected with AbortError and non-aborted signal', async () => {
        const input = Promise.reject(createAbortError());
        const controller = new AbortController();

        const bluebirdPromise = toBluebird(input, controller, BluebirdPromise);

        await expect(becomesCancelled(bluebirdPromise)).resolves.toBe(true);
        expect(controller.signal.aborted).toBe(true);
    });
});
