egg-ci
---------------

[![NPM version][npm-image]][npm-url]
[![Node.js CI](https://github.com/eggjs/egg-ci/actions/workflows/nodejs.yml/badge.svg)](https://github.com/eggjs/egg-ci/actions/workflows/nodejs.yml)
[![Test coverage][codecov-image]][codecov-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-ci.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-ci
[codecov-image]: https://codecov.io/github/eggjs/egg-ci/coverage.svg?branch=master
[codecov-url]: https://codecov.io/github/eggjs/egg-ci?branch=master
[download-image]: https://img.shields.io/npm/dm/egg-ci.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-ci

Auto gen [GitHub Action](https://github.com/features/actions) ci config file.

## Installation

```bash
$ npm i egg-ci --save-dev
```

## Usage

Add `ci` property to your `package.json`:

```js
"ci": {
  "os": "linux, windows, macos",
  "npminstall": false, // use `npminstall` or `npm install`, default is false
  "version": "14, 16, 18", // test LTS node version by default
  // npm ci command
  "command": "ci",
  // custom service, only support on "linux" os, if you enable service, os will set to "linux" only
  "service": {
    "mysql": {
      "version": "8"
    },
    "redis-server": {
      "version": "6"
    }
  },
  "license": false // generate license
}
```

## How

Use `npm postinstall` hook to create the `*.yml` after each `npm install` run.

## License

[MIT](LICENSE)
<!-- GITCONTRIBUTOR_START -->

## Contributors

|[<img src="https://avatars.githubusercontent.com/u/156269?v=4" width="100px;"/><br/><sub><b>fengmk2</b></sub>](https://github.com/fengmk2)<br/>|[<img src="https://avatars.githubusercontent.com/u/227713?v=4" width="100px;"/><br/><sub><b>atian25</b></sub>](https://github.com/atian25)<br/>|[<img src="https://avatars.githubusercontent.com/u/985607?v=4" width="100px;"/><br/><sub><b>dead-horse</b></sub>](https://github.com/dead-horse)<br/>|[<img src="https://avatars.githubusercontent.com/u/360661?v=4" width="100px;"/><br/><sub><b>popomore</b></sub>](https://github.com/popomore)<br/>|[<img src="https://avatars.githubusercontent.com/u/5243774?v=4" width="100px;"/><br/><sub><b>ngot</b></sub>](https://github.com/ngot)<br/>|[<img src="https://avatars.githubusercontent.com/u/958063?v=4" width="100px;"/><br/><sub><b>thonatos</b></sub>](https://github.com/thonatos)<br/>|
| :---: | :---: | :---: | :---: | :---: | :---: |
[<img src="https://avatars.githubusercontent.com/in/9426?v=4" width="100px;"/><br/><sub><b>azure-pipelines[bot]</b></sub>](https://github.com/apps/azure-pipelines)<br/>|[<img src="https://avatars.githubusercontent.com/u/26563778?v=4" width="100px;"/><br/><sub><b>ahungrynoob</b></sub>](https://github.com/ahungrynoob)<br/>|[<img src="https://avatars.githubusercontent.com/u/24246985?v=4" width="100px;"/><br/><sub><b>zhennann</b></sub>](https://github.com/zhennann)<br/>

This project follows the git-contributor [spec](https://github.com/xudafeng/git-contributor), auto updated at `Fri Jun 03 2022 17:58:16 GMT+0800`.

<!-- GITCONTRIBUTOR_END -->
