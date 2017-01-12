'use strict';

const test = require('ava');
const execSync = require('child_process').execSync;
const fs = require('fs');
const path = require('path');

const filepath = path.join(__dirname, '../install.js');
const cmd = `node ${filepath}`;

test('travis and npminstall = false', t => {
  const env = Object.assign({}, process.env, { CI_ROOT_FOR_TEST: getRoot('travis') });
  execSync(cmd, { env });
  const yml = fs.readFileSync(getYml('travis', '.travis.yml'), 'utf8');
  t.regex(yml, /\- '1'/);
  t.regex(yml, /\- '2'/);
  t.regex(yml, /\- '4'/);
  t.regex(yml, /\- '5'/);
  t.falsy(fs.existsSync(getYml('travis', 'appveyor.yml')));
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
  t.regex(yml, /\- '6'/);
  const appveyoryml = fs.readFileSync(getYml('default', 'appveyor.yml'), 'utf8');
  t.regex(appveyoryml, /\- npm i npminstall && node_modules\\.bin\\npminstall/);
  t.regex(appveyoryml, /\- nodejs_version: '6'/);
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

function getRoot(name) {
  return path.join(__dirname, 'fixtures', name);
}

function getYml(name, yml) {
  return path.join(__dirname, 'fixtures', name, yml);
}
