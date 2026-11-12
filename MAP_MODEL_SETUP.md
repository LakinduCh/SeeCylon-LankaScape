# Map model setup (full-size V6 map)

The site shows a 3D map of Sri Lanka from one file: `public/models/MPM-project_V6.glb`.

There are two versions of that file:

| Version | Size | Where it is | Quality |
|---|---|---|---|
| **Light** (compressed) | ~30 MB | Already in this repo | Good enough to run and develop |
| **Full-size** (original export) | ~698 MB | Google Drive (link below) | Best, with every texture and detail |

GitHub does not allow files over 100 MB, so the full-size file is shared through Google Drive.
You do **not** need it to run the site. Use it only if you want the best-looking map.

**Full-size download:** `PASTE THE GOOGLE DRIVE LINK HERE`

SHA-256 of the full-size file (to check the download is complete):

```
885da88e31f966f7fc41ca53701632db68e10fc314d2e1dd0c27a21cb1347fdd
```

---

## Option A: just run the site (light map)

```bash
git checkout feature-web-cartoon-map
npm install
npm run dev
```

Open the address that `npm run dev` prints (usually http://localhost:5173). Nothing else to do.

## Option B: use the full-size map

1. Download the full-size file from the Drive link above (about 698 MB).
2. Check it (optional but recommended). In PowerShell:
   ```powershell
   Get-FileHash .\MPM-project_V6.glb -Algorithm SHA256
   ```
   The hash must match the one above. If not, the download is broken: download it again.
3. Put the file in the project at `public/models/` and **replace** the existing file, keeping the exact name:
   ```
   public/models/MPM-project_V6.glb
   ```
4. Tell git to ignore your local copy, so you never commit the big file by accident:
   ```bash
   git update-index --skip-worktree public/models/MPM-project_V6.glb
   ```
5. Run the site:
   ```bash
   npm run dev
   ```
6. Hard-refresh the browser (Ctrl+Shift+R).

To go back to the light map later:

```bash
git update-index --no-skip-worktree public/models/MPM-project_V6.glb
git checkout -- public/models/MPM-project_V6.glb
```

---

## Notes

- **Never commit the full-size file.** GitHub will reject the push, and the repository's Git LFS budget is already used up. Step 4 above protects you.
- **The first load of the full-size map is slow** (it is ~700 MB of data, and the browser needs a lot of memory). Close other heavy tabs. If the page stays blank or the tab crashes, use the light map (Option A).
- **Zoom-out limit and outline** are set for the full map; they look the same with the light map.
- The map file is not used for the pins. Pin positions are in `src/data/locations.json`. If the map layout changes, the pins must be updated to match.

## If something goes wrong

| Problem | What to do |
|---|---|
| Blank page / tab crashes | Use the light map (Option A). Close other tabs. |
| Map looks old or wrong | Hard-refresh (Ctrl+Shift+R). The browser caches the file. |
| Hash does not match | Download the file again. |
| `git status` shows the model as changed | Run step 4 above. |
