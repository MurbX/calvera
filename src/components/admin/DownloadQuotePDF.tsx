'use client'

import { useDocumentInfo } from '@payloadcms/ui'
import { useState } from 'react'

export function DownloadQuotePDF() {
  const { id } = useDocumentInfo()
  const [loading, setLoading] = useState(false)

  if (!id) {
    return (
      <div style={{ marginBottom: 16 }}>
        <button
          type="button"
          disabled
          style={{
            padding: '10px 20px',
            backgroundColor: '#e5e7eb',
            color: '#9ca3af',
            border: 'none',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'not-allowed',
            width: '100%',
          }}
        >
          Save first to download PDF
        </button>
      </div>
    )
  }

  const handleDownload = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/manual-quotes/${id}/pdf`)
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `HTTP ${res.status}`)
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download =
        res.headers.get('Content-Disposition')?.match(/filename="(.+)"/)?.[1] ??
        `calvera-quotation.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('[DownloadQuotePDF]', err)
      alert(`PDF download failed: ${(err as Error).message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <button
        type="button"
        onClick={handleDownload}
        disabled={loading}
        style={{
          padding: '10px 20px',
          backgroundColor: '#063f27',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 600,
          cursor: loading ? 'wait' : 'pointer',
          opacity: loading ? 0.7 : 1,
          width: '100%',
        }}
      >
        {loading ? 'Generating PDF…' : 'Download PDF Quotation'}
      </button>
    </div>
  )
}
