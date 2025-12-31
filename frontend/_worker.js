/**
 * Cloudflare Worker for URL redirects and asset serving
 * This worker ensures all traffic is redirected to www.trangthanhtravel.com
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const hostname = url.hostname;

    // Canonical domain (the preferred domain)
    const CANONICAL_DOMAIN = 'www.trangthanhtravel.com';

    // Redirect non-www to www
    if (hostname === 'trangthanhtravel.com') {
      url.hostname = CANONICAL_DOMAIN;
      return Response.redirect(url.toString(), 301);
    }

    // Redirect any other domains to canonical (security measure)
    if (hostname !== CANONICAL_DOMAIN && !hostname.includes('workers.dev')) {
      url.hostname = CANONICAL_DOMAIN;
      return Response.redirect(url.toString(), 301);
    }

    // Serve the static assets for the canonical domain
    return env.ASSETS.fetch(request);
  },
};

