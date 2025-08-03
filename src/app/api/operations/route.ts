import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const userIdRaw = searchParams.get('userIdRaw');

    if (!userIdRaw) {
        return NextResponse.json(
            { error: 'userIdRaw parameter is required' },
            { status: 400 }
        );
    }

    try {
        const url = `https://dev.maikyman.xyz/api/operations?userIdRaw=${encodeURIComponent(userIdRaw)}`;

        console.log('Operations API request:', url);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
            },
        });

        if (!response.ok) {
            const body = await response.text();
            return NextResponse.json(
                {
                    error: `Operations API returned status ${response.status}: ${body}`,
                },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Operations proxy error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
