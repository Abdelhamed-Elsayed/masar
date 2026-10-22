import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button, Input, Modal, Select, Textarea } from '@/components/ui'
import { FormField, FormLabel } from '@/components/forms/primitives'
import { PageContainer, PageHeader } from '@/components/layout'
import { DataTable, TableCell, TableEmptyState, TableHeader, TableHeadCell, TableRow } from '@/components/tables'
import { useDirectoryStore } from '@/store/directoryStore'
import { useWorkflowStore } from '@/store/workflowStore'
import type { RequestType } from '@/types/request'
import { useFormStore } from '@/store/formStore'
import { useTranslation } from '@/localization/useTranslation'

type TypeDraft = Omit<RequestType, 'id'>

const blankDraft: TypeDraft = { name: '', code: '', description: '', workflowDefinitionId: '', formDefinitionId: '' }

export function AdminRequestTypesManager() {
  const { t, content } = useTranslation()
  const requestTypes = useDirectoryStore((state) => state.requestTypes)
  const upsertRequestType = useDirectoryStore((state) => state.upsertRequestType)
  const workflowDefinitions = useWorkflowStore((state) => state.definitions)
  const forms = useFormStore((state) => state.forms)
  const upsertDefinition = useWorkflowStore((state) => state.upsertDefinition)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<RequestType | null>(null)
  const [draft, setDraft] = useState<TypeDraft>(blankDraft)
  const [error, setError] = useState('')

  function openEditor(requestType?: RequestType) {
    setEditing(requestType ?? null)
    setDraft(requestType
      ? { name: requestType.name, code: requestType.code, description: requestType.description, workflowDefinitionId: requestType.workflowDefinitionId, formDefinitionId: requestType.formDefinitionId ?? '' }
      : { ...blankDraft, workflowDefinitionId: workflowDefinitions[0]?.id ?? '', formDefinitionId: forms[0]?.id ?? '' })
    setError('')
    setDialogOpen(true)
  }

  function saveRequestType(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (requestTypes.some((requestType) => requestType.code.toLowerCase() === draft.code.trim().toLowerCase() && requestType.id !== editing?.id)) {
      setError(t('admin.requestTypeCodeExists'))
      return
    }
    const workflow = workflowDefinitions.find(
      (item) => item.id === draft.workflowDefinitionId,
    )
    if (!workflow) {
      setError(t('admin.chooseValidWorkflow'))
      return
    }
    const updated: RequestType = {
      ...draft,
      id: editing?.id ?? `request-type-${Date.now()}`,
      name: draft.name.trim(),
      code: draft.code.trim().toUpperCase(),
      description: draft.description.trim(),
      formDefinitionId: draft.formDefinitionId || undefined,
    }
    upsertRequestType(updated)
    upsertDefinition({ ...workflow, requestTypeId: updated.id })
    setDialogOpen(false)
  }

  return (
    <PageContainer>
      <PageHeader title={t('admin.requestTypes')} description={t('admin.requestTypesDescription')} actions={<Button type="button" onClick={() => openEditor()}>{t('admin.addRequestType')}</Button>} />
      <DataTable caption={t('admin.requestTypes')}>
        <TableHeader><TableRow><TableHeadCell>{t('admin.requestType')}</TableHeadCell><TableHeadCell>{t('admin.code')}</TableHeadCell><TableHeadCell>{t('admin.description')}</TableHeadCell><TableHeadCell>{t('admin.workflow')}</TableHeadCell><TableHeadCell>{t('admin.form')}</TableHeadCell><TableHeadCell><span className="sr-only">{t('admin.actions')}</span></TableHeadCell></TableRow></TableHeader>
        <tbody>
          {requestTypes.length === 0 ? <TableEmptyState colSpan={6} title={t('admin.noRequestTypes')} description={t('admin.addRequestTypeHint')} /> : requestTypes.map((requestType) => (
            <TableRow key={requestType.id}>
              <TableCell className="font-medium text-slate-900">{content(requestType.name)}</TableCell>
              <TableCell><code className="text-xs">{requestType.code}</code></TableCell>
              <TableCell className="max-w-sm">{content(requestType.description)}</TableCell>
              <TableCell>{content(workflowDefinitions.find((workflow) => workflow.id === requestType.workflowDefinitionId)?.name ?? t('admin.workflowNotFound'))}</TableCell><TableCell>{content(forms.find((form) => form.id === requestType.formDefinitionId)?.name ?? t('admin.notAssigned'))}</TableCell>
              <TableCell><Button type="button" variant="ghost" size="sm" onClick={() => openEditor(requestType)}>{t('admin.edit')}</Button></TableCell>
            </TableRow>
          ))}
        </tbody>
      </DataTable>
      <Modal open={dialogOpen} onClose={() => setDialogOpen(false)} title={editing ? t('admin.editRequestType') : t('admin.addRequestType')}>
        <form className="space-y-4" onSubmit={saveRequestType}>
          <FormField><FormLabel htmlFor="request-type-name" required>{t('admin.name')}</FormLabel><Input id="request-type-name" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.currentTarget.value })} required /></FormField>
          <FormField><FormLabel htmlFor="request-type-code" required>{t('admin.code')}</FormLabel><Input id="request-type-code" value={draft.code} onChange={(event) => setDraft({ ...draft, code: event.currentTarget.value })} maxLength={24} required /></FormField>
          <FormField><FormLabel htmlFor="request-type-description" required>{t('admin.description')}</FormLabel><Textarea id="request-type-description" value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.currentTarget.value })} required /></FormField>
          <FormField><FormLabel htmlFor="request-type-workflow" required>{t('admin.workflow')}</FormLabel><Select id="request-type-workflow" value={draft.workflowDefinitionId} onChange={(event) => setDraft({ ...draft, workflowDefinitionId: event.currentTarget.value })} required><option value="">{t('admin.chooseWorkflow')}</option>{workflowDefinitions.map((workflow) => <option key={workflow.id} value={workflow.id}>{content(workflow.name)}</option>)}</Select></FormField>
          <FormField><FormLabel htmlFor="request-type-form">{t('admin.form')}</FormLabel><Select id="request-type-form" value={draft.formDefinitionId} onChange={(event) => setDraft({ ...draft, formDefinitionId: event.currentTarget.value })}><option value="">{t('admin.notAssigned')}</option>{forms.map((form) => <option key={form.id} value={form.id}>{content(form.name)}</option>)}</Select></FormField>
          {error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}
          <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4"><Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>{t('requests.cancel')}</Button><Button type="submit">{editing ? t('admin.saveChanges') : t('admin.createRequestType')}</Button></div>
        </form>
      </Modal>
    </PageContainer>
  )
}
