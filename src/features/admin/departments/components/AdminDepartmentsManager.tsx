import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button, Input, Modal, Select } from '@/components/ui'
import { FormField, FormLabel } from '@/components/forms/primitives'
import { PageContainer, PageHeader } from '@/components/layout'
import { DataTable, TableCell, TableEmptyState, TableHeader, TableHeadCell, TableRow } from '@/components/tables'
import { useDirectoryStore } from '@/store/directoryStore'
import { roleIds } from '@/mock/users'
import type { Department } from '@/types/department'
import { useTranslation } from '@/localization/useTranslation'

type DepartmentDraft = Omit<Department, 'id'>

const blankDepartment: DepartmentDraft = { name: '', code: '', headUserId: null, parentDepartmentId: null }

export function AdminDepartmentsManager() {
  const { t, content } = useTranslation()
  const departments = useDirectoryStore((state) => state.departments)
  const users = useDirectoryStore((state) => state.users)
  const upsertDepartment = useDirectoryStore((state) => state.upsertDepartment)
  const upsertUser = useDirectoryStore((state) => state.upsertUser)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Department | null>(null)
  const [draft, setDraft] = useState<DepartmentDraft>(blankDepartment)
  const [error, setError] = useState('')

  function openEditor(department?: Department) {
    setEditing(department ?? null)
    setDraft(department
      ? { name: department.name, code: department.code, headUserId: department.headUserId, parentDepartmentId: department.parentDepartmentId }
      : { ...blankDepartment })
    setError('')
    setDialogOpen(true)
  }

  function saveDepartment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!draft.name.trim() || !draft.code.trim()) {
      setError(t('admin.departmentNameCodeRequired'))
      return
    }
    if (departments.some((department) => department.code.toLowerCase() === draft.code.trim().toLowerCase() && department.id !== editing?.id)) {
      setError(t('admin.departmentCodeExists'))
      return
    }
    if (draft.parentDepartmentId && editing) {
      let cursor: string | null = draft.parentDepartmentId
      const seen = new Set<string>()
      while (cursor) {
        if (cursor === editing.id) { setError(t('admin.departmentCycle')); return }
        if (seen.has(cursor)) break
        seen.add(cursor)
        cursor = departments.find((department) => department.id === cursor)?.parentDepartmentId ?? null
      }
    }
    const updated: Department = {
      ...draft,
      id: editing?.id ?? `dept-${Date.now()}`,
      name: draft.name.trim(),
      code: draft.code.trim().toUpperCase(),
    }
    upsertDepartment(updated)
    const selectedHead = users.find((user) => user.id === draft.headUserId)
    if (selectedHead && selectedHead.departmentId !== updated.id) {
      upsertUser({
        ...selectedHead,
        departmentId: updated.id,
        roleIds: selectedHead.roleIds.includes(roleIds.departmentHead)
          ? selectedHead.roleIds
          : [...selectedHead.roleIds, roleIds.departmentHead],
      })
    }
    setDialogOpen(false)
  }

  return (
    <PageContainer>
      <PageHeader title={t('admin.departments')} description={t('admin.departmentsDescription')} actions={<Button type="button" onClick={() => openEditor()}>{t('admin.addDepartment')}</Button>} />
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        {[[t('admin.departmentCount'), departments.length], [t('admin.employeeCount'), users.length], [t('admin.unassignedCount'), users.filter((user) => !user.departmentId).length]].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 text-2xl font-semibold text-slate-950">{value}</p></div>
        ))}
      </div>
      <DataTable caption={t('admin.departments')}>
        <TableHeader><TableRow><TableHeadCell>{t('admin.department')}</TableHeadCell><TableHeadCell>{t('admin.code')}</TableHeadCell><TableHeadCell>{t('admin.departmentHead')}</TableHeadCell><TableHeadCell>{t('admin.parentDepartment')}</TableHeadCell><TableHeadCell><span className="sr-only">{t('admin.actions')}</span></TableHeadCell></TableRow></TableHeader>
        <tbody>
          {departments.length === 0 ? <TableEmptyState colSpan={5} title={t('admin.noDepartments')} description={t('admin.addDepartmentHint')} /> : departments.map((department) => (
            <TableRow key={department.id}>
              <TableCell className="font-medium text-slate-900">{content(department.name)}</TableCell>
              <TableCell><bdi dir="ltr">{department.code}</bdi></TableCell>
              <TableCell>{users.find((user) => user.id === department.headUserId) ? content(users.find((user) => user.id === department.headUserId)!.fullName) : t('admin.notAssigned')}</TableCell>
              <TableCell>{content(departments.find((parent) => parent.id === department.parentDepartmentId)?.name ?? t('common.none'))}</TableCell>
              <TableCell><Button type="button" variant="ghost" size="sm" onClick={() => openEditor(department)}>{t('admin.edit')}</Button></TableCell>
            </TableRow>
          ))}
        </tbody>
      </DataTable>
      <Modal open={dialogOpen} onClose={() => setDialogOpen(false)} title={editing ? t('admin.editDepartment') : t('admin.addDepartment')}>
        <form className="space-y-4" onSubmit={saveDepartment}>
          <FormField><FormLabel htmlFor="department-name" required>{t('admin.name')}</FormLabel><Input id="department-name" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.currentTarget.value })} required /></FormField>
          <FormField><FormLabel htmlFor="department-code" required>{t('admin.code')}</FormLabel><Input id="department-code" value={draft.code} onChange={(event) => setDraft({ ...draft, code: event.currentTarget.value })} maxLength={12} required /></FormField>
          <FormField><FormLabel htmlFor="department-head">{t('admin.departmentHead')}</FormLabel><Select id="department-head" value={draft.headUserId ?? ''} onChange={(event) => setDraft({ ...draft, headUserId: event.currentTarget.value || null })}><option value="">{t('admin.notAssigned')}</option>{users.filter((user) => user.isActive).map((user) => <option key={user.id} value={user.id}><bdi>{content(user.fullName)}</bdi></option>)}</Select></FormField>
          <FormField><FormLabel htmlFor="department-parent">{t('admin.parentDepartment')}</FormLabel><Select id="department-parent" value={draft.parentDepartmentId ?? ''} onChange={(event) => setDraft({ ...draft, parentDepartmentId: event.currentTarget.value || null })}><option value="">{t('common.none')}</option>{departments.filter((department) => department.id !== editing?.id).map((department) => <option key={department.id} value={department.id}>{content(department.name)}</option>)}</Select></FormField>
          {error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}
          <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4"><Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>{t('requests.cancel')}</Button><Button type="submit">{editing ? t('admin.saveChanges') : t('admin.createDepartment')}</Button></div>
        </form>
      </Modal>
    </PageContainer>
  )
}
