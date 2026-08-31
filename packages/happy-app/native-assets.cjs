'use strict';

// Keep every Expo-configured native image in this single manifest. Both
// app.config.js and the worktree build planner consume it, so adding an icon or
// splash asset cannot silently bypass native-sensitive path classification.
module.exports = Object.freeze({
  icon: './sources/assets/images/icon.png',
  androidAdaptiveForeground: './sources/assets/images/icon-adaptive.png',
  androidAdaptiveMonochrome: './sources/assets/images/icon-monochrome.png',
  notificationIcon: './sources/assets/images/icon-notification.png',
  androidSplashLight: './sources/assets/images/splash-android-light.png',
  androidSplashDark: './sources/assets/images/splash-android-dark.png',
});
