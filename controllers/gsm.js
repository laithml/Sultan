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
    {name: "Controller", img: "https://freepngimg.com/save/27382-xbox-controller-image/1800x1368"}
]

// Function to fetch and cache data for a specific brand
const fetchDataForBrand = async (brand) => {
    try {
        const devices = await gsmarena.catalog.getBrand(brand);
        if (brand==="samsung-phones-9"){
            //save only Devices start with Galaxy
            const galaxyDevices = devices.filter(device => device.name.startsWith("Galaxy"));
            //remove Galaxy from the name
            galaxyDevices.forEach(device => device.name = device.name.replace("Galaxy", ""));
            cachedData[brand] = galaxyDevices;
        }else
        cachedData[brand] = devices;
    } catch (error) {
        console.error(`Error fetching data for brand ${brand}: ${error.message}`);
    }
};

// Fetch data for Apple, Samsung, and Xiaomi when the server starts
const initializeData = async () => {
    const brandsToInitialize = ["apple-phones-48", "samsung-phones-9", "xiaomi-phones-80","vivo-phones-98"];

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
