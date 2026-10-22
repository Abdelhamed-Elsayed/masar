import { ArrowDown } from 'lucide-react'

export function WorkflowConnector() {
  return (
    <div className="flex h-10 items-center justify-center text-slate-400" aria-hidden="true">
      <span className="h-full border-s-2 border-dashed border-slate-300" />
      <ArrowDown className="-ms-2 size-4 bg-white" />
    </div>
  )
}
