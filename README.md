<p align="center"><img width="250" height="250" src="./assets/icon.png" alt="Felida icon"></p><br><br>
<h1 style="text-align: center;">Felida Browser</h1>
A lightweight Chromium Browser using Electron.js!<br>
<img src="./assets/screenshot.png" alt="Felida icon">
# Features
  - #### Multiple tabs support

# TODO
  - Browsing history (small bug currently)
  - Settings subpage
  - Chrome extensions
  - Add uBlock Origin (including settings for it)
  - Black theme on all websites
  - Bookmarks
  - Fully customizable
    - For example: Custom Background, CSS, Menu bar and much more.

# Building & installing
There's no new precompiled build yet, so the only option is to build it yourself.<br><br>

You need to clone this repository, then go to the folder, open in terminal and use `npm i --save`. Finally, run `run.bat` if you're using Windows, otherwise `run.bat`.
# System Requirements
The browser's system requirements is same as Electron.js, so here's a [full system requirements](https://stackoverflow.com/questions/36306450/what-is-minimum-system-requirements-to-run-electron-apps)<br>
All operating systems requires to have 64 bit. Other arhitectures are supported, but not in the releases so you need to compile from source instead.
| Windows | MacOS | Linux |
| --- | --- | --- |
| 7 and later | Not yet released<br>You need to run from source code instead. | Ubuntu 16.04<br>Fedora 21<br>Debian 8 |

# Notes
This browser is in BETA. If you found a bug in the browser feel free to fill a new issue! 

# Notes for developers - ignore
history.json<br>
unixtime1\r\n<br>
title1\r\n<br>
url1\r\n<br>
unixtime2\r\n<br>
title2\r\n<br>
url2\r\n<br>
etc.<br>
