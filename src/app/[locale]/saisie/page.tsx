'use client'
export const dynamic = 'force-dynamic';

import { useState, useRef, type DragEvent, type ChangeEvent } from 'react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import {
  Upload,
  FileText,
  CheckCircle2,
  Loader2,
  ShieldCheck,
} from 'lucide-react'

interface ExtractedData {
  date: string
  supplier: string
  amountHT: number
  tva: number
  amountTTC: number
  accountCode: string
}

export default function SaisiePage() {
  const t = useTranslations('saisie')
  const params = useParams()
  const locale = params.locale as string

  const [dragOver, setDragOver] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [extracted, setExtracted] = useState<ExtractedData | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleDragOver(e: DragEvent) {
    e.preventDefault()
    setDragOver(true)
  }

  function handleDragLeave() {
    setDragOver(false)
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault()
    setDragOver(false)
    simulateOcr()
  }

  function handleClick() {
    fileInputRef.current?.click()
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) simulateOcr()
  }

  function simulateOcr() {
    setAnalyzing(true)
    setSuccess(false)
    setExtracted(null)

    setTimeout(() => {
      setExtracted({
        date: '2024-06-12',
        supplier: 'Fournisseur SARL',
        amountHT: 1250.0,
        tva: 250.0,
        amountTTC: 1500.0,
        accountCode: '606000',
      })
      setAnalyzing(false)
    }, 2000)
  }

  async function handleComptabiliser() {
    if (!extracted) return
    setSubmitting(true)
    try {
      const res = await fetch(`/${locale}/api/entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(extracted),
      })
      if (!res.ok) throw new Error('Failed')
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        setExtracted(null)
      }, 3000)
    } catch {
      // error handled silently
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>

      {success && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20 px-5 py-4 text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="w-6 h-6 shrink-0" />
          <p className="font-medium">{t('success')}</p>
        </div>
      )}

      {!extracted && !analyzing && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          className={`cursor-pointer rounded-xl border-2 border-dashed p-16 text-center transition-colors ${
            dragOver
              ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/10'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }`}
        >
          <Upload className="mx-auto w-10 h-10 text-gray-400 dark:text-gray-500 mb-4" />
          <p className="text-gray-600 dark:text-gray-300 font-medium">
            {t('dropzone')}
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            {t('formats')}
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      )}

      {analyzing && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-16">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
          <p className="text-gray-700 dark:text-gray-300 font-medium">
            {t('analyzing')}
          </p>
        </div>
      )}

      {extracted && !analyzing && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('extractedData')}
              </h2>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              98.7 %
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {t('date')}
              </label>
              <input
                type="date"
                defaultValue={extracted.date}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {t('supplier')}
              </label>
              <input
                defaultValue={extracted.supplier}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {t('amountHT')}
              </label>
              <input
                type="number"
                step="0.01"
                defaultValue={extracted.amountHT}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {t('tva')}
              </label>
              <input
                type="number"
                step="0.01"
                defaultValue={extracted.tva}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {t('amountTTC')}
              </label>
              <input
                type="number"
                step="0.01"
                defaultValue={extracted.amountTTC}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {t('accountCode')}
              </label>
              <input
                defaultValue={extracted.accountCode}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white font-mono"
              />
            </div>
          </div>

          <button
            onClick={handleComptabiliser}
            disabled={submitting}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {t('comptabiliser')}
          </button>
        </div>
      )}
    </div>
  )
}
