import * as path from 'path';

export const IS_PROD_BUILD = !!process.env.HTTPTOOLKIT_SERVER_BINPATH;

// Notably, for this file, this is the same when either bundled or unbundled.
// That's not true for most other files! Everything should use this instead of __dirname:
export const APP_ROOT = path.join(__dirname, '..');

export const ALLOWED_ORIGINS =  [
    /.*/
];

export const MOCKTTP_ALLOWED_ORIGINS = [
    ...ALLOWED_ORIGINS,
    // The Chromium webextension is allowed to make requests from the
    // browser directly into the Mockttp admin API (but not into our API server).
    'chrome-extension://oeehdgfohghfelggpifolochpnkdmpog'
];

// The range of ports that should be used by invisible ephemeral services, such as Firefox's
// certificate check server and Chrome's "hide warning" server. These ports are extra likely
// not to conflict with normal user usage, and are specifically designated by the IANA for
// use for dynamic ports.
export const EPHEMERAL_PORT_RANGE = { startPort: 49152, endPort: 65535 } as const;

export const SERVER_VERSION = require('../package.json').version as string;