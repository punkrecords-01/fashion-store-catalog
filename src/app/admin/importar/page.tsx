'use client'

import { useState, useRef } from 'react'
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, ArrowLeft, FileText } from 'lucide-react'
import Link from 'next/link'

interface ImportResult {
  message: string
  totalRows: number
  created: number
  errors: number
  items: Array<{ row: number; name?: string; error?: string }>
}

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [manualText, setManualText] = useState('')
  const [manualMode, setManualMode] = useState(false)
  const [parseResult, setParseResult] = useState<Record<string, unknown> | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async () => {
    if (!file) return

    setUploading(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/import', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Erro ao importar')
      } else {
        setResult(data)
      }
    } catch (err) {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setUploading(false)
    }
  }

  const handleManualParse = async () => {
    if (!manualText.trim()) return

    try {
      const res = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: manualText }),
      })

      const data = await res.json()
      setParseResult(data)
    } catch {
      setError('Erro ao parsear texto')
    }
  }

  const handleManualSubmit = async () => {
    if (!manualText.trim()) return

    setUploading(true)
    try {
      const res = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: manualText }),
      })

      const parseData = await res.json()

      // Criar pending item via Supabase diretamente
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      const { error: insertError } = await supabase
        .from('pending_items')
        .insert({
          raw_text: manualText,
          ...parseData,
          source: 'manual',
          status: 'pending',
        })

      if (insertError) {
        setError(insertError.message)
      } else {
        setManualText('')
        setParseResult(null)
        setResult({
          message: 'Item adicionado à fila de aprovação!',
          totalRows: 1,
          created: 1,
          errors: 0,
          items: [{ row: 1, name: parseData.parsed_name || 'Item manual' }],
        })
      }
    } catch {
      setError('Erro ao enviar')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link href="/admin" className="inline-flex items-center gap-2 text-brand-500 hover:text-brand-700 mb-4 text-sm">
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Dashboard
        </Link>
        <h1 className="text-2xl font-display font-semibold">Importar Produtos</h1>
        <p className="text-brand-500 text-sm mt-1">
          Importe via CSV/Excel ou digite manualmente
        </p>
      </div>

      {/* Mode Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setManualMode(false)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            !manualMode ? 'bg-brand-900 text-white' : 'bg-brand-100 text-brand-600 hover:bg-brand-200'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          Arquivo CSV / Excel
        </button>
        <button
          onClick={() => setManualMode(true)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            manualMode ? 'bg-brand-900 text-white' : 'bg-brand-100 text-brand-600 hover:bg-brand-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          Texto Livre
        </button>
      </div>

      {/* File Upload Mode */}
      {!manualMode && (
        <div className="bg-white rounded-2xl border border-brand-100 p-6">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-brand-200 rounded-xl p-8 text-center cursor-pointer hover:border-brand-400 transition-colors"
          >
            <Upload className="w-12 h-12 mx-auto text-brand-300 mb-4" />
            <p className="text-brand-700 font-medium mb-1">
              {file ? file.name : 'Clique para selecionar um arquivo'}
            </p>
            <p className="text-brand-400 text-sm">
              CSV, XLS ou XLSX • Até 10MB
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xls,.xlsx"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>

          {file && (
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-brand-900">{file.name}</p>
                  <p className="text-xs text-brand-400">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <button
                onClick={handleFileUpload}
                disabled={uploading}
                className="px-6 py-2 bg-brand-900 text-white rounded-xl text-sm font-medium hover:bg-brand-800 disabled:opacity-50 transition-colors"
              >
                {uploading ? 'Importando...' : 'Importar'}
              </button>
            </div>
          )}

          {/* Instruções */}
          <div className="mt-6 p-4 bg-brand-50 rounded-xl">
            <h3 className="text-sm font-medium text-brand-900 mb-2">Colunas aceitas:</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-brand-600">
              {['Nome / Produto', 'Referência / SKU', 'Categoria / Tipo', 'Cor / Cores', 'Tamanho / Tam', 'Preço / Valor', 'Marca', 'Material / Tecido', 'Descrição / Obs'].map((col) => (
                <span key={col} className="bg-white px-2 py-1 rounded border border-brand-100">
                  {col}
                </span>
              ))}
            </div>
            <p className="text-xs text-brand-400 mt-2">
              O sistema detecta automaticamente as colunas. Exportar diretamente do seu sistema de estoque!
            </p>
          </div>
        </div>
      )}

      {/* Manual Text Mode */}
      {manualMode && (
        <div className="bg-white rounded-2xl border border-brand-100 p-6">
          <label className="block text-sm font-medium text-brand-900 mb-2">
            Cole o texto do produto (como viria pelo WhatsApp):
          </label>
          <textarea
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            placeholder="Ex: Vestido midi floral, algodão, rosa e verde, P M G, Farm, ref VM001, R$ 189,90"
            rows={4}
            className="w-full px-4 py-3 border border-brand-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 resize-none"
          />

          <div className="flex gap-3 mt-4">
            <button
              onClick={handleManualParse}
              className="px-4 py-2 bg-brand-100 text-brand-700 rounded-xl text-sm font-medium hover:bg-brand-200 transition-colors"
            >
              Preview Parser
            </button>
            <button
              onClick={handleManualSubmit}
              disabled={uploading || !manualText.trim()}
              className="px-6 py-2 bg-brand-900 text-white rounded-xl text-sm font-medium hover:bg-brand-800 disabled:opacity-50 transition-colors"
            >
              {uploading ? 'Enviando...' : 'Enviar para Aprovação'}
            </button>
          </div>

          {/* Parse Preview */}
          {parseResult && (
            <div className="mt-4 p-4 bg-brand-50 rounded-xl">
              <h3 className="text-sm font-medium text-brand-900 mb-3">Resultado do Parser:</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(parseResult).map(([key, value]) => {
                  if (key === 'warnings' && Array.isArray(value) && value.length === 0) return null
                  if (value === undefined || value === null || value === '') return null
                  if (Array.isArray(value) && value.length === 0) return null

                  return (
                    <div key={key} className="flex flex-col">
                      <span className="text-xs text-brand-400">{key.replace('parsed_', '')}</span>
                      <span className="text-brand-900 font-medium">
                        {Array.isArray(value) ? value.join(', ') : String(value)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="mt-4 bg-white rounded-2xl border border-brand-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <div>
              <p className="font-medium text-brand-900">{result.message}</p>
              <p className="text-sm text-brand-500">
                {result.created} de {result.totalRows} itens importados
              </p>
            </div>
          </div>

          {result.items.length > 0 && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {result.items.map((item, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${
                    item.error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                  }`}
                >
                  {item.error ? (
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  )}
                  <span>Linha {item.row}: {item.name || item.error}</span>
                </div>
              ))}
            </div>
          )}

          <Link
            href="/admin/pendentes"
            className="mt-4 inline-flex items-center gap-2 px-6 py-2 bg-brand-900 text-white rounded-xl text-sm font-medium hover:bg-brand-800 transition-colors"
          >
            Ver Fila de Aprovação →
          </Link>
        </div>
      )}
    </div>
  )
}
