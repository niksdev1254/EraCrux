export interface User {
  uid: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: Date;
  displayName?: string;
}

export interface Dashboard {
  id: string;
  uid: string;
  title: string;
  fileName: string;
  fileType: string;
  base64: string;
  aiSummary: string;
  charts: ChartConfig[];
  metrics: Metric[];
  createdAt: Date;
}

export interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'area';
  title: string;
  data: any[];
  config: any;
}

export interface Metric {
  name: string;
  value: string;
  change?: string;
}

export interface Blog {
  id: string;
  title: string;
  content: string;
  tags: string[];
  author: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  summary?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}