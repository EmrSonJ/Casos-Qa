export type TestStatus = 'passed' | 'failed' | 'blocked' | 'skipped' | 'untested';
export type TestPriority = 'critical' | 'high' | 'medium' | 'low';
export type TestType = 'functional' | 'regression' | 'smoke' | 'integration' | 'e2e' | 'security' | 'api';
export type EvidenceType = 'screenshot' | 'log' | 'payload' | 'link';

export interface StepEvidence {
  id: string;
  type: EvidenceType;
  name: string;
  dataUrl?: string; // Base64 image data or file URL
  textContent?: string; // Log content, JSON payload, error trace
  fileSize?: string;
  timestamp: string;
  notes?: string;
}

export interface DefectReport {
  id: string;
  title: string;
  severity: 'blocker' | 'critical' | 'major' | 'minor';
  description?: string;
  jiraTicket?: string;
  timestamp: string;
}

export interface TestStep {
  id: string;
  stepNumber: number;
  action: string;
  testData?: string;
  expectedResult: string;
  actualResult?: string;
  status: TestStatus;
  evidences: StepEvidence[];
  defect?: DefectReport;
  executedAt?: string;
}

export interface TestCase {
  id: string; // e.g. TC-AUTH-001
  title: string;
  description: string;
  suite: string; // e.g. "Autenticación", "Pagos", "Checkout"
  priority: TestPriority;
  type: TestType;
  preconditions: string;
  testDataRequirements?: string;
  steps: TestStep[];
  overallStatus: TestStatus;
  author: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  lastExecutedAt?: string;
  executionDurationSecs?: number;
  tags: string[];
}

export interface FilterOptions {
  searchQuery: string;
  suite: string;
  status: string;
  priority: string;
  type: string;
}

export interface SuiteMetrics {
  total: number;
  passed: number;
  failed: number;
  blocked: number;
  skipped: number;
  untested: number;
  passRate: number;
  totalEvidences: number;
  totalDefects: number;
}
