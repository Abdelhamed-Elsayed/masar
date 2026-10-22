import { Suspense } from 'react'
import type { ReactNode } from 'react'
import { Spinner } from '@/components/ui'

export function PublicPage({ children }: { children: ReactNode }) {
  return <Suspense fallback={<div className="grid min-h-svh place-items-center bg-[#071c30]"><Spinner size="lg" label="Loading" /></div>}>{children}</Suspense>
}
