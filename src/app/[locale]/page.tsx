'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import {
  Banknote,
  Receipt,
  Clock,
  Users,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler)

interface JournalEntry {
  id: string
  date: string
  label: string
  accountCode: string
  debit: number
  credit: number
  matched?: boolean
  matchRef?: string
}

interface KpiData {
  netCash: number
  vatPayable: number
  pendingEntries: number
  activeClients: number
}

function Skeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        ))}
      </div>
      <div className="h-72 bg-gray-200 dark:bg-gray-700 rounded-xl" />
      <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl" />
    </div>
  )
}

export default function DashboardPage() {
  const t = useTranslations('dashboard')
  const params = useParams()
  const locale = params.locale as string

  const [kpi, setKpi] = useState<KpiData | null>(null)
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/${locale}/api/entries?limit=5&unmatched=true`)
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        setEntries(data.entries ?? [])
        setKpi(data.kpi ?? null)
      } catch (e) {
        setError((e as Error).message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [locale])

  if (loading) return <Skeleton />
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-red-600">
        <p>Erreur : {error}</p>
      </div>
    )
  }

  const chartData = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
    datasets: [
      {
        label: 'Trésorerie prévisionnelle',
        data: [45000, 42300, 48100, 46200, 51000, 53400],
        fill: true,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        ticks: { callback: (v: number) => `${v.toLocaleString('fr-FR')} €` },
      },
    },
  }

  const kpiCards = [
    {
      label: t('netCash'),
      value: kpi?.netCash ?? 53400,
      icon: Banknote,
      color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20',
      trend: TrendingUp,
      trendColor: 'text-emerald-500',
    },
    {
      label: t('vatPayable'),
      value: kpi?.vatPayable ?? 12450,
      icon: Receipt,
      color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20',
      trend: TrendingDown,
      trendColor: 'text-amber-500',
    },
    {
      label: t('pendingEntries'),
      value: kpi?.pendingEntries ?? 7,
      icon: Clock,
      color: 'text-rose-600 bg-rose-50 dark:bg-rose-900/20',
      trend: null,
      trendColor: '',
    },
    {
      label: t('activeClients'),
      value: kpi?.activeClients ?? 12,
      icon: Users,
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
      trend: TrendingUp,
      trendColor: 'text-blue-500',
    },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card) => {
          const Icon = card.icon
          const TrendIcon = card.trend
          return (
            <div
              key={card.label}
              className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className={`rounded-lg p-2.5 ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                {TrendIcon && (
                  <TrendIcon className={`w-4 h-4 ${card.trendColor}`} />
                )}
              </div>
              <p className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
                {typeof card.value === 'number' && card.label !== t('pendingEntries') && card.label !== t('activeClients')
                  ? `${card.value.toLocaleString('fr-FR')} €`
                  : card.value}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
            </div>
          )
        })}
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t('forecast')}
        </h2>
        <Line data={chartData} options={chartOptions} />
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t('unmatched')}
        </h2>
        {entries.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            {t('noUnmatched')}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">
                  <th className="pb-3 font-medium">{t('date')}</th>
                  <th className="pb-3 font-medium">{t('label')}</th>
                  <th className="pb-3 font-medium">{t('account')}</th>
                  <th className="pb-3 font-medium text-right">{t('debit')}</th>
                  <th className="pb-3 font-medium text-right">{t('credit')}</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-b border-gray-100 dark:border-gray-700/50 text-gray-700 dark:text-gray-300"
                  >
                    <td className="py-3">{entry.date}</td>
                    <td className="py-3">{entry.label}</td>
                    <td className="py-3 font-mono text-xs">{entry.accountCode}</td>
                    <td className="py-3 text-right font-mono">
                      {entry.debit > 0 ? `${entry.debit.toFixed(2)} €` : '-'}
                    </td>
                    <td className="py-3 text-right font-mono">
                      {entry.credit > 0 ? `${entry.credit.toFixed(2)} €` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
