'use strict';

const test = require('ava');
const execSync = require('child_process').execSync;
const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');

const filepath = path.join(__dirname, '../install.js');
const cmd = `node ${filepath}`;

function clean() {
  const root = path.join(__dirname, 'fixtures');
  fs.readdirSync(root).forEach(name => {
    [ '.travis.yml', 'appveyor.yml', 'LICENSE' ].forEach(file => {
      rimraf.sync(path.join(root, name, file));
    });
  });
}

test.before(clean);

test('travis and npminstall = false', t => {
  const env = Object.assign({}, process.env, { CI_ROOT_FOR_TEST: getRoot('travis') });
  execSync(cmd, { env });
  const yml = fs.readFileSync(getYml('travis', '.travis.yml'), 'utf8');
  t.regex(yml, /\- '1'/);
  t.regex(yml, /\- '2'/);
  t.regex(yml, /\- '4'/);
  t.regex(yml, /\- '5'/);
  t.regex(yml, /after_script:/);
  t.regex(yml, /\- npm i codecov && codecov/);
  t.notRegex(yml, /os:/);
  t.falsy(fs.existsSync(getYml('travis', 'appveyor.yml')));
  t.falsy(fs.existsSync(getYml('travis', 'LICENSE')));
});

test('travis with os: linux and osx', t => {
  const env = Object.assign({}, process.env, { CI_ROOT_FOR_TEST: getRoot('travis-os') });
  execSync(cmd, { env });
  const yml = fs.readFileSync(getYml('travis-os', '.travis.yml'), 'utf8');
  t.regex(yml, /\- '1'/);
  t.regex(yml, /\- '2'/);
  t.regex(yml, /\- '4'/);
  t.regex(yml, /\- '5'/);
  t.regex(yml, /os:/);
  t.regex(yml, / - linux/);
  t.regex(yml, / - osx/);
  t.regex(yml, /after_script:/);
  t.regex(yml, /- npm i npminstall && npminstall/);
  t.falsy(fs.existsSync(getYml('travis-os', 'appveyor.yml')));
  t.falsy(fs.existsSync(getYml('travis-os', 'LICENSE')));
});

test('travis and versions in array', t => {
  const env = Object.assign({}, process.env, { CI_ROOT_FOR_TEST: getRoot('array') });
  execSync(cmd, { env });
  const yml = fs.readFileSync(getYml('travis', '.travis.yml'), 'utf8');
  t.regex(yml, /\- '1'/);
  t.regex(yml, /\- '2'/);
  t.regex(yml, /\- '4'/);
  t.regex(yml, /\- '5'/);
  t.falsy(fs.existsSync(getYml('travis', 'appveyor.yml')));
});

test('default', t => {
  const env = Object.assign({}, process.env, { CI_ROOT_FOR_TEST: getRoot('default') });
  execSync(cmd, { env });
  const yml = fs.readFileSync(getYml('default', '.travis.yml'), 'utf8');
  t.regex(yml, /\- npm i npminstall && npminstall/);
  t.regex(yml, /\- '6, 8, 10'/);
  t.regex(yml, /\- npm run ci/);
  t.regex(yml, /\- npminstall codecov && codecov/);
  const appveyoryml = fs.readFileSync(getYml('default', 'appveyor.yml'), 'utf8');
  t.regex(appveyoryml, /\- npm i npminstall && node_modules\\.bin\\npminstall/);
  t.regex(appveyoryml, /\- nodejs_version: '6, 8, 10'/);
  t.regex(appveyoryml, /\- npm run test/);
});

test('nyc = true', t => {
  const env = Object.assign({}, process.env, { CI_ROOT_FOR_TEST: getRoot('nyc-true') });
  execSync(cmd, { env });
  const yml = fs.readFileSync(getYml('nyc-true', '.travis.yml'), 'utf8');
  t.regex(yml, /\- npm i npminstall && npminstall/);
  t.regex(yml, /\- '6, 8, 10'/);
  t.regex(yml, /\- npm run ci/);
  t.regex(yml, /\- npminstall codecov && codecov --disable=gcov -f \.nyc_output\/\*\.json/);
});

test('azure-pipelines', t => {
  const env = Object.assign({}, process.env, { CI_ROOT_FOR_TEST: getRoot('azure-pipelines') });
  execSync(cmd, { env });
  const yml = fs.readFileSync(getYml('azure-pipelines', 'azure-pipelines.yml'), 'utf8');
  const ymlTpl = fs.readFileSync(getYml('azure-pipelines', 'azure-pipelines.template.yml'), 'utf8');
  t.regex(ymlTpl, /npm i npminstall && npminstall/);
  t.regex(ymlTpl, /node_4/);
  t.regex(ymlTpl, /node_version: 4/);
  t.regex(ymlTpl, /node_6/);
  t.regex(ymlTpl, /node_version: 6/);
  t.regex(ymlTpl, /node_8/);
  t.regex(ymlTpl, /node_version: 8/);
  t.regex(ymlTpl, /node_10/);
  t.regex(ymlTpl, /node_version: 10/);
  t.regex(yml, /name: windows/);
  t.regex(yml, /name: macos/);
});

test('default on install-node', t => {
  const env = Object.assign({}, process.env, { CI_ROOT_FOR_TEST: getRoot('install-node') });
  execSync(cmd, { env });
  const yml = fs.readFileSync(getYml('install-node', '.travis.yml'), 'utf8');
  t.regex(yml, /\- npm i npminstall && npminstall/);
  t.regex(yml, /\- '6'/);
  const appveyoryml = fs.readFileSync(getYml('install-node', 'appveyor.yml'), 'utf8');
  t.regex(appveyoryml, /\- npm i npminstall && node_modules\\.bin\\npminstall/);
  t.regex(appveyoryml, /\- nodejs_version: '6'/);
});

test('default on install-alinode', t => {
  const env = Object.assign({}, process.env, { CI_ROOT_FOR_TEST: getRoot('install-alinode') });
  execSync(cmd, { env });
  const yml = fs.readFileSync(getYml('install-alinode', '.travis.yml'), 'utf8');
  t.regex(yml, /\- npm i npminstall && npminstall/);
  t.regex(yml, /\- '6'/);
  const appveyoryml = fs.readFileSync(getYml('install-alinode', 'appveyor.yml'), 'utf8');
  t.regex(appveyoryml, /\- npm i npminstall && node_modules\\.bin\\npminstall/);
  t.regex(appveyoryml, /\- nodejs_version: '6'/);
});

test('default on install-node-with-versions and ci.versions', t => {
  const env = Object.assign({}, process.env, {
    CI_ROOT_FOR_TEST: getRoot('install-node-with-versions'),
  });
  execSync(cmd, { env });
  const yml = fs.readFileSync(getYml('install-node-with-versions', '.travis.yml'), 'utf8');
  t.regex(yml, /\- npm i npminstall && npminstall/);
  t.regex(yml, /\- '0\.12'/);
  t.regex(yml, /\- '4'/);
  t.regex(yml, /\- '5'/);
  const appveyoryml = fs.readFileSync(getYml('install-node-with-versions', 'appveyor.yml'), 'utf8');
  t.regex(appveyoryml, /\- npm i npminstall && node_modules\\.bin\\npminstall/);
  t.regex(appveyoryml, /\- nodejs_version: '0\.12'/);
  t.regex(appveyoryml, /\- nodejs_version: '4'/);
  t.regex(appveyoryml, /\- nodejs_version: '5'/);
});

test('support custom ci', t => {
  const env = Object.assign({}, process.env, {
    CI_ROOT_FOR_TEST: getRoot('ci'),
  });
  execSync(cmd, { env });
  const yml = fs.readFileSync(getYml('ci', '.travis.yml'), 'utf8');
  t.regex(yml, /\- npm run ci-travis/);
  const appveyoryml = fs.readFileSync(getYml('ci', 'appveyor.yml'), 'utf8');
  t.regex(appveyoryml, /\- npm run ci-appveyor/);
});

test('no package.json', t => {
  const env = Object.assign({}, process.env, { CI_ROOT_FOR_TEST: getRoot('no-pkg') });
  execSync(cmd, { env });
  t.falsy(fs.existsSync(getYml('no-pkg', '.travis.yml')));
  t.falsy(fs.existsSync(getYml('no-pkg', 'appveyor.yml')));
});

test('error package.json', t => {
  const env = Object.assign({}, process.env, { CI_ROOT_FOR_TEST: getRoot('error-pkg') });
  execSync(cmd, { env });
  t.falsy(fs.existsSync(getYml('error-pkg', '.travis.yml')));
  t.falsy(fs.existsSync(getYml('error-pkg', 'appveyor.yml')));
});

test('generate LICENSE', t => {
  const env = Object.assign({}, process.env, { CI_ROOT_FOR_TEST: getRoot('license') });
  execSync(cmd, { env });
  const file = fs.readFileSync(getRoot('license/LICENSE'), 'utf8');
  t.regex(file, new RegExp('2017-present Alibaba Group Holding Limited and other contributors.'));
});

test('generate LICENSE with object', t => {
  const env = Object.assign({}, process.env, { CI_ROOT_FOR_TEST: getRoot('license-object') });
  execSync(cmd, { env });
  const file = fs.readFileSync(getRoot('license-object/LICENSE'), 'utf8');
  t.regex(file, /2017-present egg-ci/);
});

test('generate LICENSE with year', t => {
  const env = Object.assign({}, process.env, { CI_ROOT_FOR_TEST: getRoot('license-year') });
  execSync(cmd, { env });
  const file = fs.readFileSync(getRoot('license-year/LICENSE'), 'utf8');
  t.regex(file, new RegExp(/2014-present egg-ci/));
});

test('generate service with string', t => {
  const env = Object.assign({}, process.env, { CI_ROOT_FOR_TEST: getRoot('service') });
  execSync(cmd, { env, stdout: [ 0, 1, 2 ] });
  let file = fs.readFileSync(getRoot('service/.travis.yml'), 'utf8');
  t.regex(file, /services/);
  t.regex(file, /- redis-server/);
  t.regex(file, /- mysql/);
  file = fs.readFileSync(getRoot('service/appveyor.yml'), 'utf8');
  t.regex(file, /services/);
  t.regex(file, /- redis-server/);
  t.regex(file, /- mysql/);
  t.regex(file, /redis-server.exe/);
});

test('generate without after_script', t => {
  const env = Object.assign({}, process.env, { CI_ROOT_FOR_TEST: getRoot('disable-after-script') });
  execSync(cmd, { env, stdout: [ 0, 1, 2 ] });
  const file = fs.readFileSync(getRoot('disable-after-script/.travis.yml'), 'utf8');
  t.falsy(/after_script:/.test(file));
});

function getRoot(name) {
  return path.join(__dirname, 'fixtures', name);
}

function getYml(name, yml) {
  return path.join(__dirname, 'fixtures', name, yml);
}
