import { lazy } from 'react'

export const AppLayout = lazy(() => import('@/app/layouts/AppLayout').then((module) => ({ default: module.AppLayout })))
