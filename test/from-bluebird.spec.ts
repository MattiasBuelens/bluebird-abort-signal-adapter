import Bluebird from 'bluebird';
import {fromBluebird} from '../src';
import {inspectPromise, noop, PromiseState} from './test-utils';

describe('fromBluebird', () => {
    it('returns a pending promise and non-aborted signal when given a pending promise', async () => {
        const input = new Bluebird(noop);

        const {promise, controller} = fromBluebird(input);

        expect(controller.signal.aborted).toBe(false);
        const state = await inspectPromise(promise);
        expect(state).toBe(PromiseState.PENDING);
    })
});
