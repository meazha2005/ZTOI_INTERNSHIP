export type Domain = 'Prompt Engineering' | 'Web Development with AI' | 'Python Full Stack';
export type TaskStatus = 'pending' | 'submitted' | 'accepted' | 'rejected';
export type CertificateStatus = 'locked' | 'payment_pending' | 'under_review' | 'issued';
export type StudentStatus = 'active' | 'blocked';

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  dob: string;
  college: string;
  address: string;
  domain: Domain;
  photo: string;
  registeredAt: string;
  status: StudentStatus;
  tasksCompleted: number;
  certificateStatus: CertificateStatus;
}

export interface Task {
  id: string;
  domain: Domain;
  title: string;
  description: string;
}

export interface TaskSubmission {
  id: string;
  studentId: string;
  studentName: string;
  taskId: string;
  taskTitle: string;
  domain: Domain;
  status: TaskStatus;
  submittedAt: string;
  fileUrl?: string;
  rejectionReason?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'student' | 'admin';
  content: string;
  timestamp: string;
  attachment?: { name: string; url: string };
}

export interface PaymentSubmission {
  id: string;
  studentId: string;
  studentName: string;
  domain: Domain;
  amount: number;
  upiRef: string;
  screenshotUrl: string;
  submittedAt: string;
  status: 'pending' | 'verified' | 'rejected';
  certificateGenerated?: boolean;
}

export const mockStudents: Student[] = [
  {
    id: 's1',
    name: 'Arjun Sharma',
    email: 'arjun.sharma@gmail.com',
    phone: '+91 9876543210',
    dob: '2002-03-15',
    college: 'Anna University, Chennai',
    address: '12, Gandhi Nagar, Chennai - 600020',
    domain: 'Web Development with AI',
    photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=arjun',
    registeredAt: '2026-04-10',
    status: 'active',
    tasksCompleted: 2,
    certificateStatus: 'payment_pending',
  },
  {
    id: 's2',
    name: 'Priya Nair',
    email: 'priya.nair@gmail.com',
    phone: '+91 9123456789',
    dob: '2003-07-22',
    college: 'PSG College of Technology, Coimbatore',
    address: '45, Avinashi Road, Coimbatore - 641004',
    domain: 'Python Full Stack',
    photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya',
    registeredAt: '2026-04-12',
    status: 'active',
    tasksCompleted: 1,
    certificateStatus: 'locked',
  },
  {
    id: 's3',
    name: 'Rahul Verma',
    email: 'rahul.verma@gmail.com',
    phone: '+91 9988776655',
    dob: '2001-11-08',
    college: 'VIT University, Vellore',
    address: '78, Katpadi Road, Vellore - 632014',
    domain: 'Prompt Engineering',
    photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rahul',
    registeredAt: '2026-04-15',
    status: 'active',
    tasksCompleted: 2,
    certificateStatus: 'issued',
  },
  {
    id: 's4',
    name: 'Sneha Krishnan',
    email: 'sneha.k@gmail.com',
    phone: '+91 8765432109',
    dob: '2002-05-30',
    college: 'SRM Institute of Science and Technology',
    address: '23, Kattankulathur, Chennai - 603203',
    domain: 'Web Development with AI',
    photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sneha',
    registeredAt: '2026-04-18',
    status: 'active',
    tasksCompleted: 0,
    certificateStatus: 'locked',
  },
  {
    id: 's5',
    name: 'Mohammed Irfan',
    email: 'irfan.m@gmail.com',
    phone: '+91 7654321098',
    dob: '2003-01-14',
    college: 'Coimbatore Institute of Technology',
    address: '56, Avinashi Road, Coimbatore - 641014',
    domain: 'Python Full Stack',
    photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=irfan',
    registeredAt: '2026-04-20',
    status: 'active',
    tasksCompleted: 2,
    certificateStatus: 'under_review',
  },
  {
    id: 's6',
    name: 'Divya Menon',
    email: 'divya.menon@gmail.com',
    phone: '+91 9345678901',
    dob: '2002-09-25',
    college: 'NIT Trichy',
    address: '34, National Highway, Tiruchirappalli - 620015',
    domain: 'Prompt Engineering',
    photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=divya',
    registeredAt: '2026-04-22',
    status: 'blocked',
    tasksCompleted: 0,
    certificateStatus: 'locked',
  },
];

export const mockTasks: Task[] = [
  // Prompt Engineering
  {
    id: 't1',
    domain: 'Prompt Engineering',
    title: 'Zero-Shot vs Few-Shot Prompting',
    description:
      'Create a comprehensive comparison document demonstrating zero-shot and few-shot prompting techniques using GPT-4. Include at least 10 examples for each technique across different use cases (summarization, classification, code generation). Submit as a ZIP containing your prompts, outputs, and analysis report.',
  },
  {
    id: 't2',
    domain: 'Prompt Engineering',
    title: 'Chain-of-Thought Reasoning',
    description:
      'Build a prompt chain that solves complex multi-step mathematical and logical reasoning problems. Demonstrate how chain-of-thought prompting improves accuracy. Include 5 problem sets with step-by-step reasoning. Submit ZIP with prompts, outputs, and a reflection document.',
  },
  {
    id: 't3',
    domain: 'Prompt Engineering',
    title: 'AI Content Moderation System',
    description:
      'Design a prompt-based content moderation pipeline that classifies text into categories (safe, harmful, spam, etc.). Test with 50+ sample inputs. Document your prompt engineering decisions and accuracy metrics. Submit as ZIP with all files.',
  },
  {
    id: 't4',
    domain: 'Prompt Engineering',
    title: 'Custom AI Persona Creation',
    description:
      'Create 3 distinct AI personas (customer support agent, coding tutor, creative writer) using system prompts. Test each persona with 10 diverse user queries. Analyze consistency and quality. Submit ZIP with persona definitions, test conversations, and analysis.',
  },

  // Web Development with AI
  {
    id: 't5',
    domain: 'Web Development with AI',
    title: 'AI-Powered Todo App',
    description:
      'Build a React-based todo application that uses an AI API (OpenAI/Gemini) to auto-categorize tasks, suggest priorities, and generate subtasks. Include user authentication, CRUD operations, and AI features. Submit ZIP with source code and README.',
  },
  {
    id: 't6',
    domain: 'Web Development with AI',
    title: 'Smart Blog Generator',
    description:
      'Create a full-stack web app where users input a topic and the AI generates a complete blog post with title, sections, and SEO meta tags. Use React frontend + Node.js backend + AI API. Include edit functionality. Submit ZIP with complete source code.',
  },
  {
    id: 't7',
    domain: 'Web Development with AI',
    title: 'AI Image Caption Generator',
    description:
      'Build a web app that accepts image uploads and generates descriptive captions using a vision AI model. Include gallery view, caption history, and export functionality. Submit ZIP with source code and deployment instructions.',
  },
  {
    id: 't8',
    domain: 'Web Development with AI',
    title: 'Conversational UI Chatbot',
    description:
      'Develop a production-ready chatbot UI with streaming responses, conversation history, markdown rendering, and code highlighting. Integrate with OpenAI or similar API. Include responsive design. Submit ZIP with complete source code.',
  },

  // Python Full Stack
  {
    id: 't9',
    domain: 'Python Full Stack',
    title: 'Django REST API with Authentication',
    description:
      'Build a RESTful API using Django REST Framework with JWT authentication, user registration/login, and CRUD endpoints for a resource of your choice. Include proper serializers, permissions, and API documentation. Submit ZIP with source code and Postman collection.',
  },
  {
    id: 't10',
    domain: 'Python Full Stack',
    title: 'FastAPI Microservice',
    description:
      'Create a FastAPI microservice for a product catalog with PostgreSQL database, async endpoints, Pydantic models, and automatic API docs. Include Docker configuration. Submit ZIP with source code, Dockerfile, and README.',
  },
  {
    id: 't11',
    domain: 'Python Full Stack',
    title: 'Full Stack E-Commerce Module',
    description:
      'Build a product listing and cart module using Django backend + React/HTML frontend. Include product search, filtering, cart management, and order summary. Submit ZIP with complete source code and setup instructions.',
  },
  {
    id: 't12',
    domain: 'Python Full Stack',
    title: 'Data Dashboard with Flask',
    description:
      'Create a data visualization dashboard using Flask + Chart.js/Plotly. Fetch data from a public API, process it with Pandas, and display interactive charts. Include at least 4 chart types. Submit ZIP with source code and sample data.',
  },
];

export const mockTaskSubmissions: TaskSubmission[] = [
  {
    id: 'sub1',
    studentId: 's1',
    studentName: 'Arjun Sharma',
    taskId: 't5',
    taskTitle: 'AI-Powered Todo App',
    domain: 'Web Development with AI',
    status: 'accepted',
    submittedAt: '2026-04-25',
    fileUrl: '/submissions/arjun-task1.zip',
  },
  {
    id: 'sub2',
    studentId: 's1',
    studentName: 'Arjun Sharma',
    taskId: 't6',
    taskTitle: 'Smart Blog Generator',
    domain: 'Web Development with AI',
    status: 'accepted',
    submittedAt: '2026-04-28',
    fileUrl: '/submissions/arjun-task2.zip',
  },
  {
    id: 'sub3',
    studentId: 's2',
    studentName: 'Priya Nair',
    taskId: 't9',
    taskTitle: 'Django REST API with Authentication',
    domain: 'Python Full Stack',
    status: 'accepted',
    submittedAt: '2026-04-26',
    fileUrl: '/submissions/priya-task1.zip',
  },
  {
    id: 'sub4',
    studentId: 's2',
    studentName: 'Priya Nair',
    taskId: 't10',
    taskTitle: 'FastAPI Microservice',
    domain: 'Python Full Stack',
    status: 'rejected',
    submittedAt: '2026-04-30',
    fileUrl: '/submissions/priya-task2.zip',
    rejectionReason:
      'The FastAPI implementation is missing async endpoints. Please implement all routes as async functions and resubmit.',
  },
  {
    id: 'sub5',
    studentId: 's4',
    studentName: 'Sneha Krishnan',
    taskId: 't7',
    taskTitle: 'AI Image Caption Generator',
    domain: 'Web Development with AI',
    status: 'submitted',
    submittedAt: '2026-05-01',
    fileUrl: '/submissions/sneha-task1.zip',
  },
  {
    id: 'sub6',
    studentId: 's5',
    studentName: 'Mohammed Irfan',
    taskId: 't11',
    taskTitle: 'Full Stack E-Commerce Module',
    domain: 'Python Full Stack',
    status: 'accepted',
    submittedAt: '2026-04-27',
    fileUrl: '/submissions/irfan-task1.zip',
  },
  {
    id: 'sub7',
    studentId: 's5',
    studentName: 'Mohammed Irfan',
    taskId: 't12',
    taskTitle: 'Data Dashboard with Flask',
    domain: 'Python Full Stack',
    status: 'accepted',
    submittedAt: '2026-05-02',
    fileUrl: '/submissions/irfan-task2.zip',
  },
];

export const mockChatMessages: Record<string, ChatMessage[]> = {
  s1: [
    {
      id: 'm1',
      senderId: 'admin',
      senderName: 'ZTOI Mentor',
      senderRole: 'admin',
      content:
        'Welcome to ZTOI Tech Internship, Arjun! I am your mentor. Feel free to ask any questions about your tasks.',
      timestamp: '2026-04-10T10:00:00Z',
    },
    {
      id: 'm2',
      senderId: 's1',
      senderName: 'Arjun Sharma',
      senderRole: 'student',
      content:
        'Thank you! I have started working on the AI-Powered Todo App. Should I use React hooks or Redux for state management?',
      timestamp: '2026-04-11T14:30:00Z',
    },
    {
      id: 'm3',
      senderId: 'admin',
      senderName: 'ZTOI Mentor',
      senderRole: 'admin',
      content:
        'Great question! For this project, React hooks (useState, useContext) will be sufficient. Keep it simple and focus on the AI integration part.',
      timestamp: '2026-04-11T15:00:00Z',
    },
    {
      id: 'm4',
      senderId: 's1',
      senderName: 'Arjun Sharma',
      senderRole: 'student',
      content: 'Understood! I have submitted Task 1. Please review when you get a chance.',
      timestamp: '2026-04-25T18:00:00Z',
    },
    {
      id: 'm5',
      senderId: 'admin',
      senderName: 'ZTOI Mentor',
      senderRole: 'admin',
      content:
        'Excellent work on Task 1! The AI integration was well done. Your Task 1 has been accepted. Please proceed to Task 2.',
      timestamp: '2026-04-26T10:00:00Z',
    },
  ],
  s2: [
    {
      id: 'm6',
      senderId: 'admin',
      senderName: 'ZTOI Mentor',
      senderRole: 'admin',
      content: 'Welcome Priya! Your domain is Python Full Stack. You have been assigned 2 tasks. All the best!',
      timestamp: '2026-04-12T09:00:00Z',
    },
    {
      id: 'm7',
      senderId: 's2',
      senderName: 'Priya Nair',
      senderRole: 'student',
      content: 'Hello! I have a doubt about the FastAPI task. Should I use SQLAlchemy or Tortoise ORM?',
      timestamp: '2026-04-20T11:00:00Z',
    },
    {
      id: 'm8',
      senderId: 'admin',
      senderName: 'ZTOI Mentor',
      senderRole: 'admin',
      content: 'You can use either, but SQLAlchemy with async support is recommended for production-grade FastAPI apps.',
      timestamp: '2026-04-20T11:30:00Z',
    },
  ],
  s3: [
    {
      id: 'm9',
      senderId: 'admin',
      senderName: 'ZTOI Mentor',
      senderRole: 'admin',
      content: 'Congratulations Rahul! Both your tasks have been accepted and your certificate has been issued!',
      timestamp: '2026-05-01T10:00:00Z',
    },
    {
      id: 'm10',
      senderId: 's3',
      senderName: 'Rahul Verma',
      senderRole: 'student',
      content: 'Thank you so much! This internship was a great learning experience.',
      timestamp: '2026-05-01T10:30:00Z',
    },
  ],
};

export const mockPayments: PaymentSubmission[] = [
  {
    id: 'pay1',
    studentId: 's1',
    studentName: 'Arjun Sharma',
    domain: 'Web Development with AI',
    amount: 499,
    upiRef: 'UPI202605011234567',
    screenshotUrl: '/payments/arjun-payment.jpg',
    submittedAt: '2026-05-01',
    status: 'pending',
  },
  {
    id: 'pay2',
    studentId: 's3',
    studentName: 'Rahul Verma',
    domain: 'Prompt Engineering',
    amount: 499,
    upiRef: 'UPI202604289876543',
    screenshotUrl: '/payments/rahul-payment.jpg',
    submittedAt: '2026-04-28',
    status: 'verified',
    certificateGenerated: true,
  },
  {
    id: 'pay3',
    studentId: 's5',
    studentName: 'Mohammed Irfan',
    domain: 'Python Full Stack',
    amount: 499,
    upiRef: 'UPI202605031122334',
    screenshotUrl: '/payments/irfan-payment.jpg',
    submittedAt: '2026-05-03',
    status: 'pending',
  },
];

// Logged-in student mock (for student portal)
export const currentStudent: Student = mockStudents[0];

export const currentStudentTasks = mockTaskSubmissions.filter((s) => s.studentId === 'current');

export const studentAssignedTasks: TaskSubmission[] = [
  {
    id: 'my-sub1',
    studentId: 'current',
    studentName: 'Arjun Sharma',
    taskId: 't5',
    taskTitle: 'AI-Powered Todo App',
    domain: 'Web Development with AI',
    status: 'accepted',
    submittedAt: '2026-04-25',
    fileUrl: '/submissions/task1.zip',
  },
  {
    id: 'my-sub2',
    studentId: 'current',
    studentName: 'Arjun Sharma',
    taskId: 't6',
    taskTitle: 'Smart Blog Generator',
    domain: 'Web Development with AI',
    status: 'rejected',
    submittedAt: '2026-04-28',
    fileUrl: '/submissions/task2.zip',
    rejectionReason:
      'The blog generator is missing the SEO meta tags feature. Please add title, description, and keywords generation and resubmit.',
  },
];
