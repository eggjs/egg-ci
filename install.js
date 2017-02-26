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
  root = path.join(__dirname, '../../../../..');
} else {
  root = path.join(__dirname, '../..');
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
  type: 'travis, appveyor', // default is travis and appveyor
  version: '',
  npminstall: true,
  command: 'ci',
  license: true,
}, pkg.ci);
config.types = arrayify(config.type);
config.versions = arrayify(config.version);
if (config.versions.length === 0) {
  const installNode = pkg.engines && (pkg.engines['install-node'] ||
    pkg.engines['install-alinode']);
  if (!installNode) {
    // default version is LTS
    config.versions = [ '6' ];
  }
}

let ymlName = '';
let ymlContent = '';

for (const type of config.types) {
  if (type === 'travis') {
    ymlContent = engine.renderString(getTpl('travis'), config);
    ymlName = '.travis.yml';
  } else if (type === 'appveyor') {
    ymlContent = engine.renderString(getTpl('appveyor'), config);
    ymlName = 'appveyor.yml';
  } else {
    throw new Error(`${type} type not support`);
  }
  const ymlPath = path.join(root, ymlName);
  fs.writeFileSync(ymlPath, ymlContent);
  console.log(`[egg-ci] create ${ymlPath} success`);
}

if (config.license) {
  let data = {
    year: new Date().getFullYear(),
    fullname: 'Alibaba Group Holding Limited and other contributors.',
  };
  if (typeof config.license === 'object') {
    data = Object.assign(data, config.license);
  }
  const licenseContent = engine.renderString(getTpl('license'), data);
  const licensePath = path.join(root, 'LICENSE');
  fs.writeFileSync(licensePath, licenseContent);
  console.log(`[egg-ci] create ${licensePath} success`);
}

function getTpl(name) {
  return fs.readFileSync(path.join(__dirname, 'templates', name), 'utf8');
}

function arrayify(str) {
  if (Array.isArray(str)) return str;
  return str.split(/\s*,\s*/).filter(s => !!s);
}
