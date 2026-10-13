import { describe, expect, it } from 'vitest'
import { getCurrentStep } from './workflow'
import { ApproverType, WorkflowStepStatus } from '@/types/workflow'
import type { WorkflowInstance, WorkflowStepInstance } from '@/types/workflow'

function makeStep(overrides: Partial<WorkflowStepInstance>): WorkflowStepInstance {
  return {
    id: 'step-1',
    definitionStepId: 'def-step-1',
    order: 1,
    name: 'Direct Manager',
    approver: { type: ApproverType.DIRECT_MANAGER },
    assignedUserId: 'user-1',
    status: WorkflowStepStatus.PENDING,
    actedByUserId: null,
    actedAt: null,
    comment: null,
    ...overrides,
  }
}

function makeInstance(steps: WorkflowStepInstance[]): WorkflowInstance {
  return {
    id: 'wf-inst-1',
    definitionId: 'wf-def-1',
    requestId: 'req-1',
    currentStepId: null,
    steps,
  }
}

describe('getCurrentStep', () => {
  it('returns the step whose status is CURRENT', () => {
    const current = makeStep({ id: 'step-2', order: 2, status: WorkflowStepStatus.CURRENT })
    const instance = makeInstance([
      makeStep({ id: 'step-1', order: 1, status: WorkflowStepStatus.APPROVED }),
      current,
      makeStep({ id: 'step-3', order: 3, status: WorkflowStepStatus.PENDING }),
    ])
    expect(getCurrentStep(instance)).toBe(current)
  })

  it('returns undefined when every step is already APPROVED (workflow complete)', () => {
    const instance = makeInstance([
      makeStep({ id: 'step-1', status: WorkflowStepStatus.APPROVED }),
      makeStep({ id: 'step-2', status: WorkflowStepStatus.APPROVED }),
    ])
    expect(getCurrentStep(instance)).toBeUndefined()
  })

  it('returns undefined when the workflow has no steps', () => {
    expect(getCurrentStep(makeInstance([]))).toBeUndefined()
  })

  it('returns undefined when the workflow was REJECTED before any step became CURRENT again', () => {
    const instance = makeInstance([
      makeStep({ id: 'step-1', status: WorkflowStepStatus.REJECTED }),
      makeStep({ id: 'step-2', status: WorkflowStepStatus.SKIPPED }),
    ])
    expect(getCurrentStep(instance)).toBeUndefined()
  })
})
