import Bluebird from 'bluebird';
import {fromBluebird} from '../src';
import {inspectPromise, noop, PromiseState} from './test-utils';

describe('fromBluebird', () => {
    it('returns a pending promise and non-aborted controller when given a pending promise', async () => {
        const input = new Bluebird(noop);

        const {promise, controller} = fromBluebird(input);

        expect(controller.signal.aborted).toBe(false);
        expect(await inspectPromise(promise)).toBe(PromiseState.PENDING);
    });

    it('returns a fulfilled promise and non-aborted controller when given a fulfilled promise', async () => {
        const value = 'yay';
        const input = Bluebird.resolve(value);

        const {promise, controller} = fromBluebird(input);

        expect(controller.signal.aborted).toBe(false);
        await expect(promise).resolves.toBe(value);
    });

    it('returns a rejected promise and non-aborted controller when given a rejected promise', async () => {
        const reason = 'boo';
        const input = Bluebird.reject(reason);

        const {promise, controller} = fromBluebird(input);

        expect(controller.signal.aborted).toBe(false);
        await expect(promise).rejects.toBe(reason);
    });
});
