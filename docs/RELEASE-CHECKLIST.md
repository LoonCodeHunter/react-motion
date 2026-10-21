# Release checklist — v1.0.0-rc.1

This repository is a **release candidate**, not a previously proven stable 1.0.

- [x] Modular source and type declarations built locally.
- [x] Native Node test suite passes locally.
- [x] Package/lockfile version match verified.
- [x] Source + npm tarball generated locally.
- [ ] Lockfile `npm ci` verified with the pinned TypeScript 6.0.3 in a networked environment.
- [ ] Official React 18/19 SSR and JSX type compatibility workflow green on GitHub.
- [ ] React 18/19 DOM mounting, hydration and presence re-entry tests in real browsers.
- [ ] Touch/keyboard/focus, pointer captures, nested layout and reduced-motion audited.
- [ ] Chrome, Firefox and Safari browser matrix green.
- [ ] Hosted Motion Score benchmark green.
- [ ] Security and license/provenance review completed.
- [ ] Reproducible benchmark comparison against Motion, with raw data.

Publish as `npm publish --tag next` **only after validating the hosted gates**; do not tag `latest` or declare superiority without evidence.
