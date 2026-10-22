import { Button } from '@/components/ui'
import type { User } from '@/types/user'
import { useTranslation } from '@/localization/useTranslation'

interface DeleteUserConfirmationProps {
  user: User
  onCancel: () => void
  onConfirm: () => void
}

export function DeleteUserConfirmation({
  user,
  onCancel,
  onConfirm,
}: DeleteUserConfirmationProps) {
  const { t, content } = useTranslation()
  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-700">
        {t('admin.userDeletePrompt')} <strong>{content(user.fullName)}</strong>? {t('admin.deleteUserConfirm')}
      </p>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>{t('requests.cancel')}</Button>
        <Button type="button" variant="danger" onClick={onConfirm}>{t('admin.deleteUser')}</Button>
      </div>
    </div>
  )
}
