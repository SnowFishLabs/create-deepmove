module {{package}}::{{module}} {
    use sui::coin::{Self};

    public struct {{COIN_TYPE}} has drop {}

    fun init(coin_witness: {{COIN_TYPE}}, ctx: &mut TxContext) {
        let (
            treasury_cap,
            coin_metadata
        ) =
            coin::create_currency(
                coin_witness,
                6,
                b"DEC6",
                b"Decimals 6",
                b"Coin with 6 decimals",
                option::none(),
                ctx
            );

        transfer::public_share_object(coin_metadata);

        transfer::public_share_object(treasury_cap);
    }
}
