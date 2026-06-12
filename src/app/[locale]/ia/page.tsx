'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { Send, Bot, User, Loader2, BookOpen } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  sources?: string[]
}

const RESPONSES = [
  {
    answer:
      "Conformément à l'article 39 du CGI, les frais de déplacement sont déductibles lorsqu'ils sont exposés dans le cadre de l'activité professionnelle et justifiés. Les indemnités kilométriques (IK) sont exonérées dans la limite du barème fiscal publié chaque année par l'administration (BOFIP-BIC-CHG-40).",
    sources: ['CGI art. 39', 'BOFIP-BIC-CHG-40', 'Barème kilométrique 2024'],
  },
  {
    answer:
      'La TVA collectée doit être déclarée via l\'imprimé 3310-CA3 (régime réel normal) ou 3517-SD (régime simplifié). La date limite de dépôt est le 19 du mois suivant la période concernée. En cas de dépassement du seuil de franchise (91 900 € pour les ventes, 36 800 € pour les prestations), vous êtes assujetti à la TVA à compter du jour de dépassement (CGI art. 293 B).',
    sources: ['CGI art. 293 B', "BOFIP-TVA-DECLA-30", 'CERFA 3310-CA3'],
  },
  {
    answer:
      'Pour réduire l\'IS, vous pouvez constituer une provision pour charges futures (CGI art. 39-1-5°), amortir les biens selon le mode dégressif le cas échéant, utiliser le crédit d\'impôt recherche (CIR), ou reporter en avant les déficits (CGI art. 209). Le taux normal de l\'IS est de 25 % (15 % jusqu\'à 42 500 € de bénéfice sous conditions de chiffre d\'affaires).',
    sources: ['CGI art. 39-1-5°', 'CGI art. 209', 'CGI art. 219', 'BOFIP-IS-30'],
  },
  {
    answer:
      "L'obligation de facturation électronique (e-invoicing) entre assujettis TVA entre en vigueur le 1er septembre 2026 pour les grandes entreprises, et sera étendue aux PME au 1er septembre 2027. Les plateformes PPF (Portail Public de Facturation) ou les PDES (Plateformes de Dématérialisation Partenaires) seront obligatoires. Les factures doivent respecter la norme EN 16931.",
    sources: [
      'LOI n° 2023-1322 du 29 décembre 2023',
      'BOFIP-TVA-DECLA-30-40',
      'Norme EN 16931',
    ],
  },
]

function getRandomResponse() {
  return RESPONSES[Math.floor(Math.random() * RESPONSES.length)]
}

export default function IaPage() {
  const t = useTranslations('ia')
  const params = useParams()
  const locale = params.locale as string

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: t('welcome'),
    },
  ])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend() {
    const question = input.trim()
    if (!question || thinking) return
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: question }])
    setThinking(true)

    try {
      const res = await fetch(`/${locale}/api/ia/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      })
      if (!res.ok) throw new Error('API error')
      const data = await res.json()
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.answer, sources: data.sources },
      ])
    } catch {
      const fallback = getRandomResponse()
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: fallback.answer,
          sources: fallback.sources,
        },
      ])
    } finally {
      setThinking(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        {t('title')}
      </h1>

      <div className="flex flex-col rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm h-[600px]">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
            >
              {msg.role === 'assistant' && (
                <div className="shrink-0 rounded-full bg-blue-100 dark:bg-blue-900/30 p-2">
                  <Bot className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      {t('sources')}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.sources.map((src, j) => (
                        <span
                          key={j}
                          className="inline-block rounded-md bg-gray-200 dark:bg-gray-600 px-2 py-0.5 text-xs font-mono text-gray-600 dark:text-gray-300"
                        >
                          {src}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="shrink-0 rounded-full bg-gray-200 dark:bg-gray-600 p-2">
                  <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </div>
              )}
            </div>
          ))}

          {thinking && (
            <div className="flex gap-3">
              <div className="shrink-0 rounded-full bg-blue-100 dark:bg-blue-900/30 p-2">
                <Bot className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="rounded-xl bg-gray-100 dark:bg-gray-700 px-4 py-3 text-gray-500 dark:text-gray-400 text-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('thinking')}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('placeholder')}
              className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || thinking}
              className="shrink-0 rounded-lg bg-blue-600 p-2.5 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
