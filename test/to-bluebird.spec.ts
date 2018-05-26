import bluebird from 'bluebird';
import {toBluebird} from '../src';
import {becomesCancelled, noop} from './test-utils';

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
    });

    it('returns a fulfilled Bluebird promise when given a fulfilled promise and non-aborted signal', async () => {
        const value = 'yay';
        const input = Promise.resolve(value);
        const controller = new AbortController();

        const bluebirdPromise = toBluebird(input, controller, BluebirdPromise);

        await expect(bluebirdPromise).resolves.toBe(value);
    });

    it('returns a rejected Bluebird promise when given a rejected promise and non-aborted signal', async () => {
        const reason = 'boo';
        const input = Promise.reject(reason);
        const controller = new AbortController();

        const bluebirdPromise = toBluebird(input, controller, BluebirdPromise);

        await expect(bluebirdPromise).rejects.toBe(reason);
    });

    it('returns a cancelled Bluebird promise when given a pending promise and aborted signal', async () => {
        const input = new Promise(noop);
        const controller = new AbortController();
        controller.abort();

        const bluebirdPromise = toBluebird(input, controller, BluebirdPromise);

        await expect(becomesCancelled(bluebirdPromise)).resolves.toBe(true);
    });
});
