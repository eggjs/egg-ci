'use strict';

const path = require('path');
const fs = require('fs');
const nunjucks = require('nunjucks');

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

const config = {
  version: '14, 16, 18',
  os: 'linux, windows, macos',
  npminstall: false,
  // auto detect nyc_output/*.json files, please use on travis windows platfrom
  nyc: false,
  license: false,
  command: 'ci',
  ...pkg.ci,
};

config.versions = arrayify(config.version);
// if (config.services) config.services = arrayify(config.services);

const os = arrayify(config.os).map(name => {
  if (name === 'linux') name = 'ubuntu';
  return `${name}-latest`;
});

const ymlContent = getTpl('github.yml')
  .replace('{{github_node_version}}', config.versions.join(', '))
  .replace('{{github_os}}', os.join(', '))
  .replace('{{github_command_ci}}', config.command)
  .replace('{{github_npm_install}}', config.npminstall ? 'npm i -g npminstall && npminstall' : 'npm i');
const ymlName = '.github/workflows/nodejs.yml';
const ymlPath = path.join(root, ymlName);
fs.mkdirSync(path.dirname(ymlPath), { recursive: true });
fs.writeFileSync(ymlPath, ymlContent);
console.log(`[egg-ci] create ${ymlPath} success`);

if (config.license) {
  const data = {
    year: '2017',
    fullname: 'Alibaba Group Holding Limited and other contributors.',
    ...config.license,
  };
  data.year = `${data.year}-present`;
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
