import type { Role } from '@/types/auth'
import type { User } from '@/types/user'
import { profileTranslations } from './profileTranslations'

export const roleIds = {
  employee: 'role-employee',
  manager: 'role-manager',
  hr: 'role-hr',
  departmentHead: 'role-department-head',
  ceoRepresentative: 'role-ceo-representative',
  admin: 'role-admin',
  ceo: 'role-ceo',
  approver: 'role-approver',
} as const

export const mockRoles: Role[] = [
  {
    id: roleIds.employee,
    name: 'Employee',
    code: 'EMPLOYEE',
    description: 'Can create and track personal requests',
  },
  {
    id: roleIds.manager,
    name: 'Direct Manager',
    code: 'MANAGER',
    description: 'Approves requests for direct reports',
  },
  {
    id: roleIds.hr,
    name: 'HR',
    code: 'HR',
    description: 'Reviews requests from a human-resources perspective',
  },
  {
    id: roleIds.departmentHead,
    name: 'Department Head',
    code: 'DEPARTMENT_HEAD',
    description: 'Approves requests for a department',
  },
  {
    id: roleIds.ceoRepresentative,
    name: 'CEO Representative',
    code: 'CEO_REPRESENTATIVE',
    description: 'Final executive approval on behalf of the CEO',
  },
  {
    id: roleIds.admin,
    name: 'Administrator',
    code: 'ADMIN',
    description: 'Manages users, workflows, and system configuration',
  },
  {
    id: roleIds.ceo,
    name: 'CEO & Company Owner',
    code: 'CEO',
    description: 'Ultimate company control over people, access, workflows, and approvals',
  },
  {
    id: roleIds.approver,
    name: 'Approver',
    code: 'APPROVER',
    description: 'Can review and approve assigned workflow steps',
  },
]

export const userIds = {
  ahmedAyman: 'user-ahmed-ayman',
  ahmedMohamed: 'user-ahmed-mohamed',
  abdelrahmanMohamed: 'user-abdelrahman-mohamed',
  mostafaKamel: 'user-mostafa-kamel',
  abdelrahmanGhoneim: 'user-abdelrahman-ghoneim',
  abdelhamid: 'user-abdelhamid',
  mohamedAbdelfattah: 'user-mohamed-abdelfattah',
  mahmoudAyman: 'user-mahmoud-ayman',
  adam: 'user-ahmed-ayman',
  sarah: 'user-ahmed-mohamed',
  daniel: 'user-abdelrahman-mohamed',
  maya: 'user-mostafa-kamel',
  olivia: 'user-abdelrahman-ghoneim',
  james: 'user-abdelhamid',
  emma: 'user-mohamed-abdelfattah',
} as const

const seedUsers: User[] = [
  {
    id: userIds.ahmedAyman,
    employeeId: 'EMP-1021',
    firstName: 'أحمد',
    lastName: 'أيمن',
    fullName: 'أحمد أيمن',
    email: 'ahmed.ayman@masar.local',
    jobTitle: 'Software Engineer',
    departmentId: 'dept-developing-team',
    managerId: userIds.mahmoudAyman,
    roleIds: [roleIds.employee],
    isActive: true,
    avatarUrl: '/avatars/ahmed-ayman.svg',
    publicProfileVisible: true,
    profile: {
      bio: 'مهندس برمجيات متخصص في بناء واجهات المستخدم التفاعلية والأنظمة السحابية القابلة للتوسع. شغوف بتطوير تجارب مستخدم سريعة وعالية الكفاءة.',
      experiences: [
        {
          id: 'exp-1',
          role: 'Software Engineer',
          company: 'Masar Technologies',
          period: '2023 - Present',
          description: 'تطوير وتحديث منصة إدارة مسارات العمل وبناء مكونات الواجهة المتقدمة بنظام التصميم العصري.',
        },
        {
          id: 'exp-2',
          role: 'Frontend Developer',
          company: 'Tech Solutions Hub',
          period: '2021 - 2023',
          description: 'بناء تطبيقات ويب متكاملة باستخدام React و TypeScript وتحسين سرعة الأداء.',
        },
      ],
      skills: ['TypeScript', 'React', 'Tailwind CSS', 'Vite', 'State Management', 'REST APIs'],
      education: [
        {
          id: 'edu-1',
          degree: 'بكالوريوس علوم الحاسب (B.Sc. Computer Science)',
          institution: 'جامعة القاهرة',
          year: '2021',
        },
      ],
      certifications: [
        {
          id: 'cert-1',
          title: 'AWS Certified Solutions Architect',
          issuer: 'Amazon Web Services',
          year: '2023',
        },
        {
          id: 'cert-2',
          title: 'Meta Frontend Developer Professional Certificate',
          issuer: 'Meta / Coursera',
          year: '2022',
        },
      ],
    },
  },
  {
    id: userIds.ahmedMohamed,
    employeeId: 'EMP-0884',
    firstName: 'أحمد',
    lastName: 'محمد',
    fullName: 'أحمد محمد',
    email: 'ahmed.mohamed@masar.local',
    jobTitle: 'Engineering Team Lead',
    departmentId: 'dept-engineering',
    managerId: userIds.abdelrahmanMohamed,
    roleIds: [roleIds.employee, roleIds.manager, roleIds.approver],
    isActive: true,
    avatarUrl: '/avatars/ahmed-mohamed.svg',
    publicProfileVisible: true,
    profile: {
      bio: 'قائد فريق هندسي متميز في توجيه الفرق البرمجية وتصميم المعماريات عالية الأداء ومتابعة معايير الكود وجودة التسليم.',
      experiences: [
        {
          id: 'exp-3',
          role: 'Engineering Team Lead',
          company: 'Masar Technologies',
          period: '2022 - Present',
          description: 'قيادة فريق التطوير وإدارة دورات إطلاق الميزات ومراجعة البنية الهندسية للمشروع.',
        },
        {
          id: 'exp-4',
          role: 'Senior Software Engineer',
          company: 'Alpha Cloud Systems',
          period: '2019 - 2022',
          description: 'تطوير أنظمة الخدمات المصغرة ومراقبة الأداء واختبارات التكامل.',
        },
      ],
      skills: ['Team Leadership', 'System Design', 'React & Next.js', 'TypeScript', 'Docker', 'Agile/Scrum'],
      education: [
        {
          id: 'edu-2',
          degree: 'بكالوريوس هندسة الحاسبات ونظم التحكم',
          institution: 'جامعة عين شمس',
          year: '2019',
        },
      ],
      certifications: [
        {
          id: 'cert-3',
          title: 'Certified ScrumMaster (CSM)',
          issuer: 'Scrum Alliance',
          year: '2023',
        },
      ],
    },
  },
  {
    id: userIds.abdelrahmanMohamed,
    employeeId: 'EMP-0412',
    firstName: 'عبدالرحمن',
    lastName: 'محمد',
    fullName: 'عبدالرحمن محمد',
    email: 'abdelrahman.mohamed@masar.local',
    jobTitle: 'Engineering Department Manager',
    departmentId: 'dept-engineering',
    managerId: userIds.abdelhamid,
    roleIds: [roleIds.employee, roleIds.manager, roleIds.departmentHead, roleIds.approver],
    isActive: true,
    avatarUrl: '/avatars/abdelrahman-mohamed.svg',
    publicProfileVisible: true,
    profile: {
      bio: 'مدير إدارة الهندسة في مسار. خبير في إدارة المشاريع الهندسية الضخمة وقيادة الفرق التقنية واستراتيجيات البنية التحتية.',
      experiences: [
        {
          id: 'exp-5',
          role: 'Engineering Department Manager',
          company: 'Masar Technologies',
          period: '2021 - Present',
          description: 'الإشراف على كافة العمليات الهندسية وضمان التوافق بين الأهداف التقنية والتجارية.',
        },
      ],
      skills: ['Engineering Management', 'Enterprise Architecture', 'Cloud Infrastructure', 'Budgeting & Strategy'],
      education: [
        {
          id: 'edu-3',
          degree: 'ماجستير إدارة الأعمال (MBA) & بكالوريوس الهندسة',
          institution: 'جامعة القاهرة',
          year: '2018',
        },
      ],
      certifications: [
        {
          id: 'cert-4',
          title: 'Project Management Professional (PMP)',
          issuer: 'PMI',
          year: '2020',
        },
      ],
    },
  },
  {
    id: userIds.mostafaKamel,
    employeeId: 'EMP-0733',
    firstName: 'مصطفى',
    lastName: 'كامل',
    fullName: 'مصطفى كامل',
    email: 'mostafa.kamel@masar.local',
    jobTitle: 'HR Specialist',
    departmentId: 'dept-hr',
    managerId: userIds.olivia,
    roleIds: [roleIds.employee, roleIds.hr, roleIds.approver],
    isActive: true,
    avatarUrl: '/avatars/mostafa-kamel.svg',
    publicProfileVisible: true,
    profile: {
      bio: 'أخصائي موارد بشرية مكرس لدعم الموظفين وإدارة عمليات التعيين والتقييم وتحسين تجربة بيئة العمل.',
      experiences: [
        {
          id: 'exp-6',
          role: 'HR Specialist',
          company: 'Masar Technologies',
          period: '2023 - Present',
          description: 'إدارة ملفات التوظيف ومتابعة طلبات الموظفين ومراجعات الأداء.',
        },
      ],
      skills: ['Talent Acquisition', 'Employee Relations', 'HR Analytics', 'Onboarding & Training'],
      education: [
        {
          id: 'edu-4',
          degree: 'بكالوريوس إدارة الأعمال والموارد البشرية',
          institution: 'جامعة حلوان',
          year: '2022',
        },
      ],
      certifications: [
        {
          id: 'cert-5',
          title: 'SHRM Certified Professional (SHRM-CP)',
          issuer: 'SHRM',
          year: '2024',
        },
      ],
    },
  },
  {
    id: userIds.abdelrahmanGhoneim,
    employeeId: 'EMP-0301',
    firstName: 'عبدالرحمن',
    lastName: 'غنيم',
    fullName: 'عبدالرحمن غنيم',
    email: 'abdelrahman.ghoneim@masar.local',
    jobTitle: 'HR Director',
    departmentId: 'dept-hr',
    managerId: userIds.abdelhamid,
    roleIds: [roleIds.employee, roleIds.hr, roleIds.departmentHead, roleIds.approver],
    isActive: true,
    avatarUrl: '/avatars/abdelrahman-ghoneim.svg',
    publicProfileVisible: true,
    profile: {
      bio: 'مدير الموارد البشرية، قائد التحول المؤسسي وتطوير سياسات العمل واستقطاب الكفاءات القيادية.',
      experiences: [
        {
          id: 'exp-7',
          role: 'HR Director',
          company: 'Masar Technologies',
          period: '2020 - Present',
          description: 'توجيه استراتيجيات رأس المال البشري وتطوير بيئة العمل الداعمة للابتكار.',
        },
      ],
      skills: ['Human Capital Strategy', 'Organizational Development', 'Executive Leadership', 'Labor Law'],
      education: [
        {
          id: 'edu-5',
          degree: 'ماجستير إدارة الموارد البشرية',
          institution: 'الجامعة الأمريكية بالقاهرة',
          year: '2017',
        },
      ],
      certifications: [
        {
          id: 'cert-6',
          title: 'Senior Professional in Human Resources (SPHR)',
          issuer: 'HRCI',
          year: '2019',
        },
      ],
    },
  },
  {
    id: userIds.abdelhamid,
    employeeId: 'EMP-0008',
    firstName: 'Abdelhamid',
    lastName: 'Elsayed',
    fullName: 'Abdelhamid Elsayed',
    email: 'abdelhamid@masar.local',
    jobTitle: 'CEO & Company Owner',
    departmentId: 'dept-executive',
    managerId: null,
    roleIds: [roleIds.employee, roleIds.ceoRepresentative, roleIds.admin, roleIds.ceo, roleIds.approver],
    isActive: true,
    avatarUrl: '/avatars/abdelhamid-elsayed.svg',
    publicProfileVisible: true,
    profile: {
      bio: 'الرئيس التنفيذي ومؤسس مسار. ريادي أعمال ذو رؤية مستقبلية تهدف إلى إعادة ابتكار إدارة الأعمال وتسهيل تدفق العمل للفرق الطموحة.',
      experiences: [
        {
          id: 'exp-8',
          role: 'CEO & Founder',
          company: 'Masar Technologies',
          period: '2018 - Present',
          description: 'قيادة الرؤية والنمو الاستراتيجي وبناء الشراكات التقنية والاستثمارية.',
        },
      ],
      skills: ['Executive Leadership', 'Business Growth', 'Product Innovation', 'Corporate Governance'],
      education: [
        {
          id: 'edu-6',
          degree: 'بكالوريوس الهندسة وإدارة الأعمال',
          institution: 'جامعة القاهرة',
          year: '2014',
        },
      ],
      certifications: [
        {
          id: 'cert-7',
          title: 'Executive Leadership Program',
          issuer: 'Harvard Business School Online',
          year: '2021',
        },
      ],
    },
  },
  {
    id: userIds.mahmoudAyman,
    employeeId: 'EMP-1201',
    firstName: 'محمود',
    lastName: 'أيمن',
    fullName: 'محمود أيمن',
    email: 'mahmoud.ayman@masar.local',
    jobTitle: 'Chief Technology Officer',
    departmentId: 'dept-developing-team',
    managerId: userIds.abdelhamid,
    roleIds: [roleIds.employee, roleIds.manager, roleIds.departmentHead, roleIds.approver],
    isActive: true,
    avatarUrl: '/avatars/mahmoud-ayman.svg',
    publicProfileVisible: true,
    profile: {
      bio: 'المدير التقني لمنصة مسار. خبير في تصميم الأنظمة الموزعة، أمن المعلومات، وهندسة البرمجيات السحابية الحديثة.',
      experiences: [
        {
          id: 'exp-9',
          role: 'Chief Technology Officer',
          company: 'Masar Technologies',
          period: '2019 - Present',
          description: 'توجيه خارطة الطريق التقنية ومعمارية المنصة وإدارة فرق البحث والتطوير.',
        },
      ],
      skills: ['Cloud Architecture', 'TypeScript & Rust', 'Distributed Systems', 'Cybersecurity', 'AI Systems'],
      education: [
        {
          id: 'edu-7',
          degree: 'ماجستير علوم الحاسب والذكاء الاصطناعي',
          institution: 'جامعة القاهرة',
          year: '2017',
        },
      ],
      certifications: [
        {
          id: 'cert-8',
          title: 'Professional Cloud Architect',
          issuer: 'Google Cloud',
          year: '2022',
        },
      ],
    },
  },
  {
    id: userIds.mohamedAbdelfattah,
    employeeId: 'EMP-1104',
    firstName: 'محمد',
    lastName: 'عبدالفتاح',
    fullName: 'محمد عبدالفتاح',
    email: 'mohamed.abdelfattah@masar.local',
    jobTitle: 'Product Manager',
    departmentId: 'dept-developing-team',
    managerId: userIds.mahmoudAyman,
    roleIds: [roleIds.employee, roleIds.departmentHead, roleIds.approver],
    isActive: true,
    avatarUrl: '/avatars/mohamed-abdelfattah.svg',
    publicProfileVisible: true,
    profile: {
      bio: 'مدير منتجات يجمع بين الشغف بتجربة المستخدم والتحليل الدقيق للبيانات لتطوير حلول رقمية تلبي احتياجات العملاء بدقة.',
      experiences: [
        {
          id: 'exp-10',
          role: 'Product Manager',
          company: 'Masar Technologies',
          period: '2022 - Present',
          description: 'تحديد متطلبات المنتجات وتنسيق العمل مع فرق الهندسة والتصميم وتتبع مؤشرات الأداء.',
        },
      ],
      skills: ['Product Management', 'UX/UI Research', 'Agile Roadmapping', 'Data-Driven Decision Making'],
      education: [
        {
          id: 'edu-8',
          degree: 'بكالوريوس نظم المعلومات الإدارية (MIS)',
          institution: 'جامعة القاهرة',
          year: '2020',
        },
      ],
      certifications: [
        {
          id: 'cert-9',
          title: 'Certified Product Manager (CPM)',
          issuer: 'Pragmatic Institute',
          year: '2023',
        },
      ],
    },
  },
]

/** Every seeded employee profile carries a full Arabic and English version. */
export const mockUsers: User[] = seedUsers.map((user) => {
  const versions = profileTranslations[user.id]
  return user.profile && versions ? { ...user, profile: { ...user.profile, localized: versions } } : user
})

/** Demo passwords remain assigned to their existing account holders after the identity rename. */
export const demoCredentials: Record<string, string> = {
  [userIds.ahmedAyman]: 'Masar@0000',
  [userIds.ahmedMohamed]: 'Masar@0001',
  [userIds.abdelrahmanMohamed]: 'Masar@0010',
  [userIds.mostafaKamel]: 'Masar@0011',
  [userIds.abdelrahmanGhoneim]: 'Masar@0100',
  [userIds.abdelhamid]: 'Masar@0101',
  [userIds.mohamedAbdelfattah]: 'Masar@0110',
  [userIds.mahmoudAyman]: 'Masar@0111',
}
