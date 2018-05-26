import bluebird from 'bluebird';
import {fromBluebird} from '../src';
import {inspectPromise, noop, PromiseState} from './test-utils';

describe('fromBluebird', () => {
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

    it('returns a pending promise and non-aborted controller when given a pending promise', async () => {
        const input = new BluebirdPromise(noop);

        const {promise, controller} = fromBluebird(input);

        expect(await inspectPromise(promise)).toBe(PromiseState.PENDING);
        expect(controller.signal.aborted).toBe(false);
    });

    it('returns a fulfilled promise and non-aborted controller when given a fulfilled promise', async () => {
        const value = 'yay';
        const input = BluebirdPromise.resolve(value);

        const {promise, controller} = fromBluebird(input);

        await expect(promise).resolves.toBe(value);
        expect(controller.signal.aborted).toBe(false);
    });

    it('returns a rejected promise and non-aborted controller when given a rejected promise', async () => {
        const reason = 'boo';
        const input = BluebirdPromise.reject(reason);

        const {promise, controller} = fromBluebird(input);

        await expect(promise).rejects.toBe(reason);
        expect(controller.signal.aborted).toBe(false);
    });

    it('returns a rejected promise and aborted controller when given a cancelled promise', async () => {
        const input = new BluebirdPromise(noop);
        input.cancel();

        const {promise, controller} = fromBluebird(input);

        await expect(promise).rejects.toMatchObject(abortErrorLike);
        expect(controller.signal.aborted).toBe(true);
    });
});
