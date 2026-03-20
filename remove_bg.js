const Jimp = require('jimp');
const path = require('path');

async function removeWhiteBackground(imagePath) {
    try {
        console.log(`Processing ${imagePath}...`);
        const image = await Jimp.read(imagePath);

        image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
            const r = this.bitmap.data[idx + 0];
            const g = this.bitmap.data[idx + 1];
            const b = this.bitmap.data[idx + 2];

            // If the pixel is very light (white or light gray checkerboard pattern)
            if (r > 230 && g > 230 && b > 230) {
                // Check if it's grayscale-ish
                if (Math.abs(r - g) < 15 && Math.abs(r - b) < 15) {
                    this.bitmap.data[idx + 3] = 0; // Make transparent
                }
            }
        });

        await image.writeAsync(imagePath);
        console.log(`Successfully processed ${imagePath}`);
    } catch (error) {
        console.error(`Error processing ${imagePath}:`, error);
    }
}

async function main() {
    const dirPath = path.join(__dirname, 'public');
    const img1 = path.join(dirPath, 'email-overload-illustration.png');
    const img2 = path.join(dirPath, 'time-saved-illustration.png');

    await removeWhiteBackground(img1);
    await removeWhiteBackground(img2);
}

main();
