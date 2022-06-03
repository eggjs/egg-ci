'use strict';

const test = require('test');
const assert = require('assert');
const execSync = require('child_process').execSync;
const fs = require('fs');
const path = require('path');

const filepath = path.join(__dirname, '../install.js');
const cmd = `node ${filepath}`;

function clean() {
  const root = path.join(__dirname, 'fixtures');
  fs.readdirSync(root).forEach(name => {
    [ '.github', 'LICENSE' ].forEach(file => {
      fs.rmSync(path.join(root, name, file), { force: true, recursive: true });
    });
  });
}

test('default', () => {
  clean();

  const env = Object.assign({}, process.env, { CI_ROOT_FOR_TEST: getRoot('default') });
  execSync(cmd, { env });
  const yml = getYmlContent('default');
  assert.match(yml, /run: npm i/);
  assert.match(yml, /os: \[ubuntu-latest, windows-latest, macos-latest]/);
  assert.match(yml, /run: npm run ci/);
  assert(fs.existsSync(getYml('default', 'LICENSE')) === false);
});

test('npminstall = true', () => {
  clean();

  const env = Object.assign({}, process.env, { CI_ROOT_FOR_TEST: getRoot('npminstall-true') });
  execSync(cmd, { env });
  const yml = getYmlContent('npminstall-true');
  assert.match(yml, /run: npm i -g npminstall && npminstall/);
});

test('versions in array', () => {
  clean();

  const env = Object.assign({}, process.env, { CI_ROOT_FOR_TEST: getRoot('array') });
  execSync(cmd, { env });
  const yml = getYmlContent('array');
  assert.match(yml, /node-version: \[1, 2, 4, 5]/);
});

test('support custom ci', () => {
  clean();

  const env = Object.assign({}, process.env, {
    CI_ROOT_FOR_TEST: getRoot('ci'),
  });
  execSync(cmd, { env });
  const yml = getYmlContent('ci');
  assert.match(yml, /run: npm run ci-github/);
});

test('support custom os: linux', () => {
  clean();

  const env = Object.assign({}, process.env, {
    CI_ROOT_FOR_TEST: getRoot('os-linux'),
  });
  execSync(cmd, { env });
  const yml = getYmlContent('os-linux');
  assert.match(yml, /os: \[ubuntu-latest]/);
});

test('support custom os: ubuntu', () => {
  clean();

  const env = Object.assign({}, process.env, {
    CI_ROOT_FOR_TEST: getRoot('os-ubuntu'),
  });
  execSync(cmd, { env });
  const yml = getYmlContent('os-ubuntu');
  assert.match(yml, /os: \[ubuntu-latest, windows-latest]/);
});

test('no package.json', () => {
  clean();

  const env = Object.assign({}, process.env, { CI_ROOT_FOR_TEST: getRoot('no-pkg') });
  execSync(cmd, { env });
  assert(!fs.existsSync(getYml('no-pkg', '.github')));
});

test('error package.json', () => {
  clean();

  const env = Object.assign({}, process.env, { CI_ROOT_FOR_TEST: getRoot('error-pkg') });
  execSync(cmd, { env });
  assert(!fs.existsSync(getYml('error-pkg', '.github')));
});

test('generate LICENSE', () => {
  clean();

  const env = Object.assign({}, process.env, { CI_ROOT_FOR_TEST: getRoot('license') });
  execSync(cmd, { env });
  const file = fs.readFileSync(getRoot('license/LICENSE'), 'utf8');
  assert.match(file, new RegExp('2017-present Alibaba Group Holding Limited and other contributors.'));
});

test('generate LICENSE with object', () => {
  clean();

  const env = Object.assign({}, process.env, { CI_ROOT_FOR_TEST: getRoot('license-object') });
  execSync(cmd, { env });
  const file = fs.readFileSync(getRoot('license-object/LICENSE'), 'utf8');
  assert.match(file, /2017-present egg-ci/);
});

test('generate LICENSE with year', () => {
  clean();

  const env = Object.assign({}, process.env, { CI_ROOT_FOR_TEST: getRoot('license-year') });
  execSync(cmd, { env });
  const file = fs.readFileSync(getRoot('license-year/LICENSE'), 'utf8');
  assert.match(file, new RegExp(/2014-present egg-ci/));
});

function getRoot(name) {
  return path.join(__dirname, 'fixtures', name);
}

function getYml(name, yml) {
  return path.join(__dirname, 'fixtures', name, yml);
}

function getYmlContent(name) {
  return fs.readFileSync(path.join(__dirname, 'fixtures', name, '.github/workflows/nodejs.yml'), 'utf8');
}
