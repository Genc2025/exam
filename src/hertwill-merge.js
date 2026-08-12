(() => {
  const nativeFetch = globalThis.fetch.bind(globalThis);

  const isPrimaryCatalogRequest = (input) => {
    try {
      const raw = typeof input === 'string' ? input : input?.url;
      if (!raw) return false;
      const url = new URL(raw, globalThis.location?.href || 'https://local.invalid/');
      return /\/data\/products\.json$/i.test(url.pathname);
    } catch {
      return false;
    }
  };

  globalThis.fetch = async function virelloMultiSourceFetch(input, init) {
    const response = await nativeFetch(input, init);
    if (!isPrimaryCatalogRequest(input) || !response.ok) return response;

    try {
      const primary = await response.clone().json();
      const hertwillResponse = await nativeFetch(`./data/hertwill-products.json?v=${Date.now()}`, {
        cache: 'no-store'
      });
      if (!hertwillResponse.ok) return response;

      const hertwill = await hertwillResponse.json();
      const cjProducts = Array.isArray(primary?.products) ? primary.products : [];
      const hertwillProducts = Array.isArray(hertwill?.products) ? hertwill.products : [];

      const seen = new Set();
      const mergedProducts = [...hertwillProducts, ...cjProducts].filter((product) => {
        const key = String(product?.id ?? product?.sku ?? '');
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      const merged = {
        ...primary,
        source: primary?.source || 'cj',
        mode: primary?.mode || 'live-api',
        catalogSources: ['hertwill', ...(primary?.source ? [primary.source] : ['cj'])]
          .filter((value, index, array) => value && array.indexOf(value) === index),
        sourceCounts: {
          hertwill: hertwillProducts.length,
          cj: cjProducts.length
        },
        hertwillGeneratedAt: hertwill?.generatedAt || null,
        products: mergedProducts
      };

      const headers = new Headers(response.headers);
      headers.set('content-type', 'application/json; charset=utf-8');
      headers.set('cache-control', 'no-store');

      return new Response(JSON.stringify(merged), {
        status: response.status,
        statusText: response.statusText,
        headers
      });
    } catch (error) {
      console.warn('Hertwill catalog merge skipped:', error);
      return response;
    }
  };
})();
