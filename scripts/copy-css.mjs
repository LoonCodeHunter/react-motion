import {copyFile} from 'node:fs/promises';
await Promise.all([
  copyFile('src/styles.css','dist/es/styles.css'),
  copyFile('src/ui.css','dist/es/ui.css'),
]);
