import Bluebird from 'bluebird';
import {fromBluebird} from '../src';
import {noop} from './test-utils';

describe('fromBluebird', () => {
    it('returns a pending promise and non-aborted signal when given a pending promise', () => {
        const input = new Bluebird(noop);

        const {promise, controller} = fromBluebird(input);

        expect(controller.signal.aborted).toBe(false);
    })
});
