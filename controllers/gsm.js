const gsmarena = require('gsmarena-api');


exports.getDevices = async (req, res) => {
    const brand = req.params.brand;
    console.log(brand);
    if (brand === "Sony") {
        const data = [
            {
                name: 'PS4',
                img: "https://www.freepnglogos.com/uploads/playstation-4-png-logo/news-playstation-4-logo-png-29.png"
            }
            , {name: 'PS5', img: "https://emulation.gametechwiki.com/images/thumb/6/64/Ps5.png/900px-Ps5.png"}
            , {
                name: 'DualSense',
                img: "https://gmedia.playstation.com/is/image/SIEPDC/dualsense-controller-product-thumbnail-01-en-14sep21?$facebook$"
            }
            , {
                name: "DualShock 4",
                img: "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/steamworks_docs/english/ds4_controller.png"
            }
        ]
        res.send(data);
        return;
    }
    if (brand === "Xbox") {
        const data = [
            {
                name: 'Xbox One',
                img: "https://www.nicepng.com/png/detail/506-5062685_microsoft-xbox-one-s-headphones.png"
            },
            {name: 'Xbox Series X', img: "https://pngimg.com/uploads/xbox/xbox_PNG101377.png"},
            {name: "Controller", img: "https://freepngimg.com/save/27382-xbox-controller-image/1800x1368"}
        ]
        res.send(data);
        return;
    }
    if (brand === "Other") {
        const data = [
            {name: "laptop"},
            {name: "desktop"},
            {name: "tablet"},
            {name: "smartwatch"},
            {name: "other"}
        ]
        res.send(data);
        return;
    }


    const devices = await gsmarena.catalog.getBrand(brand);
    res.send(devices);
}
