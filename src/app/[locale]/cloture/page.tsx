'use client'

import { useEffect, useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { CheckCircle2, Download, Loader2 } from 'lucide-react'

interface JournalEntry {
  id: string
  date: string
  label: string
  accountCode: string
  debit: number
  credit: number
}

export default function CloturePage() {
  const t = useTranslations('cloture')
  const params = useParams()
  const locale = params.locale as string

  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [matching, setMatching] = useState(false)
  const [matchRef, setMatchRef] = useState<string | null>(null)

  const fetchEntries = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/${locale}/api/entries?unmatched=true`)
      if (!res.ok) throw new Error('Erreur de chargement')
      const data = await res.json()
      setEntries(data.entries ?? [])
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [locale])

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function getSelectedEntries() {
    return entries.filter((e) => selected.has(e.id))
  }

  function totalDebit() {
    return getSelectedEntries().reduce((s, e) => s + e.debit, 0)
  }

  function totalCredit() {
    return getSelectedEntries().reduce((s, e) => s + e.credit, 0)
  }

  function isValidSelection() {
    if (selected.size === 0) return false
    return Math.abs(totalDebit() - totalCredit()) < 0.01
  }

  async function handleMatch() {
    if (!isValidSelection()) return
    setMatching(true)
    try {
      const res = await fetch(`/${locale}/api/entries/match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selected) }),
      })
      if (!res.ok) throw new Error('Échec du lettrage')
      const data = await res.json()
      setMatchRef(data.reference)
      setSelected(new Set())
      setTimeout(() => setMatchRef(null), 5000)
      fetchEntries()
    } catch {
      // silent
    } finally {
      setMatching(false)
    }
  }

  async function handleExportFec() {
    try {
      const res = await fetch(`/${locale}/api/fec/export?year=2024`)
      if (!res.ok) throw new Error('Export failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'FEC-2024.txt'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      // silent
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-red-600">
        <p>Erreur : {error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('title')}
        </h1>
        <button
          onClick={handleExportFec}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          {t('exportFec')}
        </button>
      </div>

      {matchRef && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20 px-5 py-4 text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="w-6 h-6 shrink-0" />
          <p className="font-medium">
            {t('matchedSuccess', { ref: matchRef })}
          </p>
        </div>
      )}

      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-20">
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4" />
          <p className="text-xl font-semibold text-gray-900 dark:text-white">
            {t('allMatched')}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">
                  <th className="p-4 w-10">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 dark:border-gray-600"
                      checked={selected.size > 0 && selected.size === entries.length}
                      onChange={() => {
                        if (selected.size === entries.length) setSelected(new Set())
                        else setSelected(new Set(entries.map((e) => e.id)))
                      }}
                    />
                  </th>
                  <th className="p-4 font-medium">{t('date')}</th>
                  <th className="p-4 font-medium">{t('label')}</th>
                  <th className="p-4 font-medium">{t('account')}</th>
                  <th className="p-4 font-medium text-right">{t('debit')}</th>
                  <th className="p-4 font-medium text-right">{t('credit')}</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr
                    key={entry.id}
                    className={`border-b border-gray-100 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 ${
                      selected.has(entry.id)
                        ? 'bg-blue-50 dark:bg-blue-900/10'
                        : ''
                    }`}
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selected.has(entry.id)}
                        onChange={() => toggle(entry.id)}
                        className="rounded border-gray-300 dark:border-gray-600"
                      />
                    </td>
                    <td className="p-4">{entry.date}</td>
                    <td className="p-4">{entry.label}</td>
                    <td className="p-4 font-mono text-xs">{entry.accountCode}</td>
                    <td className="p-4 text-right font-mono">
                      {entry.debit > 0 ? `${entry.debit.toFixed(2)}` : '-'}
                    </td>
                    <td className="p-4 text-right font-mono">
                      {entry.credit > 0 ? `${entry.credit.toFixed(2)}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selected.size > 0 && (
            <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 px-4 py-3 bg-gray-50 dark:bg-gray-800/50">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {t('selected', { count: selected.size })} |{' '}
                {t('totalDebit')}:{' '}
                <span className="font-mono font-medium text-gray-700 dark:text-gray-300">
                  {totalDebit().toFixed(2)} €
                </span>{' '}
                | {t('totalCredit')}:{' '}
                <span className="font-mono font-medium text-gray-700 dark:text-gray-300">
                  {totalCredit().toFixed(2)} €
                </span>
                {!isValidSelection() && (
                  <span className="ml-2 text-rose-500 text-xs">
                    {t('balanceError')}
                  </span>
                )}
              </div>
              <button
                onClick={handleMatch}
                disabled={!isValidSelection() || matching}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {matching && <Loader2 className="w-4 h-4 animate-spin" />}
                {t('matchSelection')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
