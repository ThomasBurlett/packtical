import { readdir, readFile, writeFile, copyFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const output = process.env.PACKBEE_WEB_OUTPUT || "dist";
const html = await readFile(output + "/index.html", "utf8");
const assets = (await readdir(output, { recursive: true }))
  .filter((file) => /\.(js|css|png|woff2?|ttf|ico)$/.test(file))
  .map((file) => "/" + file.replaceAll("\\", "/"));
const version = createHash("sha256")
  .update(html)
  .update(assets.join())
  .digest("hex")
  .slice(0, 12);
await copyFile("assets/icon.png", output + "/icon.png");
await writeFile(
  output + "/manifest.json",
  JSON.stringify({
    name: "Packbee",
    short_name: "Packbee",
    start_url: "/",
    display: "standalone",
    background_color: "#FFF4DE",
    theme_color: "#FFF4DE",
    icons: [
      {
        src: "/icon.png",
        sizes: "1024x1024",
        type: "image/png",
        purpose: "any",
      },
    ],
  }),
);
await writeFile(
  output + "/sw.js",
  `const CACHE='packbee-${version}';const ASSETS=${JSON.stringify(["/", "/index.html", "/manifest.json", "/icon.png", ...assets])};
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('packbee-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;if(event.request.mode==='navigate'){event.respondWith(fetch(event.request).catch(()=>caches.match('/index.html')));return;}event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request)));});`,
);
await writeFile(
  output + "/index.html",
  html
    .replace(
      "</head>",
      '<meta name="theme-color" content="#FFF4DE"><link rel="manifest" href="/manifest.json"></head>',
    )
    .replace(
      "</body>",
      '<script>if("serviceWorker" in navigator)navigator.serviceWorker.register("/sw.js").catch(console.error)</script></body>',
    ),
);
