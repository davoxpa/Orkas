#!/usr/bin/env node
/**
 * Declare the connector callback protocol on the bundled Electron app used by macOS source runs.
 * Packaged apps receive the same declaration from package.json via electron-builder. No network
 * listener or local HTTP endpoint is created here.
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

if (process.platform !== 'darwin') process.exit(0);

const root = path.resolve(__dirname, '..');
const electronRoot = path.join(root, 'node_modules', 'electron');
const executablePathFile = path.join(electronRoot, 'path.txt');
if (!fs.existsSync(executablePathFile)) process.exit(0);
const executable = path.join(electronRoot, 'dist', fs.readFileSync(executablePathFile, 'utf8').trim());
const appBundle = path.resolve(executable, '../../..');
const plist = path.join(appBundle, 'Contents', 'Info.plist');
const lsregister = '/System/Library/Frameworks/CoreServices.framework/Versions/A/Frameworks/LaunchServices.framework/Versions/A/Support/lsregister';
const desired = {
  bundleId: 'com.orkas.desktop',
  name: 'Talia',
  scheme: 'orkas',
};

if (!fs.existsSync(plist)) process.exit(0);

function read(key) {
  const result = spawnSync('plutil', ['-extract', key, 'raw', '-o', '-', plist], { encoding: 'utf8' });
  return result.status === 0 ? String(result.stdout || '').trim() : '';
}

function replaceString(key, value) {
  const result = spawnSync('plutil', ['-replace', key, '-string', value, plist], { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`failed to set ${key}: ${String(result.stderr || '').trim()}`);
}

const currentScheme = read('CFBundleURLTypes.0.CFBundleURLSchemes.0');
const sourceIcon = path.join(root, 'src', 'resources', 'icons', 'icon.icns');
const iconName = read('CFBundleIconFile') || 'electron.icns';
const targetIcon = path.join(appBundle, 'Contents', 'Resources', iconName.endsWith('.icns') ? iconName : `${iconName}.icns`);
const iconChanged = !fs.existsSync(targetIcon) || !fs.readFileSync(sourceIcon).equals(fs.readFileSync(targetIcon));
const needsPatch = iconChanged || read('CFBundleIdentifier') !== desired.bundleId
  || read('CFBundleName') !== desired.name
  || read('CFBundleDisplayName') !== desired.name
  || currentScheme !== desired.scheme;

try {
  if (needsPatch) {
    if (iconChanged) fs.copyFileSync(sourceIcon, targetIcon);
    replaceString('CFBundleIdentifier', desired.bundleId);
    replaceString('CFBundleName', desired.name);
    replaceString('CFBundleDisplayName', desired.name);
    spawnSync('plutil', ['-remove', 'CFBundleURLTypes', plist], { stdio: 'ignore' });
    const urlTypes = JSON.stringify([{
      CFBundleURLName: 'ai.orkas.connectors',
      CFBundleURLSchemes: [desired.scheme],
    }]);
    const inserted = spawnSync('plutil', ['-insert', 'CFBundleURLTypes', '-json', urlTypes, plist], {
      encoding: 'utf8',
    });
    if (inserted.status !== 0) {
      throw new Error(`failed to declare ${desired.scheme}://: ${String(inserted.stderr || '').trim()}`);
    }
    const signed = spawnSync('codesign', ['--force', '--deep', '--sign', '-', appBundle], { encoding: 'utf8' });
    if (signed.status !== 0) {
      throw new Error(`ad-hoc signing failed: ${String(signed.stderr || '').trim()}`);
    }
  }
  if (fs.existsSync(lsregister)) spawnSync(lsregister, ['-f', appBundle], { stdio: 'ignore' });
  console.log(`[Talia] app identity and connector callback ready (${desired.scheme}://)`);
} catch (err) {
  console.warn(`[Talia] connector callback protocol setup skipped: ${err && err.message || err}`);
}
