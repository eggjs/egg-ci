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
  service: {},
  ...pkg.ci,
};

config.versions = arrayify(config.version);

let mysqlServer = '';
if (config.service.mysql) {
  // service only support on linux
  config.os = 'linux';
  const mysql = {
    version: '8',
    db: 'unittest',
    ...config.service.mysql,
  };
  mysqlServer = `
    services:
      mysql:
        image: mysql:${mysql.version}
        env:
          MYSQL_ALLOW_EMPTY_PASSWORD: true
          MYSQL_DATABASE: ${mysql.db}
        ports:
          - 3306:3306
        options: --health-cmd="mysqladmin ping" --health-interval=10s --health-timeout=5s --health-retries=5
`;
}

let redisServer = '';
if (config.service['redis-server']) {
  // service only support on linux
  config.os = 'linux';
  const redis = {
    version: '6',
    ...config.service['redis-server'],
  };
  redisServer = `
    # https://github.com/marketplace/actions/redis-server-in-github-actions#usage
    - name: Start Redis
      uses: supercharge/redis-github-action@1.4.0
      with:
        redis-version: ${redis.version}
`;
}

const os = arrayify(config.os).map(name => {
  if (name === 'linux') name = 'ubuntu';
  return `${name}-latest`;
});

const ymlContent = getTpl('github.yml')
  .replace('{{github_node_version}}', config.versions.join(', '))
  .replace('{{github_os}}', os.join(', '))
  .replace('{{github_command_ci}}', config.command)
  .replace('{{github_npm_install}}', config.npminstall ? 'npm i -g npminstall && npminstall' : 'npm i')
  .replace('{{mysql}}', mysqlServer)
  .replace('{{redis-server}}', redisServer);
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
