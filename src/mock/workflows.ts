import { ApproverType, WorkflowStepStatus } from '@/types/workflow'
import type {
  WorkflowDefinition,
  WorkflowInstance,
} from '@/types/workflow'
import type { RequestType } from '@/types/request'
import { roleIds, userIds } from './users'
import { departmentIds } from './departments'

export const requestTypeIds = {
  leave: 'request-type-leave',
  equipment: 'request-type-equipment',
  financial: 'request-type-financial',
  maintenance: 'request-type-maintenance',
} as const

export const workflowDefinitionIds = {
  employeeLeave: 'workflow-employee-leave',
  departmentHeadEquipment: 'workflow-department-head-equipment',
} as const

export const mockRequestTypes: RequestType[] = [
  {
    id: requestTypeIds.leave,
    name: 'Leave Request',
    code: 'LEAVE',
    description: 'Annual, sick, or unpaid leave submitted by an employee',
    workflowDefinitionId: workflowDefinitionIds.employeeLeave,
    formDefinitionId: 'form-leave',
  },
  {
    id: requestTypeIds.equipment,
    name: 'Equipment Request',
    code: 'EQUIPMENT',
    description: 'Hardware or software requested by a department manager',
    workflowDefinitionId: workflowDefinitionIds.departmentHeadEquipment,
    formDefinitionId: 'form-equipment',
  },
  {
    id: requestTypeIds.financial,
    name: 'Financial Request',
    code: 'FINANCIAL',
    description: 'Submit a reimbursement or other financial request.',
    workflowDefinitionId: workflowDefinitionIds.employeeLeave,
    formDefinitionId: 'form-leave',
  },
  {
    id: requestTypeIds.maintenance,
    name: 'Maintenance Request',
    code: 'MAINTENANCE',
    description: 'Report a facilities or equipment maintenance need.',
    workflowDefinitionId: workflowDefinitionIds.departmentHeadEquipment,
    formDefinitionId: 'form-equipment',
  },
]

export const mockWorkflowDefinitions: WorkflowDefinition[] = [
  {
    id: workflowDefinitionIds.employeeLeave,
    name: 'Employee leave approval',
    description:
      'Employee → Direct Manager → HR → Department Manager → CEO Representative',
    requestTypeId: requestTypeIds.leave,
    steps: [
      {
        id: 'wdef-leave-step-manager',
        order: 1,
        name: 'Direct Manager',
        approver: { type: ApproverType.DIRECT_MANAGER },
      },
      {
        id: 'wdef-leave-step-hr',
        order: 2,
        name: 'HR',
        approver: { type: ApproverType.ROLE, roleId: roleIds.hr },
      },
      {
        id: 'wdef-leave-step-dept',
        order: 3,
        name: 'Department Manager',
        approver: { type: ApproverType.DEPARTMENT_HEAD },
      },
      {
        id: 'wdef-leave-step-ceo',
        order: 4,
        name: 'CEO Representative',
        approver: {
          type: ApproverType.REPRESENTATIVE,
          userId: userIds.james,
        },
      },
    ],
  },
  {
    id: workflowDefinitionIds.departmentHeadEquipment,
    name: 'Department manager equipment approval',
    description: 'Department Manager → HR → CEO Representative',
    requestTypeId: requestTypeIds.equipment,
    steps: [
      {
        id: 'wdef-equip-step-dept',
        order: 1,
        name: 'Department Manager',
        approver: { type: ApproverType.DEPARTMENT_HEAD },
      },
      {
        id: 'wdef-equip-step-hr',
        order: 2,
        name: 'HR',
        approver: { type: ApproverType.DEPARTMENT, departmentId: departmentIds.hr },
      },
      {
        id: 'wdef-equip-step-ceo',
        order: 3,
        name: 'CEO Representative',
        approver: {
          type: ApproverType.REPRESENTATIVE,
          userId: userIds.james,
        },
      },
    ],
  },
]

export const workflowInstanceIds = {
  req1042: 'wf-inst-req-1042',
  req1043: 'wf-inst-req-1043',
  req1044: 'wf-inst-req-1044',
} as const

export const mockWorkflowInstances: WorkflowInstance[] = [
  {
    id: workflowInstanceIds.req1042,
    definitionId: workflowDefinitionIds.employeeLeave,
    requestId: 'req-1042',
    currentStepId: 'wf-inst-req-1042-step-dept',
    steps: [
      {
        id: 'wf-inst-req-1042-step-manager',
        definitionStepId: 'wdef-leave-step-manager',
        order: 1,
        name: 'Direct Manager',
        approver: { type: ApproverType.DIRECT_MANAGER },
        assignedUserId: userIds.sarah,
        status: WorkflowStepStatus.APPROVED,
        actedByUserId: userIds.sarah,
        actedAt: '2026-09-18T09:12:00.000Z',
        comment: 'Coverage confirmed with the team.',
      },
      {
        id: 'wf-inst-req-1042-step-hr',
        definitionStepId: 'wdef-leave-step-hr',
        order: 2,
        name: 'HR',
        approver: { type: ApproverType.ROLE, roleId: roleIds.hr },
        assignedUserId: userIds.maya,
        status: WorkflowStepStatus.APPROVED,
        actedByUserId: userIds.maya,
        actedAt: '2026-09-19T11:40:00.000Z',
        comment: 'Leave balance is sufficient.',
      },
      {
        id: 'wf-inst-req-1042-step-dept',
        definitionStepId: 'wdef-leave-step-dept',
        order: 3,
        name: 'Department Manager',
        approver: { type: ApproverType.DEPARTMENT_HEAD },
        assignedUserId: userIds.daniel,
        status: WorkflowStepStatus.CURRENT,
        actedByUserId: null,
        actedAt: null,
        comment: null,
      },
      {
        id: 'wf-inst-req-1042-step-ceo',
        definitionStepId: 'wdef-leave-step-ceo',
        order: 4,
        name: 'CEO Representative',
        approver: {
          type: ApproverType.REPRESENTATIVE,
          userId: userIds.james,
        },
        assignedUserId: userIds.james,
        status: WorkflowStepStatus.PENDING,
        actedByUserId: null,
        actedAt: null,
        comment: null,
      },
    ],
  },
  {
    id: workflowInstanceIds.req1043,
    definitionId: workflowDefinitionIds.departmentHeadEquipment,
    requestId: 'req-1043',
    currentStepId: 'wf-inst-req-1043-step-hr',
    steps: [
      {
        id: 'wf-inst-req-1043-step-dept',
        definitionStepId: 'wdef-equip-step-dept',
        order: 1,
        name: 'Department Manager',
        approver: { type: ApproverType.DEPARTMENT_HEAD },
        assignedUserId: userIds.daniel,
        status: WorkflowStepStatus.APPROVED,
        actedByUserId: userIds.daniel,
        actedAt: '2026-09-22T08:05:00.000Z',
        comment: 'Required for the Q4 delivery team.',
      },
      {
        id: 'wf-inst-req-1043-step-hr',
        definitionStepId: 'wdef-equip-step-hr',
        order: 2,
        name: 'HR',
        approver: { type: ApproverType.DEPARTMENT, departmentId: departmentIds.hr },
        assignedUserId: userIds.olivia,
        status: WorkflowStepStatus.CURRENT,
        actedByUserId: null,
        actedAt: null,
        comment: null,
      },
      {
        id: 'wf-inst-req-1043-step-ceo',
        definitionStepId: 'wdef-equip-step-ceo',
        order: 3,
        name: 'CEO Representative',
        approver: {
          type: ApproverType.REPRESENTATIVE,
          userId: userIds.james,
        },
        assignedUserId: userIds.james,
        status: WorkflowStepStatus.PENDING,
        actedByUserId: null,
        actedAt: null,
        comment: null,
      },
    ],
  },
  {
    id: workflowInstanceIds.req1044,
    definitionId: workflowDefinitionIds.employeeLeave,
    requestId: 'req-1044',
    currentStepId: null,
    steps: [
      {
        id: 'wf-inst-req-1044-step-manager',
        definitionStepId: 'wdef-leave-step-manager',
        order: 1,
        name: 'Direct Manager',
        approver: { type: ApproverType.DIRECT_MANAGER },
        assignedUserId: userIds.daniel,
        status: WorkflowStepStatus.APPROVED,
        actedByUserId: userIds.daniel,
        actedAt: '2026-09-10T10:00:00.000Z',
        comment: null,
      },
      {
        id: 'wf-inst-req-1044-step-hr',
        definitionStepId: 'wdef-leave-step-hr',
        order: 2,
        name: 'HR',
        approver: { type: ApproverType.ROLE, roleId: roleIds.hr },
        assignedUserId: userIds.maya,
        status: WorkflowStepStatus.APPROVED,
        actedByUserId: userIds.maya,
        actedAt: '2026-09-10T14:20:00.000Z',
        comment: null,
      },
      {
        id: 'wf-inst-req-1044-step-dept',
        definitionStepId: 'wdef-leave-step-dept',
        order: 3,
        name: 'Department Manager',
        approver: { type: ApproverType.DEPARTMENT_HEAD },
        assignedUserId: userIds.daniel,
        status: WorkflowStepStatus.APPROVED,
        actedByUserId: userIds.daniel,
        actedAt: '2026-09-11T09:00:00.000Z',
        comment: null,
      },
      {
        id: 'wf-inst-req-1044-step-ceo',
        definitionStepId: 'wdef-leave-step-ceo',
        order: 4,
        name: 'CEO Representative',
        approver: {
          type: ApproverType.REPRESENTATIVE,
          userId: userIds.james,
        },
        assignedUserId: userIds.james,
        status: WorkflowStepStatus.APPROVED,
        actedByUserId: userIds.james,
        actedAt: '2026-09-12T16:45:00.000Z',
        comment: 'Approved.',
      },
    ],
  },
]
