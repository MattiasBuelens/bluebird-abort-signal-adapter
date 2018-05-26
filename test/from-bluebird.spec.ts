import Bluebird from 'bluebird';
import {fromBluebird} from '../src';
import {inspectPromise, noop, PromiseState} from './test-utils';

describe('fromBluebird', () => {
    it('returns a pending promise and non-aborted controller when given a pending promise', async () => {
        const input = new Bluebird(noop);

        const {promise, controller} = fromBluebird(input);

        expect(await inspectPromise(promise)).toBe(PromiseState.PENDING);
        expect(controller.signal.aborted).toBe(false);
    });

    it('returns a fulfilled promise and non-aborted controller when given a fulfilled promise', async () => {
        const value = 'yay';
        const input = Bluebird.resolve(value);

        const {promise, controller} = fromBluebird(input);

        await expect(promise).resolves.toBe(value);
        expect(controller.signal.aborted).toBe(false);
    });

    it('returns a rejected promise and non-aborted controller when given a rejected promise', async () => {
        const reason = 'boo';
        const input = Bluebird.reject(reason);

        const {promise, controller} = fromBluebird(input);

        await expect(promise).rejects.toBe(reason);
        expect(controller.signal.aborted).toBe(false);
    });
});
