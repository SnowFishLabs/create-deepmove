import { afterEach, beforeEach, afterAll, describe, expect, it } from 'vitest';
import { {{module}} } from './wrappers/dependencies/{{package}}/{{module}}';
import { setup, get_wasm, beforeTest, afterTest, afterTestAll } from '@deepmove/sui';

let package_path = process.cwd();

setup(get_wasm(), package_path);
beforeEach(beforeTest)
afterEach(afterTest)
afterAll(afterTestAll);

describe('{{module}}_tests', () => {
    it('test get function', () => {
        let [r] = {{module}}.get();

        expect(r).toEqual(10)
    });
});