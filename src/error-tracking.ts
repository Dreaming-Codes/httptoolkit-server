import * as Sentry from '@sentry/node';
import { IS_PROD_BUILD } from './util';

let sentryInitialized = false;

export function initErrorTracking() {
    const packageJson = require('../package.json');

    let { SENTRY_DSN } = process.env;
    if (!SENTRY_DSN && IS_PROD_BUILD) {
        // If we're a built binary, use the standard DSN automatically
        SENTRY_DSN = 'https://5838a5520ad44602ae46793727e49ef5@sentry.io/1371158';
    }

    if (SENTRY_DSN) {
        Sentry.init({
            dsn: SENTRY_DSN,
            release: packageJson.version,
            beforeBreadcrumb(breadcrumb, hint) {
                if (breadcrumb.category === 'http') {
                    // Almost all HTTP requests sent by the server are actually forwarded HTTP from
                    // the proxy, so could be very sensitive. We need to ensure errors don't leak data.

                    // Remove all but the host from the breadcrumb data. The host is fairly safe & often
                    // useful for context, but the path & query could easily contain sensitive secrets.
                    if (breadcrumb.data && breadcrumb.data.url) {
                        const url = breadcrumb.data.url as string;
                        const hostIndex = url.indexOf('://') + 3;
                        const pathIndex = url.indexOf('/', hostIndex);
                        if (pathIndex !== -1) {
                            breadcrumb.data.url = url.slice(0, pathIndex);
                        }
                    }

                    if (hint) {
                        // Make sure we don't collect the full HTTP data in hints either.
                        delete hint.request;
                        delete hint.response;
                    }
                }
                return breadcrumb;
            }
        });

        Sentry.configureScope((scope) => {
            scope.setTag('platform', process.platform);
        });

        sentryInitialized = true;
    }
}

export function reportError(error: Error | string) {
    console.warn(error);
    if (!sentryInitialized) return;

    if (typeof error === 'string') {
        Sentry.captureMessage(error);
    } else {
        Sentry.captureException(error);
    }
}