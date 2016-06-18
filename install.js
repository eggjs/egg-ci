'use strict';

const nunjucks = require('nunjucks');
const path = require('path');
const fs = require('fs');

const engine = nunjucks.configure({
  autoescape: false,
  watch: false,
});

let root;
// support npminstall path
if (__dirname.indexOf('.npminstall') >= 0) {
  root = path.join(__dirname, '../../../../../../..');
} else {
  root = path.join(__dirname, '../../..');
}

if (process.env.CI_ROOT_FOR_TEST) {
  root = process.env.CI_ROOT_FOR_TEST;
}

let pkg;
try {
  pkg = require(path.join(root, 'package.json'));
} catch (err) {
  console.error('read package.json error: %s', err.message);
  console.error('[egg-ci] stop create ci yml');
  process.exit(0);
}

const config = Object.assign({
  type: 'travis', // default is travis ci
  versions: [],
  npminstall: true,
  command: 'ci',
}, pkg.ci);
config.versions = config.versions || [];
if (config.versions.length === 0) {
  const installNode = pkg.engines && (pkg.engines['install-node'] || pkg.engines['install-alinode']);
  if (!installNode) {
    // default version is LTS
    config.versions = [ '4' ];
  }
}

let ymlName = '';
let ymlContent = '';

if (config.type === 'travis') {
  ymlContent = engine.renderString(getTpl('travis'), config);
  ymlName = '.travis.yml';
} else {
  throw new Error(`${config.type} type not support`);
}

const ymlPath = path.join(root, ymlName);
fs.writeFileSync(ymlPath, ymlContent);
console.log(`[egg-ci] create ${ymlPath} success`);

function getTpl(name) {
  return fs.readFileSync(path.join(__dirname, 'templates', name), 'utf8');
}
