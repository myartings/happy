/** @type {import('@expo/fingerprint').Config} */
module.exports = {
  // `extra` is delivered with the JavaScript/OTA payload. It also contains
  // per-build commit provenance, so including it would make identical native
  // projects produce different fingerprints.
  sourceSkips: ['ExpoConfigExtraSection'],
};
