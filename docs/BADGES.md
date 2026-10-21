# Version badge policy — repository version vs npm publication

The README badge must display **`Version v1.0.0`**, not `Source` or `Source candidate`. It is a static reflection of this source archive's `package.json` version; it is **not** a claim that this version has been published to npm.

## Badge definitions

- **Version:** `https://img.shields.io/badge/version-v1.0.0-7c3aed?style=flat&logo=npm&logoColor=white`. The linked manifest declares v1.0.0. `npm run badges:check` verifies the label follows package metadata.
- **npm:** a separate link to the npm package page. It does not assume npm's current `latest` is v1.0.0.
- **CI:** GitHub Actions badge: it reflects public workflow results for the default branch, not the state of this uncommitted ZIP.
- **Motion Score:** public endpoint reading the repository score JSON. The score may show `pending` until the corresponding hosted benchmark completes.
- **Licence:** MIT is a legal metadata property, not a quality rating.

### Update procedure

1. Bump `package.json` and `package-lock.json` together.
2. Update the version label in README and the SVG hero.
3. Run `npm run badges:check` and `npm run verify:lockfile`.
4. Publish the new version after testing; do not reuse a version number already published on npm.
5. Keep `npm latest` and `source version` conceptually separate while preparing an unreleased build.

Badges do not establish benchmark superiority, security certifications or compatibility across all desktop/browser combinations.
