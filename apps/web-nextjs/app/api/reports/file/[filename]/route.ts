import { NextRequest, NextResponse } from 'next/server'

const PDF_SERVICE_URL = process.env.PDF_SERVICE_URL || 'http://localhost:8020'

export async function GET(
  _request: NextRequest,
  { params }: { params: { filename: string } }
) {
  const { filename } = params

  if (!filename) {
    return NextResponse.json({ error: 'Filename is required' }, { status: 400 })
  }

  try {
    const response = await fetch(
      `${PDF_SERVICE_URL}/api/v1/pdf/${encodeURIComponent(filename)}`,
      { cache: 'no-store' }
    )

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch report' },
        { status: response.status }
      )
    }

    const buffer = await response.arrayBuffer()
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store'
      }
    })
  } catch (error) {
    console.error('Error proxying report download:', error)
    return NextResponse.json(
      { error: 'Unable to download report' },
      { status: 500 }
    )
  }
}

