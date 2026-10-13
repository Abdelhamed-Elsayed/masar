import { RequestStatus } from '@/types/request'
import type { Request } from '@/types/request'
import { departmentIds } from './departments'
import { userIds } from './users'
import { requestTypeIds, workflowInstanceIds } from './workflows'

export const mockRequests: Request[] = [
  {
    id: 'req-1042',
    referenceCode: 'REQ-1042',
    title: 'Leave Request',
    requestTypeId: requestTypeIds.leave,
    requesterId: userIds.adam,
    departmentId: departmentIds.engineering,
    status: RequestStatus.IN_PROGRESS,
    workflowInstanceId: workflowInstanceIds.req1042,
    submittedAt: '2026-09-17T14:22:00.000Z',
    createdAt: '2026-09-17T13:05:00.000Z',
    updatedAt: '2026-09-19T11:40:00.000Z',
    fields: {
      leaveType: 'Annual',
      startDate: '2026-10-05',
      endDate: '2026-10-09',
      reason: 'Family travel',
    },
    attachments: [
      {
        id: 'att-1042-1',
        fileName: 'travel-itinerary.pdf',
        fileSize: 184320,
        uploadedAt: '2026-09-17T13:50:00.000Z',
      },
    ],
  },
  {
    id: 'req-1043',
    referenceCode: 'REQ-1043',
    title: 'Laptop replacement',
    requestTypeId: requestTypeIds.equipment,
    requesterId: userIds.daniel,
    departmentId: departmentIds.engineering,
    status: RequestStatus.IN_PROGRESS,
    workflowInstanceId: workflowInstanceIds.req1043,
    submittedAt: '2026-09-22T07:40:00.000Z',
    createdAt: '2026-09-21T16:10:00.000Z',
    updatedAt: '2026-09-22T08:05:00.000Z',
    fields: {
      item: 'MacBook Pro 14"',
      quantity: 1,
      justification: 'Current device battery health is below 70%.',
    },
    attachments: [],
  },
  {
    id: 'req-1044',
    referenceCode: 'REQ-1044',
    title: 'Leave Request',
    requestTypeId: requestTypeIds.leave,
    requesterId: userIds.emma,
    departmentId: departmentIds.engineering,
    status: RequestStatus.APPROVED,
    workflowInstanceId: workflowInstanceIds.req1044,
    submittedAt: '2026-09-09T09:00:00.000Z',
    createdAt: '2026-09-08T18:12:00.000Z',
    updatedAt: '2026-09-12T16:45:00.000Z',
    fields: {
      leaveType: 'Annual',
      startDate: '2026-09-20',
      endDate: '2026-09-22',
      reason: 'Personal',
    },
    attachments: [],
  },
  {
    id: 'req-1045',
    referenceCode: 'REQ-1045',
    title: 'Leave Request',
    requestTypeId: requestTypeIds.leave,
    requesterId: userIds.adam,
    departmentId: departmentIds.engineering,
    status: RequestStatus.DRAFT,
    workflowInstanceId: null,
    submittedAt: null,
    createdAt: '2026-09-24T08:30:00.000Z',
    updatedAt: '2026-09-24T08:30:00.000Z',
    fields: {
      leaveType: 'Sick',
      startDate: '2026-09-28',
      endDate: '2026-09-28',
      reason: null,
    },
    attachments: [],
  },
]
