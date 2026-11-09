#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

const directory = path.resolve(__dirname, '../src/resources/icons');
const symbol = fs.readFileSync(path.join(directory, 'talia-symbol.svg'), 'utf8');
const artwork = symbol.replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
const svg = (content) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${content}</svg>`);
const icon = svg(`<rect x="0" y="0" width="100" height="100" rx="20" fill="#282A2D"/><g transform="translate(12.5 12.5) scale(.75)">${artwork.replaceAll('#282A2D', '#F6F5F1')}</g>`);
const template = svg(artwork.replaceAll('#282A2D', '#000000').replaceAll('#F4BC53', '#000000'));
const render = (source, size) => sharp(source, { density: 768 }).resize(size, size).png().toBuffer();

async function main() {
  const sizes = [16, 24, 32, 48, 64, 128, 256, 512, 1024];
  const images = new Map(await Promise.all(sizes.map(async size => [size, await render(icon, size)])));
  await Promise.all([
    fs.promises.writeFile(path.join(directory, 'icon.png'), images.get(1024)),
    render(Buffer.from(symbol), 512).then(bytes => fs.promises.writeFile(path.join(directory, 'logo.png'), bytes)),
    render(template, 18).then(bytes => fs.promises.writeFile(path.join(directory, 'taliaTemplate.png'), bytes)),
    render(template, 36).then(bytes => fs.promises.writeFile(path.join(directory, 'taliaTemplate@2x.png'), bytes)),
  ]);

  // I contenitori ICO e ICNS usano immagini PNG multirisoluzione senza dipendenze aggiuntive.
  const icoSizes = sizes.filter(size => size <= 256);
  const header = Buffer.alloc(6 + 16 * icoSizes.length);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(icoSizes.length, 4);
  let offset = header.length;
  icoSizes.forEach((size, index) => {
    const entry = 6 + index * 16;
    const bytes = images.get(size);
    header[entry] = size === 256 ? 0 : size;
    header[entry + 1] = header[entry];
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(bytes.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += bytes.length;
  });
  fs.writeFileSync(path.join(directory, 'icon.ico'), Buffer.concat([header, ...icoSizes.map(size => images.get(size))]));

  const chunks = [['icp4', 16], ['icp5', 32], ['icp6', 64], ['ic07', 128], ['ic08', 256], ['ic09', 512], ['ic10', 1024]]
    .map(([type, size]) => {
      const bytes = images.get(size);
      const chunk = Buffer.alloc(8);
      chunk.write(type, 0, 'ascii');
      chunk.writeUInt32BE(bytes.length + 8, 4);
      return Buffer.concat([chunk, bytes]);
    });
  const icnsHeader = Buffer.alloc(8);
  icnsHeader.write('icns', 0, 'ascii');
  icnsHeader.writeUInt32BE(8 + chunks.reduce((total, chunk) => total + chunk.length, 0), 4);
  fs.writeFileSync(path.join(directory, 'icon.icns'), Buffer.concat([icnsHeader, ...chunks]));
  console.log('Icone Talia generate: PNG, ICO, ICNS e template macOS 1x/2x.');
}

main().catch(error => { console.error(error); process.exitCode = 1; });
