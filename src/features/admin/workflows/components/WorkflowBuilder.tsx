import { useMemo, useState } from 'react'
import { Plus, Save } from 'lucide-react'
import { Alert, Button, Card, Input, Select } from '@/components/ui'
import { PageContainer, PageHeader } from '@/components/layout'
import { useDirectoryStore } from '@/store/directoryStore'
import { useWorkflowStore } from '@/store/workflowStore'
import { useTranslation } from '@/localization/useTranslation'
import type { TranslationKey } from '@/localization/translations'
import { ApproverType } from '@/types/workflow'
import type { WorkflowDefinition, WorkflowStepDefinition } from '@/types/workflow'
import { ConditionEditor } from './ConditionEditor'
import { WorkflowCanvas } from './WorkflowCanvas'
import { WorkflowPreview } from './WorkflowPreview'
import { WorkflowStepEditor } from './WorkflowStepEditor'

function createStep(order: number): WorkflowStepDefinition {
  return {
    id: crypto.randomUUID(),
    order,
    name: `Approval step ${order}`,
    approver: { type: ApproverType.DIRECT_MANAGER },
  }
}

function normalizeSteps(steps: WorkflowStepDefinition[]) {
  return steps.map((step, index) => ({ ...step, order: index + 1 }))
}

function hasValidApproverTarget(
  step: WorkflowStepDefinition,
  users: ReturnType<typeof useDirectoryStore.getState>['users'],
  departments: ReturnType<typeof useDirectoryStore.getState>['departments'],
  roles: ReturnType<typeof useDirectoryStore.getState>['roles'],
): boolean {
  const target = step.approver
  switch (target.type) {
    case ApproverType.SPECIFIC_USER:
    case ApproverType.REPRESENTATIVE:
      return users.some((user) => user.id === target.userId && user.isActive)
    case ApproverType.DEPARTMENT:
      return departments.some((department) => department.id === target.departmentId)
    case ApproverType.ROLE:
      return roles.some((role) => role.id === target.roleId)
    case ApproverType.DEPARTMENT_HEAD:
      return target.departmentId === undefined ||
        departments.some((department) => department.id === target.departmentId)
    case ApproverType.DIRECT_MANAGER:
      return true
  }
}

export function WorkflowBuilder() {
  const { t, content } = useTranslation()
  const definitions = useWorkflowStore((state) => state.definitions)
  const upsertDefinition = useWorkflowStore((state) => state.upsertDefinition)
  const requestTypes = useDirectoryStore((state) => state.requestTypes)
  const upsertRequestType = useDirectoryStore((state) => state.upsertRequestType)
  const users = useDirectoryStore((state) => state.users)
  const departments = useDirectoryStore((state) => state.departments)
  const roles = useDirectoryStore((state) => state.roles)
  const [selectedId, setSelectedId] = useState<string | null>(definitions[0]?.id ?? null)
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<TranslationKey | null>(null)
  const activeDefinition = definitions.find((item) => item.id === selectedId) ?? definitions[0]
  const definition = activeDefinition
  const selectedStep = useMemo(
    () => definition?.steps.find((step) => step.id === selectedStepId) ?? null,
    [definition, selectedStepId],
  )

  function beginEdit(next: WorkflowDefinition) {
    if (next.steps.some((step) => !hasValidApproverTarget(step, users, departments, roles))) {
      setError('admin.validApprover')
      return
    }
    upsertDefinition(next)
    setSelectedId(next.id)
    setSaved(false)
    setError(null)
  }

  function updateDefinition(updates: Partial<WorkflowDefinition>) {
    if (definition) beginEdit({ ...definition, ...updates })
  }

  function selectDefinition(id: string) {
    const next = definitions.find((item) => item.id === id)
    if (!next) return
    setSelectedId(id)
    setSelectedStepId(null)
    setSaved(false)
    setError(null)
  }

  function createDefinition() {
    const requestType = requestTypes[0]
    if (!requestType) return
    const next: WorkflowDefinition = {
      id: `workflow-${crypto.randomUUID()}`,
      name: 'New approval workflow',
      description: '',
      requestTypeId: requestType.id,
      steps: [createStep(1)],
    }
    beginEdit(next)
    setSelectedStepId(next.steps[0]?.id ?? null)
  }

  function updateStep(step: WorkflowStepDefinition) {
    if (!definition) return
    updateDefinition({ steps: definition.steps.map((item) => item.id === step.id ? step : item) })
  }

  function addStep() {
    if (!definition) return
    const next = createStep(definition.steps.length + 1)
    updateDefinition({ steps: [...definition.steps, next] })
    setSelectedStepId(next.id)
  }

  function removeStep(stepId: string) {
    if (!definition) return
    const nextSteps = normalizeSteps(definition.steps.filter((step) => step.id !== stepId))
    updateDefinition({ steps: nextSteps })
    if (selectedStepId === stepId) setSelectedStepId(nextSteps[0]?.id ?? null)
  }

  function moveStep(stepId: string, direction: -1 | 1) {
    if (!definition) return
    const steps = [...definition.steps]
    const index = steps.findIndex((step) => step.id === stepId)
    const targetIndex = index + direction
    if (index < 0 || targetIndex < 0 || targetIndex >= steps.length) return
    const currentStep = steps[index]
    const targetStep = steps[targetIndex]
    if (!currentStep || !targetStep) return
    steps[index] = targetStep
    steps[targetIndex] = currentStep
    updateDefinition({ steps: normalizeSteps(steps) })
  }

  async function handleSave() {
    if (!definition || !definition.name.trim()) {
      setError('admin.enterWorkflowName')
      return
    }
    if (definition.steps.length === 0) {
      setError('admin.addWorkflowStep')
      return
    }
    if (definition.steps.some((step) => !step.name.trim())) {
      setError('admin.nameWorkflowSteps')
      return
    }
    const normalized = { ...definition, name: definition.name.trim(), steps: normalizeSteps(definition.steps) }
    if (!requestTypes.some((type) => type.id === normalized.requestTypeId)) {
      setError('admin.validRequestType')
      return
    }
    if (normalized.steps.some((step) => !hasValidApproverTarget(step, users, departments, roles))) {
      setError('admin.validApprover')
      return
    }
    const requestType = requestTypes.find(
      (type) => type.id === normalized.requestTypeId,
    )
    if (!requestType) {
      setError('admin.validRequestType')
      return
    }
    upsertRequestType({
      ...requestType,
      workflowDefinitionId: normalized.id,
    })
    upsertDefinition(normalized)
    setSelectedId(normalized.id)
    setSaved(true)
    setError(null)
  }

  if (!definition) {
    return (
      <PageContainer>
        <PageHeader title={t('admin.workflowBuilder')} description={t('admin.workflowDescription')} />
        <Card className="p-8 text-center">
          <p className="text-slate-600">{t('admin.noWorkflows')}</p>
          <Button type="button" className="mt-4" onClick={createDefinition}><Plus size={17} />{t('admin.createWorkflow')}</Button>
        </Card>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <PageHeader
        title={t('admin.workflowBuilder')}
        description={t('admin.workflowBuilderDescription')}
        actions={
          <>
            <Button type="button" variant="outline" onClick={createDefinition}><Plus size={17} />{t('admin.newWorkflow')}</Button>
            <Button type="button" onClick={handleSave}><Save size={17} />{t('admin.saveWorkflow')}</Button>
          </>
        }
      />
      <div className="space-y-5">
        {saved ? <Alert variant="success" role="status">{t('admin.workflowSaved')}</Alert> : null}
        {error ? <Alert variant="error">{t(error)}</Alert> : null}
        <Card className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
          <div>
            <label htmlFor="workflow-select" className="mb-1 block text-sm font-medium text-slate-700">{t('admin.workflowDefinition')}</label>
            <Select id="workflow-select" value={definition.id} onChange={(event) => selectDefinition(event.currentTarget.value)}>
              {definitions.map((item) => <option key={item.id} value={item.id}>{content(item.name)}</option>)}
            </Select>
          </div>
          <div>
            <label htmlFor="workflow-name" className="mb-1 block text-sm font-medium text-slate-700">{t('admin.workflowName')}</label>
            <Input id="workflow-name" value={content(definition.name)} maxLength={100} onChange={(event) => updateDefinition({ name: event.currentTarget.value })} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="workflow-request-type" className="mb-1 block text-sm font-medium text-slate-700">{t('admin.requestType')}</label>
            <Select
              id="workflow-request-type"
              value={definition.requestTypeId}
              onChange={(event) => updateDefinition({ requestTypeId: event.currentTarget.value })}
            >
              {requestTypes.map((type) => <option key={type.id} value={type.id}>{content(type.name)}</option>)}
            </Select>
          </div>
        </Card>

        <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.8fr)]">
          <div className="min-w-0 space-y-5">
            <WorkflowCanvas
              steps={definition.steps}
              selectedStepId={selectedStepId}
              onSelectStep={setSelectedStepId}
              onMoveStep={moveStep}
              onRemoveStep={removeStep}
              onAddStep={addStep}
            />
            {selectedStep ? (
              <WorkflowStepEditor
                key={selectedStep.id}
                step={selectedStep}
                onChange={updateStep}
                onClose={() => setSelectedStepId(null)}
              />
            ) : null}
            <Card className="p-5">
              <ConditionEditor value={definition.description} onChange={(description) => updateDefinition({ description })} />
            </Card>
          </div>
          <div className="min-w-0 xl:sticky xl:top-5 xl:self-start">
            <WorkflowPreview definition={definition} />
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
