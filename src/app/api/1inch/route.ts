import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get("endpoint");
  const queryParams = Object.fromEntries(searchParams.entries());

  // Remove the endpoint from query params since we'll use it separately
  delete queryParams.endpoint;

  if (!endpoint) {
    return NextResponse.json(
      { error: "Endpoint parameter is required" },
      { status: 400 }
    );
  }

  try {
    const apiKey =
      process.env.NEXT_PUBLIC_ONE_INCH_API_KEY || process.env.ONE_INCH_API_KEY;

    // Base URL for 1inch API - can handle different endpoints
    const baseUrl = "https://api.1inch.dev";

    const url = new URL(`${baseUrl}${endpoint}`);
    Object.entries(queryParams).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    console.log("1inch API request:", url.toString());

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      const body = await response.text();
      return NextResponse.json(
        { error: `1inch API returned status ${response.status}: ${body}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
