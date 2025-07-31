import { appConfig } from "@/config";

export function buildQueryURL(
  path: string,
  params: Record<string, string>
): string {
  const url = new URL(appConfig.oneInch.baseUrl + path);
  url.search = new URLSearchParams(params).toString();
  return url.toString();
}
