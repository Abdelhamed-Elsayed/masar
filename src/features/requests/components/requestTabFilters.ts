import { RequestStatus } from '@/types/request'
import type { Request } from '@/types/request'

export type RequestTab = 'all' | 'pending' | 'approved' | 'rejected' | 'drafts'

export function getRequestTabFilter(tab: RequestTab): (request: Request) => boolean {
  switch (tab) {
    case 'pending':
      return (request) =>
        request.status === RequestStatus.SUBMITTED ||
        request.status === RequestStatus.IN_PROGRESS
    case 'approved':
      return (request) => request.status === RequestStatus.APPROVED
    case 'rejected':
      return (request) => request.status === RequestStatus.REJECTED
    case 'drafts':
      return (request) => request.status === RequestStatus.DRAFT
    case 'all':
      return () => true
  }
}
