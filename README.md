<p align="center"><img width="250" height="250" src="./assets/icon.png" alt="Felida icon"></p>
<h1 align="center">Felida Browser</h1>
<p align="center">
  <a href="https://opensource.org/licenses/"><img alt="GPLv3 License" src="https://img.shields.io/badge/License-GPL%20v3-yellow.svg"></a>
  <a href="#badges"><img alt="Downloads" src="https://img.shields.io/github/downloads/raluvy95/FelidaBrowser/total.svg?style=flat"></a>
  <a href="https://github.com/raluvy95/FelidaBrowser/issues"><img alt="Issues" src="https://img.shields.io/github/issues-raw/raluvy95/FelidaBrowser.svg"></a>
  <a href="https://github.com/raluvy95/FelidaBrowser"><img alt="Fork" src="https://img.shields.io/github/forks/raluvy95/FelidaBrowser.svg?style=social&label=Fork"></a>
  <a href="https://github.com/cliqz-oss/adblocker"><img alt="powered by Cliqz" src="https://img.shields.io/badge/cliqz-powered-blue?logo=cliqz"></a>
</p><br>
<img src="./assets/screenshot.png" alt="Felida icon">

# Features

  - #### Multiple tabs support
  - #### Featured AdBlock build-in (using `@cliqz/adblocker-electron` which contains EasyList and uBlock Origin project!)

# TODO
  - Browsing history (small bug currently)
  - Chrome extensions
  - Black theme on all websites
  - Bookmarks
  - Fully customizable
    - For example: Custom Background, CSS, Menu bar and much more.

# Building & installing
There's no new precompiled build yet, so the only option is to build it yourself.<br><br>

You need to clone this repository, then go to the folder, open in terminal and use `npm i --save`. Finally, run `./run.bat` if you're using Windows, otherwise `run.sh`.

# System Requirements

The browser's system requirements is same as Electron.js, so here's a [full system requirements](https://stackoverflow.com/questions/36306450/what-is-minimum-system-requirements-to-run-electron-apps)<br>
All operating systems requires to have 64 bit. Other arhitectures are supported, but not in the releases so you need to compile from source instead.

| Windows | MacOS | Linux |
| --- | --- | --- |
| 7 and later | Not yet released<br>You need to compile from source code instead. | Ubuntu 16.04<br>Fedora 21<br>Debian 8 |

# Known issues
## Some buttons in "More" context menu doesn't work!
Still working in progress.

## (node:17625) electron: Failed to load URL: ... ERR_BLOCKED_BY_CLIENT
It's not an issue because the adblock plugin is doing its job to block tracking/ad urls. Disable it in Settings if you want to ditch.

# Notes

This browser is in BETA. If you found a bug in the browser feel free to fill a new issue! 

