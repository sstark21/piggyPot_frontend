import { NextRequest, NextResponse } from 'next/server';

// export async function GET(request: NextRequest) {
//     console.log('Operations API route called');
//     return NextResponse.json({ message: 'Test' });
// }
export async function GET(request: NextRequest) {
    console.log('Operations API route called');
    const { searchParams } = new URL(request.url);
    const userIdRaw = searchParams.get('userIdRaw');
    console.log('userIdRaw:', userIdRaw);

    if (!userIdRaw) {
        return NextResponse.json(
            { error: 'userIdRaw is required' },
            { status: 400 }
        );
    }

    try {
        const externalUrl = `https://dev.maikyman.xyz/operations?userIdRaw=${userIdRaw}`;
        console.log('Fetching from:', externalUrl);

        const response = await fetch(externalUrl);
        console.log('External response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('External API error:', errorText);
            return NextResponse.json(
                { error: `External API error: ${response.status}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        console.log('External API response:', data);
        return NextResponse.json(data);
    } catch (error) {
        console.error('Operations API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch operations' },
            { status: 500 }
        );
    }
}