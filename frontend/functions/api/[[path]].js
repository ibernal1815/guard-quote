export async function onRequest(context) {
  const url = new URL(context.request.url);
  const apiUrl = `https://guardquote-origin.vandine.us${url.pathname}${url.search}`;
  
  const response = await fetch(apiUrl, {
    method: context.request.method,
    headers: context.request.headers,
    body: context.request.method !== 'GET' ? context.request.body : undefined,
  });
  
  return new Response(response.body, {
    status: response.status,
    headers: response.headers,
  });
}
