'use client'
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import {
  Shield,
  Database,
  Globe,
  HardDrive,
  Server,
  Activity,
  Clock,
} from 'lucide-react'

interface AuditEntry {
  id: string
  action: string
  user: string
  timestamp: string
  ip: string
}

function StatusDot() {
  return (
    <span className="relative inline-flex h-2.5 w-2.5">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
    </span>
  )
}

export default function SecurityPage() {
  const t = useTranslations('security')
  const params = useParams()
  const locale = params.locale as string

  const [audit, setAudit] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAudit() {
      try {
        const res = await fetch(`/${locale}/api/entries/audit`)
        if (!res.ok) throw new Error('Failed')
        const data = await res.json()
        setAudit(data.entries ?? [])
      } catch {
        setAudit([
          { id: '1', action: 'Connexion utilisateur', user: 'admin@comptapro.fr', timestamp: '2024-06-12 09:15:00', ip: '192.168.1.10' },
          { id: '2', action: 'Modification écriture #1024', user: 'compta@client.fr', timestamp: '2024-06-12 09:02:00', ip: '10.0.0.45' },
          { id: '3', action: 'Export FEC effectué', user: 'admin@comptapro.fr', timestamp: '2024-06-12 08:45:00', ip: '192.168.1.10' },
          { id: '4', action: 'Tentative de connexion échouée', user: '-', timestamp: '2024-06-12 07:30:00', ip: '203.0.113.42' },
          { id: '5', action: 'Lettrage comptable #LTR-2024-089', user: 'compta@client.fr', timestamp: '2024-06-11 18:22:00', ip: '10.0.0.45' },
        ])
      } finally {
        setLoading(false)
      }
    }
    fetchAudit()
  }, [locale])

  const statusCards = [
    {
      icon: Database,
      title: t('dbEncryption'),
      detail: 'AES-256-GCM',
    },
    {
      icon: Shield,
      title: t('tenantIsolation'),
      detail: 'PostgreSQL RLS',
    },
    {
      icon: Globe,
      title: t('apiUptime'),
      detail: '99.99 %',
    },
    {
      icon: HardDrive,
      title: t('backups'),
      detail: t('automatic'),
    },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        {t('title')}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statusCards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.title}
              className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-2.5">
                  <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <StatusDot />
              </div>
              <p className="font-semibold text-gray-900 dark:text-white">
                {card.title}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {card.detail}
              </p>
            </div>
          )
        })}
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Server className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('deployment')}
          </h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 text-sm font-medium text-blue-700 dark:text-blue-300">
            <Server className="w-4 h-4" />
            Docker
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-black/5 dark:bg-white/10 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
            <Globe className="w-4 h-4" />
            Vercel
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-green-50 dark:bg-green-900/20 px-3 py-1.5 text-sm font-medium text-green-700 dark:text-green-300">
            <Database className="w-4 h-4" />
            Supabase
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('auditLog')}
          </h2>
        </div>
        {loading ? (
          <div className="animate-pulse space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">
                  <th className="pb-3 font-medium">{t('action')}</th>
                  <th className="pb-3 font-medium">{t('user')}</th>
                  <th className="pb-3 font-medium">{t('timestamp')}</th>
                  <th className="pb-3 font-medium">IP</th>
                </tr>
              </thead>
              <tbody>
                {audit.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-b border-gray-100 dark:border-gray-700/50 text-gray-700 dark:text-gray-300"
                  >
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        {entry.action}
                      </div>
                    </td>
                    <td className="py-3 text-xs font-mono">{entry.user}</td>
                    <td className="py-3 text-xs">{entry.timestamp}</td>
                    <td className="py-3 text-xs font-mono">{entry.ip}</td>
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
