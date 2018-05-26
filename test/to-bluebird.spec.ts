import bluebird from 'bluebird';
import {toBluebird} from '../src';
import {noop} from './test-utils';

describe('toBluebird', () => {
    let BluebirdPromise: typeof bluebird;

    beforeAll(() => {
        BluebirdPromise = bluebird.getNewLibraryCopy();
        BluebirdPromise.config({
            cancellation: true
        });
    });

    it('returns a pending Bluebird promise when given a pending promise and non-aborted signal', async () => {
        const input = new Promise(noop);
        const controller = new AbortController();

        const bluebirdPromise = toBluebird(input, controller.signal, BluebirdPromise);

        expect(bluebirdPromise.isPending()).toBe(true);
    });

    it('returns a fulfilled Bluebird promise when given a fulfilled promise and non-aborted signal', async () => {
        const value = 'yay';
        const input = Promise.resolve(value);
        const controller = new AbortController();

        const bluebirdPromise = toBluebird(input, controller.signal, BluebirdPromise);

        await expect(bluebirdPromise).resolves.toBe(value);
    });

    it('returns a rejected Bluebird promise when given a rejected promise and non-aborted signal', async () => {
        const reason = 'boo';
        const input = Promise.reject(reason);
        const controller = new AbortController();

        const bluebirdPromise = toBluebird(input, controller.signal, BluebirdPromise);

        await expect(bluebirdPromise).rejects.toBe(reason);
    });
});
