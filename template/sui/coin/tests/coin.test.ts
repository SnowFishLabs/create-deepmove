import { describe, expect, beforeEach, afterEach, it, afterAll } from 'vitest';
import { setup, get_wasm, beforeTest, afterTest, afterTestAll } from '@deepmove/sui';
import { {{module}} } from './wrappers/dependencies/{{package}}/{{module}}';
import { test_scenario } from './wrappers/dependencies/Sui/test_scenario';
import { CoinMetadata } from './wrappers/dependencies/Sui/coin';

let package_path = process.cwd();

setup(get_wasm(), package_path);

beforeEach(beforeTest)
afterEach(afterTest)
afterAll(afterTestAll);

describe('{{module}}_test', () => {
    it('test init coin', (ctx) => {
        let caller = "0x0000000000000000000000000000000000000000000000000000000000000032";
        let [scenario] = test_scenario.begin(caller);

        let [tx_context] = test_scenario.ctx(scenario);
        {{module}}.init(new {{module}}.{{COIN_TYPE}}(true), tx_context);
        let [effects] = test_scenario.next_tx(scenario, caller);
        expect(effects.created.length).toEqual(2)

        let coin_metadata_type = CoinMetadata.$type() + `<${{{module}}.{{COIN_TYPE}}.$type()}>`
        let [r1_bcs] = test_scenario.take_shared([coin_metadata_type], scenario);

        let r = CoinMetadata.bcs.parse(r1_bcs);
        expect(r.decimals).toEqual(6);
        expect(r.name).toEqual("Decimals 6");
        expect(r.symbol).toEqual("DEC6");
        expect(r.description).toEqual("Coin with 6 decimals")
        test_scenario.end(scenario);
    });
})