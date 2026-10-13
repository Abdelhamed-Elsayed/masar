import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { mockWorkflowDefinitions, mockWorkflowInstances } from '@/mock/workflows'
import { normalizeLegacyUserId } from '@/mock/legacyUserIdMigration'
import type { WorkflowDefinition, WorkflowInstance, WorkflowStepDefinition } from '@/types/workflow'

interface WorkflowState {
  definitions: WorkflowDefinition[]
  instances: WorkflowInstance[]
  hydrateDefinitions: () => Promise<void>
  getDefinitionById: (id: string) => WorkflowDefinition | undefined
  upsertDefinition: (definition: WorkflowDefinition) => void
  getInstanceById: (id: string) => WorkflowInstance | undefined
  getInstanceByRequestId: (requestId: string) => WorkflowInstance | undefined
  addInstance: (instance: WorkflowInstance) => void
  updateInstance: (instance: WorkflowInstance) => void
}

export const useWorkflowStore = create<WorkflowState>()(
  persist(
    (set, get) => ({
      definitions: mockWorkflowDefinitions,
      instances: mockWorkflowInstances,
      hydrateDefinitions: async () => undefined,
      getDefinitionById: (id) => get().definitions.find((item) => item.id === id),
      upsertDefinition: (definition) => set((state) => ({
        definitions: state.definitions.some((item) => item.id === definition.id)
          ? state.definitions.map((item) => item.id === definition.id ? definition : item)
          : [...state.definitions, definition],
      })),
      getInstanceById: (id) => get().instances.find((item) => item.id === id),
      getInstanceByRequestId: (requestId) => get().instances.find((item) => item.requestId === requestId),
      addInstance: (instance) => set((state) => ({
        instances: state.instances.some((item) => item.id === instance.id)
          ? state.instances.map((item) => item.id === instance.id ? instance : item)
          : [...state.instances, instance],
      })),
      updateInstance: (instance) => set((state) => ({
        instances: state.instances.map((item) => item.id === instance.id ? instance : item),
      })),
    }),
    {
      name: 'masar-workflows',
      version: 2,
      migrate: (persisted) => {
        const state = persisted as Partial<WorkflowState>
        const remapApprover = (approver: WorkflowStepDefinition['approver']): WorkflowStepDefinition['approver'] =>
          'userId' in approver ? { ...approver, userId: normalizeLegacyUserId(approver.userId) ?? approver.userId } : approver
        const definitions = (state.definitions ?? mockWorkflowDefinitions).map((definition) => ({
          ...definition,
          steps: definition.steps.map((step) => ({ ...step, approver: remapApprover(step.approver) })),
        }))
        const instances = (state.instances ?? mockWorkflowInstances).map((instance) => ({
          ...instance,
          steps: instance.steps.map((step) => ({
            ...step,
            approver: remapApprover(step.approver),
            assignedUserId: normalizeLegacyUserId(step.assignedUserId) ?? null,
            actedByUserId: normalizeLegacyUserId(step.actedByUserId) ?? null,
          })),
        }))
        return { ...state, definitions, instances }
      },
    },
  ),
)
