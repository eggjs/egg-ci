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

const defaultAfterScript = `
after_script:
  - npminstall codecov && codecov
`.trim();

const config = Object.assign({
  type: 'travis, appveyor', // default is travis and appveyor
  os: {
    travis: '',
    'azure-pipelines': 'windows, macos',
  },
  version: '',
  npminstall: true,
  command: {
    travis: 'ci',
    appveyor: 'test',
    'azure-pipelines': 'test',
  },
  license: false,
  afterScript: defaultAfterScript,
}, pkg.ci);

config.types = arrayify(config.type);
config.versions = arrayify(config.version);
if (config.services) config.services = arrayify(config.services);
if (config.versions.length === 0) {
  const installNode = pkg.engines && (pkg.engines['install-node'] ||
    pkg.engines['install-alinode']);
  if (!installNode) {
    // default version is LTS
    config.versions = [ '6' ];
  }
}

if (pkg.ci.os) {
  config.os = Object.assign({}, config.os, pkg.ci.os);
}
for (const platfrom in config.os) {
  config.os[platfrom] = arrayify(config.os[platfrom]);
}

const originCommand = config.command;
if (typeof originCommand === 'string') {
  config.command = {
    travis: originCommand,
    appveyor: originCommand,
  };
}
config.command = Object.assign({
  travis: 'ci',
  appveyor: 'test',
  'azure-pipelines': 'test',
}, config.command);

let ymlName = '';
let ymlContent = '';
let ymlName2 = '';
let ymlContent2 = '';

for (const type of config.types) {
  if (type === 'travis') {
    ymlContent = engine.renderString(getTpl('travis'), config);
    ymlName = '.travis.yml';
  } else if (type === 'appveyor') {
    ymlContent = engine.renderString(getTpl('appveyor'), config);
    ymlName = 'appveyor.yml';
  } else if (type === 'azure-pipelines') {
    ymlContent = engine.renderString(getTpl('azure-pipelines.yml'), config);
    ymlName = 'azure-pipelines.yml';
    ymlContent2 = getTpl('azure-pipelines.template.yml');
    ymlName2 = 'azure-pipelines.template.yml';
  } else {
    throw new Error(`${type} type not support`);
  }
  const ymlPath = path.join(root, ymlName);
  fs.writeFileSync(ymlPath, ymlContent);
  console.log(`[egg-ci] create ${ymlPath} success`);
  if (ymlName2) {
    const ymlPath2 = path.join(root, ymlName2);
    fs.writeFileSync(ymlPath2, ymlContent2);
    console.log(`[egg-ci] create ${ymlPath2} success`);
  }
}

if (config.license) {
  let data = {
    year: '2017',
    fullname: 'Alibaba Group Holding Limited and other contributors.',
  };
  if (typeof config.license === 'object') {
    data = Object.assign(data, config.license);
  }
  if (Number(data.year) < new Date().getFullYear()) {
    data.year = `${data.year}-present`;
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
