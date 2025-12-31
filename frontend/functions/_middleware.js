/**
 * Cloudflare Pages Function for URL redirects
 * Redirects www to non-www version
 */

export async function onRequest({ request, next }) {
  const url = new URL(request.url);

  // Redirect www to non-www
  if (url.hostname === 'www.trangthanhtravel.com') {
    url.hostname = 'trangthanhtravel.com';
    return Response.redirect(url.toString(), 301);
  }

  // Continue to the next function or serve the asset
  return next();
}


