import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { Button, Card } from '@/components/ui'
import { PageContainer, PageHeader } from '@/components/layout'
import { ROUTES, requestDetailsPath } from '@/constants/routes'
import { useDirectoryStore } from '@/store/directoryStore'
import { useAuthStore } from '@/store/authStore'
import { useRequestStore } from '@/store/requestStore'
import { AttachmentsUploader } from '@/features/requests/components/AttachmentsUploader'
import type { SelectedAttachment } from '@/features/requests/components/AttachmentsUploader'
import { RequestForm } from '@/features/requests/components/RequestForm'
import type { RequestFieldValue } from '@/types/common'
import { useFormStore } from '@/store/formStore'
import { RequestPreview } from '@/features/requests/components/RequestPreview'
import { RequestTypeSelector } from '@/features/requests/components/RequestTypeSelector'
import { useTranslation } from '@/localization/useTranslation'

const steps = ['Request type', 'Details', 'Attachments', 'Preview'] as const
type CreationStep = 0 | 1 | 2 | 3

const nextCreationStep: Record<CreationStep, CreationStep> = {
  0: 1,
  1: 2,
  2: 3,
  3: 3,
}

const previousCreationStep: Record<CreationStep, CreationStep> = {
  0: 0,
  1: 0,
  2: 1,
  3: 2,
}


export function NewRequestPage() {
  const { t, content, locale } = useTranslation()
  const navigate = useNavigate()
  const currentUser = useAuthStore((state) => state.currentUser)
  const departments = useDirectoryStore((state) => state.departments)
  const requestTypes = useDirectoryStore((state) => state.requestTypes)
  const forms = useFormStore((state) => state.forms)
  const createDraft = useRequestStore((state) => state.createDraft)
  const updateDraft = useRequestStore((state) => state.updateDraft)
  const submitRequest = useRequestStore((state) => state.submitRequest)
  const [step, setStep] = useState<CreationStep>(0)
  const [requestTypeId, setRequestTypeId] = useState(() => requestTypes[0]?.id ?? '')
  const selectedType = requestTypes.find((type) => type.id === requestTypeId)
  const selectedForm = forms.find((form) => form.id === selectedType?.formDefinitionId)
  const requiresAttachment = selectedForm?.fields.some((field) => field.kind === 'File' && field.required) ?? false
  const initialValues = Object.fromEntries((selectedForm?.fields ?? []).map((field) => [field.id, field.kind === 'Checkbox' ? false : null])) as Record<string, RequestFieldValue>
  const [values, setValues] = useState<Record<string, RequestFieldValue>>(initialValues)
  const [attachments, setAttachments] = useState<SelectedAttachment[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [draftId, setDraftId] = useState<string | null>(null)
  const department = departments.find((item) => item.id === currentUser?.departmentId)

  function changeRequestType(id: string) {
    setRequestTypeId(id)
    const type = requestTypes.find((item) => item.id === id)
    const form = forms.find((item) => item.id === type?.formDefinitionId)
    setValues(Object.fromEntries((form?.fields ?? []).map((field) => [field.id, field.kind === 'Checkbox' ? false : null])) as Record<string, RequestFieldValue>)
  }

  function addAttachments(files: FileList | null) {
    if (!files) return
    const selectedFiles = Array.from(files)
    const allowedTypes = new Set([
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'text/plain',
      'text/csv',
    ])
    if (attachments.length + selectedFiles.length > 5) {
      setError(t('requests.tooManyFiles'))
      return
    }
    if (selectedFiles.some((file) => file.size < 1 || file.size > 5 * 1024 * 1024 || !allowedTypes.has(file.type))) {
      setError(t('requests.invalidFiles'))
      return
    }
    setError(null)
    const newAttachments = selectedFiles.map((file) => ({
      id: crypto.randomUUID(),
      file,
    }))
    setAttachments((current) => [...current, ...newAttachments])
  }

  function validateDetails() {
    if (!selectedForm) return true
    for (const field of selectedForm.fields) {
      if (field.kind === 'File') continue
      const value = values[field.id]
      const blank = value === null || value === undefined || (typeof value === 'string' && value.trim() === '')
      const missingRequiredValue = field.required && (blank || (field.kind === 'Checkbox' && value !== true))
      const invalidNumber = field.kind === 'Number' && !blank &&
        (typeof value !== 'number' || !Number.isFinite(value))
      const invalidDate = field.kind === 'Date' && typeof value === 'string' && value.trim() !== '' &&
        Number.isNaN(Date.parse(value))
      const invalidOption = field.kind === 'Select' && typeof value === 'string' && value.trim() !== '' &&
        !field.options.includes(value)
      if (missingRequiredValue || invalidNumber || invalidDate || invalidOption) {
        setError(`${t('requests.requiredField')} ${content(field.label)}.`)
        return false
      }
    }
    return true
  }

  function validateAttachments() {
    const requiredFileField = selectedForm?.fields.find((field) => field.kind === 'File' && field.required)
    if (requiredFileField && attachments.length === 0) {
      setError(`${t('requests.requiredField')} ${content(requiredFileField.label)}.`)
      return false
    }
    return true
  }

  async function createRequestDraft() {
    if (!currentUser || !selectedType) {
      setError(t('requests.invalidType'))
      return null
    }

    const input = {
      requestTypeId,
      title: selectedType.name,
      departmentId: currentUser.departmentId,
      fields: { ...values },
      attachments: [],
      files: attachments.map(({ file }) => file),
    }
    const request = draftId ? await updateDraft(draftId, input) : await createDraft(input)
    if (request) setDraftId(request.id)

    if (!request) {
      setError(t('requests.saveFailed'))
      return null
    }
    return request
  }

  async function saveDraft() {
    if (isSaving) return
    if (step === 1 && !validateDetails()) return
    setIsSaving(true)
    setError(null)
    try {
      const request = await createRequestDraft()
      if (request) navigate(requestDetailsPath(request.id))
      else setError(t('requests.saveFailed'))
    } catch (saveError) {
      console.error('Request draft save failed', saveError)
      setError(t('requests.saveFailed'))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSaving) return
    setError(null)

    if (step === 1 && !validateDetails()) return
    if (step === 2 && !validateAttachments()) return
    if (step < 3) {
      setStep((current) => nextCreationStep[current])
      return
    }

    setIsSaving(true)
    try {
      const request = await createRequestDraft()
      if (!request) {
        setError(t('requests.couldNotSave'))
        return
      }
      if (!await submitRequest(request.id)) {
        setError(t('requests.submitFailed'))
        return
      }
      navigate(requestDetailsPath(request.id))
    } catch (submitError) {
      console.error('Request submission failed', submitError)
      setError(t('requests.saveFailed'))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <PageContainer>
      <PageHeader
        title={t('requests.createTitle')}
        description={t('requests.createDescription')}
        actions={
          <Button type="button" variant="outline" onClick={() => navigate(ROUTES.REQUESTS)}>
            <ArrowLeft size={16} className="rtl:rotate-180" aria-hidden="true" /> {t('requests.backToRequests')}
          </Button>
        }
      />
      <Card className="mx-auto max-w-4xl p-4 sm:p-6">
        <div className="mb-5 rounded-xl bg-slate-50 p-3 text-xs text-slate-600 sm:p-4"><span className="font-semibold text-slate-900">{t('requests.stepOf')} {new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-US').format(step + 1)} {t('requests.of')} {new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-US').format(steps.length)}</span><span className="mx-2 text-slate-300">•</span>{t(['requests.stepType', 'requests.stepDetails', 'requests.stepAttachments', 'requests.stepPreview'][step] as 'requests.stepType' | 'requests.stepDetails' | 'requests.stepAttachments' | 'requests.stepPreview')}</div>
        <ol aria-label={t('requests.creationSteps')} className="mb-8 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {steps.map((label, index) => {
            const isComplete = index < step
            const isCurrent = index === step
            return (
              <li
                key={label}
                aria-current={isCurrent ? 'step' : undefined}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs sm:text-sm ${
                  isCurrent ? 'bg-blue-50 font-medium text-blue-800' : isComplete ? 'text-emerald-700' : 'text-slate-500'
                }`}
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-current">
                  {isComplete ? <Check size={14} aria-hidden="true" /> : new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-US').format(index + 1)}
                </span>
                {t(['requests.stepType', 'requests.stepDetails', 'requests.stepAttachments', 'requests.stepPreview'][index] as 'requests.stepType' | 'requests.stepDetails' | 'requests.stepAttachments' | 'requests.stepPreview')}
              </li>
            )
          })}
        </ol>
        <form onSubmit={handleSubmit}>
          {step === 0 ? (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900">{t('requests.chooseType')}</h2>
              <RequestTypeSelector selectedId={requestTypeId} onSelect={changeRequestType} />
            </div>
          ) : null}
          {step === 1 ? (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900">{t('requests.details')}</h2>
              {currentUser ? (
                <RequestForm
                  requester={currentUser}
                  department={department}
                  form={selectedForm}
                  values={values}
                  onChange={setValues}
                />
              ) : null}
            </div>
          ) : null}
          {step === 2 ? (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900">{t('requests.attachments')}</h2>
              <AttachmentsUploader
                files={attachments}
                required={requiresAttachment}
                onAdd={addAttachments}
                onRemove={(id) => setAttachments((current) => current.filter((file) => file.id !== id))}
              />
            </div>
          ) : null}
          {step === 3 ? (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900">{t('requests.reviewSubmit')}</h2>
              {currentUser ? (
                <RequestPreview
                  requester={currentUser}
                  department={department}
                  form={selectedForm}
                  values={values}
                  files={attachments}
                />
              ) : null}
            </div>
          ) : null}
          {error ? <p role="alert" className="mt-4 text-sm text-red-600">{error}</p> : null}
          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <Button type="button" variant="outline" onClick={() => void saveDraft()} loading={isSaving}>
              {t('requests.saveDraft')}
            </Button>
            <div className="flex justify-end gap-2">
              {step > 0 ? (
                <Button type="button" variant="ghost" onClick={() => setStep((current) => previousCreationStep[current])}>
                  <ArrowLeft size={16} className="rtl:rotate-180" aria-hidden="true" /> {t('requests.back')}
                </Button>
              ) : null}
              <Button type="submit" loading={isSaving}>
                {step === 3 ? t('requests.submit') : t('requests.continue')}
                {step < 3 ? <ArrowRight size={16} className="rtl:rotate-180" aria-hidden="true" /> : null}
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </PageContainer>
  )
}
