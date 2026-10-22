import { WorkflowStepStatus } from '@/types/workflow'
import type { WorkflowInstance, WorkflowStepInstance } from '@/types/workflow'

export function getCurrentStep(
  instance: WorkflowInstance,
): WorkflowStepInstance | undefined {
  return instance.steps.find((step) => step.status === WorkflowStepStatus.CURRENT)
}
