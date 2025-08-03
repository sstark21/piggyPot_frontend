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
        const url = `https://dev.maikyman.xyz/api/users/get?userIdRaw=${encodeURIComponent(userIdRaw)}`;

        console.log('User check API request:', url);

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
                    error: `User API returned status ${response.status}: ${body}`,
                },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('User check proxy error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userIdRaw, delegatedWalletHash } = body;

        if (!userIdRaw) {
            return NextResponse.json(
                { error: 'userIdRaw is required' },
                { status: 400 }
            );
        }

        const url = 'https://dev.maikyman.xyz/api/users/create';

        console.log('User create API request:', {
            url,
            body: { userIdRaw, delegatedWalletHash },
        });

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userIdRaw,
                delegatedWalletHash: delegatedWalletHash || '-',
            }),
        });

        if (!response.ok) {
            const errorData = await response.text();
            return NextResponse.json(
                {
                    error: `User API returned status ${response.status}: ${errorData}`,
                },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('User create proxy error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
