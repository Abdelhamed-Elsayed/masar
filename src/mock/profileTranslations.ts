import type { CertificationItem, EducationItem, ProfileContent, ProfileLocale, WorkExperienceItem } from '@/types/user'

/**
 * Full Arabic and English versions of every seeded employee profile. They are keyed by
 * user id (plain strings, so this file has no dependency on the user list) and attached
 * to each user's `profile.localized` in `mock/users.ts`.
 */

const exp = (id: string, role: string, company: string, period: string, description: string): WorkExperienceItem => ({ id, role, company, period, description })
const edu = (id: string, degree: string, institution: string, year: string): EducationItem => ({ id, degree, institution, year })
const cert = (id: string, title: string, issuer: string, year: string): CertificationItem => ({ id, title, issuer, year })

type Versions = Record<ProfileLocale, ProfileContent>

export const profileTranslations: Record<string, Versions> = {
  'user-ahmed-ayman': {
    en: {
      bio: 'Software engineer specialising in interactive user interfaces and scalable cloud systems, passionate about building fast, high-performing user experiences.',
      skills: ['TypeScript', 'React', 'Tailwind CSS', 'Vite', 'State Management', 'REST APIs'],
      experiences: [
        exp('exp-1', 'Software Engineer', 'Masar Technologies', '2023 - Present', 'Develops and maintains the workflow management platform and builds advanced interface components on a modern design system.'),
        exp('exp-2', 'Frontend Developer', 'Tech Solutions Hub', '2021 - 2023', 'Built full web applications with React and TypeScript and improved their performance.'),
      ],
      education: [edu('edu-1', 'B.Sc. in Computer Science', 'Cairo University', '2021')],
      certifications: [
        cert('cert-1', 'AWS Certified Solutions Architect', 'Amazon Web Services', '2023'),
        cert('cert-2', 'Meta Frontend Developer Professional Certificate', 'Meta / Coursera', '2022'),
      ],
    },
    ar: {
      bio: 'مهندس برمجيات متخصص في بناء واجهات المستخدم التفاعلية والأنظمة السحابية القابلة للتوسع. شغوف بتطوير تجارب مستخدم سريعة وعالية الكفاءة.',
      skills: ['TypeScript', 'React', 'Tailwind CSS', 'Vite', 'إدارة الحالة (State Management)', 'REST APIs'],
      experiences: [
        exp('exp-1', 'مهندس برمجيات', 'مسار للتقنية', '2023 - الآن', 'تطوير وتحديث منصة إدارة مسارات العمل وبناء مكونات الواجهة المتقدمة بنظام التصميم العصري.'),
        exp('exp-2', 'مطوّر واجهات أمامية', 'تك سوليوشنز هب', '2021 - 2023', 'بناء تطبيقات ويب متكاملة باستخدام React و TypeScript وتحسين سرعة الأداء.'),
      ],
      education: [edu('edu-1', 'بكالوريوس علوم الحاسب', 'جامعة القاهرة', '2021')],
      certifications: [
        cert('cert-1', 'AWS Certified Solutions Architect', 'أمازون لخدمات الويب', '2023'),
        cert('cert-2', 'Meta Frontend Developer Professional Certificate', 'ميتا / كورسيرا', '2022'),
      ],
    },
  },
  'user-ahmed-mohamed': {
    en: {
      bio: 'Engineering team lead who guides development teams, designs high-performance architectures, and upholds code standards and delivery quality.',
      skills: ['Team Leadership', 'System Design', 'React & Next.js', 'TypeScript', 'Docker', 'Agile/Scrum'],
      experiences: [
        exp('exp-3', 'Engineering Team Lead', 'Masar Technologies', '2022 - Present', 'Leads the development team, manages feature release cycles, and reviews the project architecture.'),
        exp('exp-4', 'Senior Software Engineer', 'Alpha Cloud Systems', '2019 - 2022', 'Developed microservice systems, performance monitoring, and integration tests.'),
      ],
      education: [edu('edu-2', 'B.Sc. in Computer and Control Systems Engineering', 'Ain Shams University', '2019')],
      certifications: [cert('cert-3', 'Certified ScrumMaster (CSM)', 'Scrum Alliance', '2023')],
    },
    ar: {
      bio: 'قائد فريق هندسي متميز في توجيه الفرق البرمجية وتصميم المعماريات عالية الأداء ومتابعة معايير الكود وجودة التسليم.',
      skills: ['قيادة الفرق', 'تصميم الأنظمة (System Design)', 'React & Next.js', 'TypeScript', 'Docker', 'Agile/Scrum'],
      experiences: [
        exp('exp-3', 'قائد فريق الهندسة', 'مسار للتقنية', '2022 - الآن', 'قيادة فريق التطوير وإدارة دورات إطلاق الميزات ومراجعة البنية الهندسية للمشروع.'),
        exp('exp-4', 'مهندس برمجيات أول', 'ألفا كلاود سيستمز', '2019 - 2022', 'تطوير أنظمة الخدمات المصغرة ومراقبة الأداء واختبارات التكامل.'),
      ],
      education: [edu('edu-2', 'بكالوريوس هندسة الحاسبات ونظم التحكم', 'جامعة عين شمس', '2019')],
      certifications: [cert('cert-3', 'Certified ScrumMaster (CSM)', 'تحالف سكرم (Scrum Alliance)', '2023')],
    },
  },
  'user-abdelrahman-mohamed': {
    en: {
      bio: 'Head of Engineering at Masar, experienced in running large engineering projects, leading technical teams, and shaping infrastructure strategy.',
      skills: ['Engineering Management', 'Enterprise Architecture', 'Cloud Infrastructure', 'Budgeting & Strategy'],
      experiences: [exp('exp-5', 'Engineering Department Manager', 'Masar Technologies', '2021 - Present', 'Oversees all engineering operations and keeps technical goals aligned with business goals.')],
      education: [edu('edu-3', 'MBA and B.Sc. in Engineering', 'Cairo University', '2018')],
      certifications: [cert('cert-4', 'Project Management Professional (PMP)', 'PMI', '2020')],
    },
    ar: {
      bio: 'مدير إدارة الهندسة في مسار. خبير في إدارة المشاريع الهندسية الضخمة وقيادة الفرق التقنية واستراتيجيات البنية التحتية.',
      skills: ['إدارة الهندسة', 'معمارية المؤسسات (Enterprise Architecture)', 'البنية التحتية السحابية (Cloud Infrastructure)', 'الميزانيات والاستراتيجية'],
      experiences: [exp('exp-5', 'مدير قسم الهندسة', 'مسار للتقنية', '2021 - الآن', 'الإشراف على كافة العمليات الهندسية وضمان التوافق بين الأهداف التقنية والتجارية.')],
      education: [edu('edu-3', 'ماجستير إدارة الأعمال (MBA) وبكالوريوس الهندسة', 'جامعة القاهرة', '2018')],
      certifications: [cert('cert-4', 'Project Management Professional (PMP)', 'معهد إدارة المشاريع (PMI)', '2020')],
    },
  },
  'user-mostafa-kamel': {
    en: {
      bio: 'HR specialist dedicated to supporting employees, managing hiring and evaluation, and improving the workplace experience.',
      skills: ['Talent Acquisition', 'Employee Relations', 'HR Analytics', 'Onboarding & Training'],
      experiences: [exp('exp-6', 'HR Specialist', 'Masar Technologies', '2023 - Present', 'Manages hiring files, follows up on employee requests, and handles performance reviews.')],
      education: [edu('edu-4', 'B.A. in Business Administration and Human Resources', 'Helwan University', '2022')],
      certifications: [cert('cert-5', 'SHRM Certified Professional (SHRM-CP)', 'SHRM', '2024')],
    },
    ar: {
      bio: 'أخصائي موارد بشرية مكرس لدعم الموظفين وإدارة عمليات التعيين والتقييم وتحسين تجربة بيئة العمل.',
      skills: ['استقطاب الكفاءات (Talent Acquisition)', 'علاقات الموظفين', 'تحليلات الموارد البشرية (HR Analytics)', 'التهيئة والتدريب (Onboarding & Training)'],
      experiences: [exp('exp-6', 'أخصائي الموارد البشرية', 'مسار للتقنية', '2023 - الآن', 'إدارة ملفات التوظيف ومتابعة طلبات الموظفين ومراجعات الأداء.')],
      education: [edu('edu-4', 'بكالوريوس إدارة الأعمال والموارد البشرية', 'جامعة حلوان', '2022')],
      certifications: [cert('cert-5', 'SHRM Certified Professional (SHRM-CP)', 'SHRM', '2024')],
    },
  },
  'user-abdelrahman-ghoneim': {
    en: {
      bio: 'HR Director leading organisational transformation, developing workplace policies, and attracting leadership talent.',
      skills: ['Human Capital Strategy', 'Organizational Development', 'Executive Leadership', 'Labor Law'],
      experiences: [exp('exp-7', 'HR Director', 'Masar Technologies', '2020 - Present', 'Directs human-capital strategy and builds a workplace that supports innovation.')],
      education: [edu('edu-5', 'M.A. in Human Resource Management', 'The American University in Cairo', '2017')],
      certifications: [cert('cert-6', 'Senior Professional in Human Resources (SPHR)', 'HRCI', '2019')],
    },
    ar: {
      bio: 'مدير الموارد البشرية، قائد التحول المؤسسي وتطوير سياسات العمل واستقطاب الكفاءات القيادية.',
      skills: ['استراتيجية رأس المال البشري', 'التطوير المؤسسي', 'القيادة التنفيذية', 'قانون العمل'],
      experiences: [exp('exp-7', 'مدير إدارة الموارد البشرية', 'مسار للتقنية', '2020 - الآن', 'توجيه استراتيجيات رأس المال البشري وتطوير بيئة العمل الداعمة للابتكار.')],
      education: [edu('edu-5', 'ماجستير إدارة الموارد البشرية', 'الجامعة الأمريكية بالقاهرة', '2017')],
      certifications: [cert('cert-6', 'Senior Professional in Human Resources (SPHR)', 'HRCI', '2019')],
    },
  },
  'user-abdelhamid': {
    en: {
      bio: 'CEO and founder of Masar, a forward-looking entrepreneur set on reinventing business management and easing workflow for ambitious teams.',
      skills: ['Executive Leadership', 'Business Growth', 'Product Innovation', 'Corporate Governance'],
      experiences: [exp('exp-8', 'CEO & Founder', 'Masar Technologies', '2018 - Present', 'Leads the vision and strategic growth and builds technology and investment partnerships.')],
      education: [edu('edu-6', 'B.Sc. in Engineering and Business Administration', 'Cairo University', '2014')],
      certifications: [cert('cert-7', 'Executive Leadership Program', 'Harvard Business School Online', '2021')],
    },
    ar: {
      bio: 'الرئيس التنفيذي ومؤسس مسار. ريادي أعمال ذو رؤية مستقبلية تهدف إلى إعادة ابتكار إدارة الأعمال وتسهيل تدفق العمل للفرق الطموحة.',
      skills: ['القيادة التنفيذية', 'نمو الأعمال', 'ابتكار المنتجات', 'حوكمة الشركات'],
      experiences: [exp('exp-8', 'الرئيس التنفيذي والمؤسس', 'مسار للتقنية', '2018 - الآن', 'قيادة الرؤية والنمو الاستراتيجي وبناء الشراكات التقنية والاستثمارية.')],
      education: [edu('edu-6', 'بكالوريوس الهندسة وإدارة الأعمال', 'جامعة القاهرة', '2014')],
      certifications: [cert('cert-7', 'Executive Leadership Program', 'كلية هارفارد للأعمال أونلاين (Harvard Business School Online)', '2021')],
    },
  },
  'user-mahmoud-ayman': {
    en: {
      bio: 'Chief Technology Officer of the Masar platform, an expert in distributed systems design, information security, and modern cloud software engineering.',
      skills: ['Cloud Architecture', 'TypeScript & Rust', 'Distributed Systems', 'Cybersecurity', 'AI Systems'],
      experiences: [exp('exp-9', 'Chief Technology Officer', 'Masar Technologies', '2019 - Present', 'Sets the technical roadmap and platform architecture and manages the research and development teams.')],
      education: [edu('edu-7', 'M.Sc. in Computer Science and Artificial Intelligence', 'Cairo University', '2017')],
      certifications: [cert('cert-8', 'Professional Cloud Architect', 'Google Cloud', '2022')],
    },
    ar: {
      bio: 'المدير التقني لمنصة مسار. خبير في تصميم الأنظمة الموزعة، أمن المعلومات، وهندسة البرمجيات السحابية الحديثة.',
      skills: ['معمارية الحوسبة السحابية (Cloud Architecture)', 'TypeScript & Rust', 'الأنظمة الموزعة (Distributed Systems)', 'الأمن السيبراني', 'أنظمة الذكاء الاصطناعي'],
      experiences: [exp('exp-9', 'المدير التقني', 'مسار للتقنية', '2019 - الآن', 'توجيه خارطة الطريق التقنية ومعمارية المنصة وإدارة فرق البحث والتطوير.')],
      education: [edu('edu-7', 'ماجستير علوم الحاسب والذكاء الاصطناعي', 'جامعة القاهرة', '2017')],
      certifications: [cert('cert-8', 'Professional Cloud Architect', 'جوجل كلاود', '2022')],
    },
  },
  'user-mohamed-abdelfattah': {
    en: {
      bio: 'Product manager who combines a passion for user experience with careful data analysis to build digital solutions that meet customer needs precisely.',
      skills: ['Product Management', 'UX/UI Research', 'Agile Roadmapping', 'Data-Driven Decision Making'],
      experiences: [exp('exp-10', 'Product Manager', 'Masar Technologies', '2022 - Present', 'Defines product requirements, coordinates with engineering and design teams, and tracks performance indicators.')],
      education: [edu('edu-8', 'B.A. in Management Information Systems (MIS)', 'Cairo University', '2020')],
      certifications: [cert('cert-9', 'Certified Product Manager (CPM)', 'Pragmatic Institute', '2023')],
    },
    ar: {
      bio: 'مدير منتجات يجمع بين الشغف بتجربة المستخدم والتحليل الدقيق للبيانات لتطوير حلول رقمية تلبي احتياجات العملاء بدقة.',
      skills: ['إدارة المنتجات', 'أبحاث تجربة المستخدم (UX/UI Research)', 'تخطيط خارطة الطريق (Agile Roadmapping)', 'اتخاذ القرار المبني على البيانات'],
      experiences: [exp('exp-10', 'مدير المنتجات', 'مسار للتقنية', '2022 - الآن', 'تحديد متطلبات المنتجات وتنسيق العمل مع فرق الهندسة والتصميم وتتبع مؤشرات الأداء.')],
      education: [edu('edu-8', 'بكالوريوس نظم المعلومات الإدارية (MIS)', 'جامعة القاهرة', '2020')],
      certifications: [cert('cert-9', 'Certified Product Manager (CPM)', 'معهد براغماتيك (Pragmatic Institute)', '2023')],
    },
  },
}
