/**
 * Cloudflare Pages Function for URL redirects
 * This function ensures all traffic is redirected to trangthanhtravel.com (non-www)
 *
 * This file should be placed in: frontend/functions/_middleware.js
 */

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const hostname = url.hostname;

  // Canonical domain (the preferred domain - without www)
  const CANONICAL_DOMAIN = 'trangthanhtravel.com';

  // Redirect www to non-www
  if (hostname === 'www.trangthanhtravel.com') {
    url.hostname = CANONICAL_DOMAIN;
    return Response.redirect(url.toString(), 301);
  }

  // Redirect any other domains to canonical (security measure)
  if (hostname !== CANONICAL_DOMAIN && !hostname.includes('pages.dev')) {
    url.hostname = CANONICAL_DOMAIN;
    return Response.redirect(url.toString(), 301);
  }

  // Continue to next middleware or serve the page
  return context.next();
}

