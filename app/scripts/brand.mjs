import sharp from "sharp";
import { writeFile } from "node:fs/promises";
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 100 100"><rect width="100" height="100" fill="#FFF4DE"/><g transform="translate(15 12) scale(.7)"><path d="M34 30V24c0-17 32-17 32 0v6" fill="none" stroke="#24313A" stroke-width="6"/><rect x="18" y="25" width="64" height="65" rx="20" fill="#F4B942" stroke="#24313A" stroke-width="4"/><path d="M20 51h60M35 53v8M64 53v8" fill="none" stroke="#24313A" stroke-width="4"/><rect x="32" y="68" width="36" height="15" rx="6" fill="#7E9B78" stroke="#24313A" stroke-width="3"/><ellipse cx="78" cy="22" rx="7" ry="11" fill="#FFFDF8" transform="rotate(-32 78 22)"/><ellipse cx="90" cy="22" rx="7" ry="11" fill="#FFFDF8" transform="rotate(32 90 22)"/><ellipse cx="85" cy="34" rx="12" ry="9" fill="#24313A"/><path d="M82 27v14M89 27v14" stroke="#F4B942" stroke-width="3"/><circle cx="76" cy="32" r="2" fill="#FFFDF8"/></g></svg>`;
await writeFile("assets/packbee.svg", svg);
await sharp(Buffer.from(svg)).png().toFile("assets/icon.png");
await sharp(Buffer.from(svg)).png().toFile("assets/adaptive-icon.png");
await sharp(Buffer.from(svg)).resize(192).png().toFile("assets/favicon.png");
