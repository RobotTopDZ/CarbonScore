import { NextRequest, NextResponse } from 'next/server'

const PDF_SERVICE_URL = process.env.PDF_SERVICE_URL || 'http://localhost:8020'

type ReportPayload = {
  id?: string
  filename?: string
  title?: string
  company_name?: string
  company?: string
  generated_at?: string
  created_at?: string
  template?: string
  type?: string
  total_co2e?: number
  grade?: string
  file_size?: number
  status?: string
}

const FALLBACK_REPORTS: ReportPayload[] = [
  {
    id: 'report_001',
    filename: 'report_001.pdf',
    title: 'Bilan Carbone 2024 - TechCorp',
    company_name: 'TechCorp Solutions',
    generated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    template: 'comprehensive',
    total_co2e: 35420,
    grade: 'B',
    file_size: 2458624,
    status: 'ready'
  },
  {
    id: 'report_002',
    filename: 'report_002.pdf',
    title: 'Rapport Mensuel Mars 2024',
    company_name: 'GreenTech Industries',
    generated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    template: 'executive',
    total_co2e: 28470,
    grade: 'B',
    file_size: 1245632,
    status: 'ready'
  }
]

const buildDownloadUrl = (filename: string) =>
  `/api/reports/file/${encodeURIComponent(filename)}`

const normalizeReport = (report: ReportPayload) => {
  const filename = report.filename || `${report.id || 'rapport'}.pdf`
  const companyName = report.company_name || report.company || 'Entreprise'
  const generatedAt = report.generated_at || report.created_at || new Date().toISOString()

  return {
    id: report.id || filename.replace('.pdf', ''),
    filename,
    title: report.title || `Rapport Empreinte Carbone - ${companyName}`,
    company_name: companyName,
    generated_at: generatedAt,
    template: report.template || report.type || 'comprehensive',
    total_co2e: report.total_co2e ?? 0,
    grade: report.grade || 'N/A',
    file_size: report.file_size ?? 0,
    status: (report.status as 'ready' | 'generating' | 'error') || 'ready',
    download_url: buildDownloadUrl(filename)
  }
}

export async function GET() {
  try {
    const response = await fetch(`${PDF_SERVICE_URL}/api/v1/pdf/reports`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error(`PDF service error: ${response.status}`)
    }

    const payload = await response.json()
    const reports = Array.isArray(payload.reports)
      ? payload.reports.map(normalizeReport)
      : []

    return NextResponse.json({ reports })
  } catch (error) {
    console.error('Error fetching reports:', error)
    return NextResponse.json(
      { reports: FALLBACK_REPORTS.map(normalizeReport) },
      { status: 200 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const response = await fetch(`${PDF_SERVICE_URL}/api/v1/pdf/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      throw new Error(`PDF generation failed: ${response.status}`)
    }

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}
