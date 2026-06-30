import { copyFileSync, existsSync, renameSync, unlinkSync } from "node:fs";
import sharp from "sharp";

const INPUT = "public/transfers/airport-express-departure.png";
const BACKUP = "public/transfers/airport-express-departure.original.png";
const OUTPUT_TMP = "public/transfers/airport-express-departure.updated.png";

const DATE_LINE = "SUNDAY 27 SEPTEMBER";
const YEAR_LINE = "2026";

const image = sharp(INPUT);
const { width, height } = await image.metadata();

if (!width || !height) {
  throw new Error("Could not read flyer dimensions");
}

// Between the "DEPARTURE ONLY" rule and the BNE / MCY cards.
const dateY = Math.round(height * 0.405);
const yearY = dateY + Math.round(width * 0.04);
const dateSize = Math.round(width * 0.034);
const yearSize = Math.round(width * 0.024);

const svg = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <text
    x="50%"
    y="${dateY}"
    text-anchor="middle"
    font-family="Georgia, 'Times New Roman', serif"
    font-size="${dateSize}"
    font-weight="600"
    fill="#8f7650"
    letter-spacing="0.16em"
  >${DATE_LINE}</text>
  <text
    x="50%"
    y="${yearY}"
    text-anchor="middle"
    font-family="Georgia, 'Times New Roman', serif"
    font-size="${yearSize}"
    fill="#a08858"
    letter-spacing="0.2em"
  >${YEAR_LINE}</text>
</svg>
`;

if (!existsSync(BACKUP)) {
  copyFileSync(INPUT, BACKUP);
}

await image
  .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
  .png()
  .toFile(OUTPUT_TMP);

renameSync(OUTPUT_TMP, INPUT);

console.log(`Updated ${INPUT} (${width}x${height}) with ${DATE_LINE} ${YEAR_LINE}`);
