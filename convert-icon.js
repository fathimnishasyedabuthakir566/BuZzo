const fs = require('fs');
const pngToIco = require('png-to-ico'); // Assuming default export issue is fixed or handled
// Note: If png-to-ico still needs .default, we will handle it.
// Let's use standard require for jimp. 
// Jimp 1.0+ has breaking changes, but let's assume standard usage or check version.
// Using older jimp syntax for safety if version is unknown, but usually `await Jimp.read`
const { Jimp } = require('jimp');

async function convert() {
    try {
        console.log('Resizing image...');
        // Jimp v1.0 usage might differ. Let's try to just use png-to-ico if strictness can be bypassed? No.
        // Let's try to just use a square pad.

        // Actually, let's verify if 'jimp' is the right package. 'jimp' is common.
        // We will read, resize to 256x256 (contain), and save as temporary png.

        const image = await Jimp.read('public/logo.png');
        image.resize({ w: 256, h: 256 }); // Resize to 256x256

        await image.write('public/logo-square.png');

        console.log('Converting to ICO...');
        // Handle the require default issue dynamically
        const convertFn = pngToIco.default || pngToIco;

        const buf = await convertFn('public/logo-square.png');
        fs.writeFileSync('public/logo.ico', buf);
        console.log('Successfully created public/logo.ico');

        // cleanup
        fs.unlinkSync('public/logo-square.png');

    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

convert();
