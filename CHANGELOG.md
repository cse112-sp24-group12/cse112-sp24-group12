# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0]

### Added
- Added background music to versus mode
- Added sound effects for round/game win/loss and card sliding to versus mode
- Added round end animation to versus mode
- Added game end animation to versus mode
- Added copy-paste game code invite functionality to versus mode
- Added rule book to lobby and legend in versus mode
- Added world events to versus mode
- Added profile pictures to lobby in versus mode
- Added star animation to more pages (versus mode lobby & solo mode results)
- Added JS minification to CI pipeline

### Changed
- Changed styling on settings menu sliders
- Changed profile picture options

### Removed
- Deleted `camera.html` and `cards.html`, as well as the corresponding JS and CSS files
- Removed dependency on Swiper library

### Fixed
- Fixed behavior of full game refresh in versus mode

## [0.2.0]

### Added
- Added settings menu
- Added versus mode
  - Added basic gameplay
  - Added basic animations
-  Added wizard entering/leaving screen animations on Solo mode

### Fixed
- Fixed background star animation performance

### Deprecated
- Removed `camera.html` page and corresponding JS/CSS from the gameplay flow; they will be removed completely from the file structure later

## [Unreleased]

### Added
- Initialized project by pulling in [previous team's repo](https://github.com/CSE110-Team17/cse110-sp23-group17/tree/main)
- Added minimal WebSocket backend
- Added code Climate static monitoring
- Added `global.css` file for implementation of style guide to singular classes

### Changed
- Redid CI pipeline to align with current needs

<!--
Possible headings:
  Added
  Changed
  Deprecated
  Removed
  Fixed
  Security
-->
