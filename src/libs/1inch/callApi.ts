import { appConfig } from "@/config";
import { buildQueryURL } from "@/utils/1inch/buildQuery";

export async function call1inchAPI<T>(
  endpointPath: string,
  queryParams: Record<string, string>
): Promise<T> {
  const url = buildQueryURL(endpointPath, queryParams);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${appConfig.oneInch.apiKey}`,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`1inch API returned status ${response.status}: ${body}`);
  }

  return (await response.json()) as T;
}
