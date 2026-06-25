import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const dest = path.join(root, "public", "venue-map.png");

const candidates = [
  path.join(
    root,
    "assets",
    "c__Users_Jarod_AppData_Roaming_Cursor_User_workspaceStorage_981cdbcecdfb389a8d69c043d4e52703_images_Wedding_Map-c78c265a-6204-4d1f-aaff-afba055273d1.png",
  ),
  path.join(process.env.USERPROFILE ?? "", "Downloads", "Wedding_Map.png"),
  path.join(process.env.USERPROFILE ?? "", "Downloads", "venue-map.png"),
];

for (const source of candidates) {
  if (source && fs.existsSync(source)) {
    fs.copyFileSync(source, dest);
    console.log(`Copied venue map to public/venue-map.png from ${source}`);
    process.exit(0);
  }
}

console.error(
  "Venue map image not found. Save your map PNG as public/venue-map.png in the project root.",
);
process.exit(1);
