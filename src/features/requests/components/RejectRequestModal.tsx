import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button, Modal, Textarea } from '@/components/ui'
import { FormError, FormField, FormLabel } from '@/components/forms'
import { useTranslation } from '@/localization/useTranslation'

interface RejectRequestModalProps {
  open: boolean
  onClose: () => void
  onConfirm: (reason: string) => Promise<boolean>
}

export function RejectRequestModal({
  open,
  onClose,
  onConfirm,
}: RejectRequestModalProps) {
  const { t } = useTranslation()
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleClose() {
    setReason('')
    setError(null)
    onClose()
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalizedReason = reason.trim()
    if (!normalizedReason) {
      setError(t('requests.rejectReasonRequired'))
      return
    }
    setIsSubmitting(true)
    try {
      if (!await onConfirm(normalizedReason)) {
        setError(t('requests.rejectActionFailed'))
        return
      }
      handleClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={t('requests.reject')}
      description={t('requests.rejectDescription')}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField>
          <FormLabel htmlFor="rejection-reason" required>{t('requests.reason')}</FormLabel>
          <Textarea
            id="rejection-reason"
            required
            minLength={1}
            autoFocus
            value={reason}
            onChange={(event) => {
              setReason(event.currentTarget.value)
              setError(null)
            }}
            aria-describedby={error ? 'rejection-reason-error' : undefined}
            placeholder={t('requests.rejectPlaceholder')}
          />
        </FormField>
        {error ? <FormError id="rejection-reason-error">{error}</FormError> : null}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" disabled={isSubmitting} onClick={handleClose}>
            {t('requests.cancel')}
          </Button>
          <Button type="submit" variant="danger" loading={isSubmitting}>
            {t('requests.reject')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
