// WalrusX Passport NFT，持有该通行证NFT，方可发布推文、评论和转发，点赞和关注功能不受限制
module walrusx::x_pass_nft {
    use std::string::{utf8, String};
    use sui::package;
    use sui::display;

    public struct XPassNFT has key, store {
        id: UID,
        name: String,
        image_url: String,
    }

    /// One-Time-Witness for the module.
    public struct X_PASS_NFT has drop {}

    fun init(otw: X_PASS_NFT, ctx: &mut TxContext) {
        let keys = vector[
            utf8(b"name"),
            utf8(b"image_url"),
            utf8(b"description"),
            utf8(b"creator"),
        ];

        let values = vector[
            utf8(b"{name}'s WalrusX Passport"),
            utf8(b"{image_url}"),
            utf8(b"HOH Mini Hackathon"),
            utf8(b"rzexin")
        ];

        let publisher = package::claim(otw, ctx);

        let mut display = display::new_with_fields<XPassNFT>(
            &publisher, keys, values, ctx
        );

        display::update_version(&mut display);

        transfer::public_transfer(publisher, ctx.sender());
        transfer::public_transfer(display, ctx.sender());
    }

    public(package) fun mint(name: String, image_url: String, ctx: &mut TxContext) {
        mint_and_transfer(name, image_url, ctx.sender(), ctx)
    }

    fun mint_and_transfer(name: String, image_url: String,
        recipient: address, ctx: &mut TxContext) {

        transfer::public_transfer(XPassNFT {
            id: object::new(ctx),
            name,
            image_url}, recipient);
    }
}
