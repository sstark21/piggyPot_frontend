export async function call1inchAPI<T>(
  endpointPath: string,
  queryParams: Record<string, string>
): Promise<T> {
  // Use the Next.js API proxy instead of calling 1inch directly
  const proxyUrl = new URL("/api/1inch", window.location.origin);
  proxyUrl.searchParams.set("endpoint", endpointPath);

  // Add all query parameters to the proxy URL
  Object.entries(queryParams).forEach(([key, value]) => {
    proxyUrl.searchParams.set(key, value);
  });

  const response = await fetch(proxyUrl.toString(), {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  console.log("response in 1inch allowance:", response);

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`1inch API returned status ${response.status}: ${body}`);
  }

  return (await response.json()) as T;
}
