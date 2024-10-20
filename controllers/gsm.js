const gsmarena = require('gsmarena-api');
const cachedData = {};
const Sony = [
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

const Xbox = [
    {
        name: 'Xbox One',
        img: "https://www.nicepng.com/png/detail/506-5062685_microsoft-xbox-one-s-headphones.png"
    },
    {name: 'Xbox Series X', img: "https://pngimg.com/uploads/xbox/xbox_PNG101377.png"},
    {name: 'Xbox Series S', img: "https://m.media-amazon.com/images/I/61QKAlzPSfL._AC_UF894,1000_QL80_.jpg"},

    {name: "Controller", img: "https://freepngimg.com/save/27382-xbox-controller-image/1800x1368"}
]

const Nintendo =[
    {
        name: 'Switch Lite',
        img: "https://i.namu.wiki/i/1sNJUaxPlTtfHrgPQ71lqxM-9_xxqwKEAFOmReRrNtzdCa1a-tgbjWLyr63CfpI9l_OGg2sfYyF_WJ8yvp3MVw.webp"
    },
    {
        name: 'Switch ',
        img: "https://e7.pngegg.com/pngimages/469/643/png-clipart-nintendo-switch-pokemon-red-and-blue-super-mario-odyssey-video-game-consoles-nintendo-blue-electronics.png"
    },
    {
        name: 'Switch Oled ',
        img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRMeqUOyZVixCDmbcbcWhkkLZFRxQeB-tW-Gg&s"
    },
]

// Function to fetch and cache data for a specific brand
const fetchDataForBrand = async (brand) => {
    try {
        let allDevices = [];
        let page = 1;
        let hasNextPage = true;

        while (hasNextPage) {
            const devices = await gsmarena.catalog.getBrand(`${brand}-p${page}`);
            if (devices.length === 0 || page>5) {
                hasNextPage = false;
            } else {
                allDevices = allDevices.concat(devices);
                page++;
            }
        }

        if (brand === "samsung-phones-9") {
            const galaxyDevices = allDevices.filter(device => device.name.startsWith("Galaxy"));
            galaxyDevices.forEach(device => device.name = device.name.replace("Galaxy", ""));
            cachedData[brand] = galaxyDevices;
        } else {
            cachedData[brand] = allDevices;
        }
    } catch (error) {
        console.error(`Error fetching data for brand ${brand}: ${error.message}`);
    }
};

// Fetch data for Apple, Samsung, and Xiaomi when the server starts
const initializeData = async () => {
    const brandsToInitialize = ["apple-phones-f-48-0", "samsung-phones-f-9-0", "xiaomi-phones-f-80-0","vivo-phones-f-98-0"];

    for (const brand of brandsToInitialize) {
        await fetchDataForBrand(brand);

    }
};

// Call the initializeData function when the server starts
initializeData();

exports.getDevices = async (req, res) => {
    const brand = req.params.brand;
    console.log(brand);

    // Check if data is already cached for the brand
    if (brand && cachedData[brand]) {
        res.send(cachedData[brand]);
        return;
    }

    // Handle your existing cases for "Sony", "Xbox", and "Other" here...
    if (brand === "Sony") {
        res.send(Sony);
        return;
    }
    if (brand === "Nintendo") {
        res.send(Nintendo);
        return;
    }
    if (brand === "Xbox") {
        res.send(Xbox);
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
    // If the brand is not "Sony", "Xbox", or "Other", fetch data from GSM Arena API
    if (brand) {
        await fetchDataForBrand(brand);
        res.send(cachedData[brand] || []);
    } else {
        res.status(400).send("Invalid brand");
    }
};
