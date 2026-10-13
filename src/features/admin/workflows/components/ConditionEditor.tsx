import { Textarea } from '@/components/ui'
import { useTranslation } from '@/localization/useTranslation'

interface ConditionEditorProps {
  value: string
  onChange: (value: string) => void
}

export function ConditionEditor({ value, onChange }: ConditionEditorProps) {
  const { t } = useTranslation()
  return (
    <section aria-labelledby="workflow-conditions-heading" className="space-y-2">
      <div>
        <h3 id="workflow-conditions-heading" className="font-semibold text-slate-900">{t('admin.conditionsNotes')}</h3>
        <p className="mt-1 text-sm text-slate-600">
          {t('admin.conditionsDescription')}
        </p>
      </div>
      <label htmlFor="workflow-description" className="sr-only">{t('admin.conditionsNotes')}</label>
      <Textarea
        id="workflow-description"
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
        placeholder={t('admin.conditionsPlaceholder')}
        rows={3}
      />
    </section>
  )
}
