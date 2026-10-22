import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router'
import { mockUsers, userIds } from '@/mock/users'
import { useAuthStore } from '@/store/authStore'
import { useLocaleStore } from '@/store/localeStore'
import { useDirectoryStore } from '@/store/directoryStore'
import { CompanyLandingPage } from './CompanyLandingPage'

describe('CompanyLandingPage', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
    useLocaleStore.setState({ locale: 'en' })
    useDirectoryStore.setState({ users: mockUsers })
    useAuthStore.setState({ currentUser: null, isInitializing: false })
  })

  it('does not publish employee profiles without their explicit consent', () => {
    useDirectoryStore.setState({
      users: mockUsers.map((user) => user.id === userIds.ahmedAyman ? { ...user, publicProfileVisible: false } : user),
    })
    render(
      <MemoryRouter>
        <CompanyLandingPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { level: 1, name: 'Technology that moves work forward.' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Meet the team' })).toBeInTheDocument()
    expect(screen.queryByText('أحمد أيمن')).not.toBeInTheDocument()
  })

  it('shows only consented profile details without exposing contact information', () => {
    render(
      <MemoryRouter>
        <CompanyLandingPage />
      </MemoryRouter>,
    )

    expect(screen.getByText('Abdelhamid Elsayed')).toBeInTheDocument()
    expect(screen.getByText('Mahmoud Ayman')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Mahmoud Ayman' })).toHaveAttribute('aria-label', 'Mahmoud Ayman')
    expect(screen.getByRole('img', { name: 'Mahmoud Ayman' }).querySelector('img')).toHaveAttribute('src', '/avatars/mahmoud-ayman.svg')
    expect(screen.queryByText('mahmoud.ayman@masar.local')).not.toBeInTheDocument()
    expect(Array.from(document.querySelectorAll('[data-testid="employee-job-title"]'), (title) => title.textContent?.trim()))
      .toEqual(['CEO', 'CTO', 'HRD', 'EM', 'PM', 'TL', 'SWE', 'HR'])
  })

  it('keeps one Codiksa external link and presents the team as technology company profiles', () => {
    render(
      <MemoryRouter>
        <CompanyLandingPage />
      </MemoryRouter>,
    )

    const codiksaLinks = screen.getAllByRole('link', { name: /Codiksa Services & Projects|مشاريع وخدمات Codiksa/i })
    expect(codiksaLinks).toHaveLength(1)
    expect(codiksaLinks[0]).toHaveAttribute('href', 'https://codiksa-theta.vercel.app/')
    expect(codiksaLinks[0]).toHaveAttribute('target', '_blank')
    expect(codiksaLinks[0]).toHaveAttribute('rel', 'noopener noreferrer')
    expect(document.querySelectorAll('.company-team-card')).toHaveLength(8)
    expect(screen.getAllByText('Team profile')).toHaveLength(8)
    expect(Array.from(document.querySelectorAll('[data-testid="employee-job-title"]'), (title) => title.textContent?.trim()))
      .toEqual(['CEO', 'CTO', 'HRD', 'EM', 'PM', 'TL', 'SWE', 'HR'])
  })

  it('orders the team from company leadership to department leaders and other employees', () => {
    render(
      <MemoryRouter>
        <CompanyLandingPage />
      </MemoryRouter>,
    )

    const employeeCards = screen.getByRole('list').querySelectorAll('li')
    const displayedNames = Array.from(employeeCards, (card) => card.querySelector('span.block.truncate')?.textContent?.trim())
    expect(displayedNames).toEqual([
      'Abdelhamid Elsayed',
      'Mahmoud Ayman',
      'Abdelrahman Ghoneim',
      'Abdelrahman Mohamed',
      'Mohamed Abdelfattah',
      'Ahmed Mohamed',
      'Ahmed Ayman',
      'Mostafa Kamel',
    ])
  })

  it('renders the animated technology workflow illustration with reduced-motion support', () => {
    render(
      <MemoryRouter>
        <CompanyLandingPage />
      </MemoryRouter>,
    )

    expect(document.querySelector('.company-flow-track')).toHaveAttribute('aria-hidden', 'true')
    expect(document.querySelectorAll('.company-flow-step')).toHaveLength(3)
    expect(document.querySelector('.company-flow-step-1')).toBeInTheDocument()
    expect(document.querySelector('.company-network-canvas')).toHaveAttribute('aria-hidden', 'true')
  })

  it('localizes team job titles for Arabic visitors', () => {
    useLocaleStore.setState({ locale: 'ar' })
    useAuthStore.setState({ currentUser: mockUsers.find((user) => user.id === userIds.ahmedAyman)!, isInitializing: false })
    render(
      <MemoryRouter>
        <CompanyLandingPage />
      </MemoryRouter>,
    )

    expect(screen.getByText('المدير التقني')).toBeInTheDocument()
    expect(screen.getByText('الرئيس التنفيذي ومالك الشركة')).toBeInTheDocument()
    expect(screen.getByText('محمود أيمن')).toBeInTheDocument()
    expect([
      'أحمد أيمن',
      'أحمد محمد',
      'عبدالرحمن محمد',
      'مصطفى كامل',
      'عبدالرحمن غنيم',
      'عبدالحميد السيد',
      'محمد عبدالفتاح',
      'محمود أيمن',
    ].every((name) => screen.getByText(name))).toBe(true)
    expect(Array.from(document.querySelectorAll('[data-testid="employee-job-title"]'), (title) => title.textContent?.trim()))
      .toEqual([
        'الرئيس التنفيذي ومالك الشركة',
        'المدير التقني',
        'مدير إدارة الموارد البشرية',
        'مدير قسم الهندسة',
        'مدير المنتجات',
        'قائد فريق الهندسة',
        'مهندس برمجيات',
        'أخصائي الموارد البشرية',
      ])
    expect(document.querySelectorAll('.company-team-card [aria-label^="اختصار المسمى الوظيفي:"]')).toHaveLength(0)
    expect(screen.queryByText('Mahmoud Ayman')).not.toBeInTheDocument()
    expect(screen.queryByText(/مرحبًا بعودتك|Welcome back/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'افتح مساحة العمل' })).not.toBeInTheDocument()
  })

  it('omits the returning-user greeting and has no workspace shortcut', () => {
    useAuthStore.setState({ currentUser: mockUsers.find((user) => user.id === userIds.ahmedAyman)!, isInitializing: false })
    render(
      <MemoryRouter>
        <CompanyLandingPage />
      </MemoryRouter>,
    )

    expect(screen.queryByText(/Welcome back/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /workspace/i })).not.toBeInTheDocument()
    expect(document.querySelector('a[href="/dashboard"]')).toBeNull()
    expect(screen.queryByRole('heading', { name: 'New to Masar?' })).not.toBeInTheDocument()
  })

  it('has no sign-in or registration controls for guests', () => {
    render(
      <MemoryRouter>
        <CompanyLandingPage />
      </MemoryRouter>,
    )

    expect(screen.queryByRole('heading', { name: 'New to Masar?' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Request an account' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /sign in/i })).not.toBeInTheDocument()
    expect(document.querySelector('a[href="/login"], a[href="/register"]')).toBeNull()
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
  })

  it('shows every member\'s bio to guests on the team cards', () => {
    render(
      <MemoryRouter>
        <CompanyLandingPage />
      </MemoryRouter>,
    )

    const bios = Array.from(document.querySelectorAll('[data-testid="employee-bio"]'), (node) => node.textContent?.trim())
    expect(bios).toHaveLength(8)
    expect(bios.every((bio) => bio && !/[\u0600-\u06FF]/.test(bio))).toBe(true)
    expect(screen.getByText(/CEO and founder of Masar/)).toBeInTheDocument()
  })

  it('shows experience, qualifications and certifications to guests, in the interface language', () => {
    render(
      <MemoryRouter>
        <CompanyLandingPage />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: /Mahmoud Ayman/ }))
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByText('Chief Technology Officer', { selector: 'h5' })).toBeInTheDocument()
    expect(within(dialog).getByText('M.Sc. in Computer Science and Artificial Intelligence')).toBeInTheDocument()
    expect(within(dialog).getByText('Professional Cloud Architect')).toBeInTheDocument()
    expect(within(dialog).queryByText(/Employee entrance/i)).not.toBeInTheDocument()
    expect(/[\u0600-\u06FF]/.test(dialog.textContent ?? '')).toBe(false)
  })

  it('shows the same details in Arabic when the interface is Arabic', () => {
    useLocaleStore.setState({ locale: 'ar' })
    render(
      <MemoryRouter>
        <CompanyLandingPage />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: /محمود أيمن/ }))
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByText('ماجستير علوم الحاسب والذكاء الاصطناعي')).toBeInTheDocument()
    expect(within(dialog).getByText('المدير التقني', { selector: 'h5' })).toBeInTheDocument()
    expect(within(dialog).queryByText('Chief Technology Officer')).not.toBeInTheDocument()
  })
})
