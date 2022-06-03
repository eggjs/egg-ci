egg-ci
---------------

[![NPM version][npm-image]][npm-url]
[![Test coverage][codecov-image]][codecov-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-ci.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-ci
[codecov-image]: https://codecov.io/github/eggjs/egg-ci/coverage.svg?branch=master
[codecov-url]: https://codecov.io/github/eggjs/egg-ci?branch=master
[download-image]: https://img.shields.io/npm/dm/egg-ci.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-ci

Auto gen ci config file.

## Installation

```bash
$ npm i egg-ci --save-dev
```

## Usage

Add `ci` property to your `package.json`:

```js
"ci": {
  "os":  "linux, windows, macos",
  "npminstall": false, // use `npminstall` or `npm install`, default is false
  "version": "14, 16, 18", // test LTS node version by default
  // npm ci command
  "command": "ci",
  "services": "redis-server, mysql", // custom service
  "license": false // generate license
}
```

## How

Use `npm postinstall` hook to create the `*.yml` after each `npm install` run.

## License

[MIT](LICENSE)
