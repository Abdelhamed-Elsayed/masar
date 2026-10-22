import { Check } from 'lucide-react'
import { Card } from '@/components/ui'
import { useDirectoryStore } from '@/store/directoryStore'
import { useTranslation } from '@/localization/useTranslation'

interface RequestTypeSelectorProps { selectedId: string; onSelect: (id: string) => void }

export function RequestTypeSelector({ selectedId, onSelect }: RequestTypeSelectorProps) {
  const requestTypes = useDirectoryStore((state) => state.requestTypes)
  const { t, content } = useTranslation()
  return <fieldset><legend className="mb-3 text-sm font-medium text-slate-700">{t('requests.selectType')}</legend><div className="grid gap-3 sm:grid-cols-2">{requestTypes.map((requestType) => {
    const selected = requestType.id === selectedId
    return <button key={requestType.id} type="button" aria-pressed={selected} onClick={() => onSelect(requestType.id)} className="rounded-xl text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"><Card className={`h-full p-4 transition-colors ${selected ? 'border-blue-600 bg-blue-50' : 'hover:border-slate-300'}`}><span className="flex items-center justify-between gap-2"><span className="font-medium text-slate-900">{content(requestType.name)}</span>{selected ? <Check size={18} className="text-blue-700" aria-label={t('requests.selected')} /> : null}</span><span className="mt-2 block text-sm text-slate-600">{content(requestType.description)}</span></Card></button>
  })}</div></fieldset>
}
