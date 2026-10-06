import { TestCase, SuiteMetrics, TestStep } from '../types/qa';
import { INITIAL_TEST_CASES } from '../data/sampleTestCases';

const STORAGE_KEY = 'qaflow_test_cases_v1';

export const loadTestCasesFromStorage = (): TestCase[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveTestCasesToStorage(INITIAL_TEST_CASES);
      return INITIAL_TEST_CASES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_TEST_CASES;
  } catch (err) {
    console.error('Failed to load test cases from storage', err);
    return INITIAL_TEST_CASES;
  }
};

export const saveTestCasesToStorage = (cases: TestCase[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
  } catch (err) {
    console.error('Failed to save test cases to storage', err);
  }
};

export const calculateSuiteMetrics = (cases: TestCase[]): SuiteMetrics => {
  let passed = 0;
  let failed = 0;
  let blocked = 0;
  let skipped = 0;
  let untested = 0;
  let totalEvidences = 0;
  let totalDefects = 0;

  cases.forEach((tc) => {
    if (tc.overallStatus === 'passed') passed++;
    else if (tc.overallStatus === 'failed') failed++;
    else if (tc.overallStatus === 'blocked') blocked++;
    else if (tc.overallStatus === 'skipped') skipped++;
    else untested++;

    tc.steps.forEach((step) => {
      totalEvidences += step.evidences?.length || 0;
      if (step.defect) totalDefects++;
    });
  });

  const total = cases.length;
  const executed = passed + failed + blocked;
  const passRate = executed > 0 ? Math.round((passed / executed) * 100) : 0;

  return {
    total,
    passed,
    failed,
    blocked,
    skipped,
    untested,
    passRate,
    totalEvidences,
    totalDefects
  };
};

export const exportTestCasesToJSON = (cases: TestCase[]): void => {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(cases, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `QAFlow_TestCases_Backup_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};

export const exportTestCasesToCSV = (cases: TestCase[]): void => {
  const headers = [
    'Test Case ID',
    'Título',
    'Suite / Módulo',
    'Prioridad',
    'Tipo',
    'Estado General',
    'Paso #',
    'Acción del Paso',
    'Datos de Prueba',
    'Resultado Esperado',
    'Resultado Obtenido',
    'Estado del Paso',
    'Total Evidencias',
    'Defecto Asociado'
  ];

  const rows: string[][] = [];

  cases.forEach((tc) => {
    tc.steps.forEach((step: TestStep) => {
      rows.push([
        tc.id,
        `"${tc.title.replace(/"/g, '""')}"`,
        `"${tc.suite.replace(/"/g, '""')}"`,
        tc.priority,
        tc.type,
        tc.overallStatus,
        step.stepNumber.toString(),
        `"${step.action.replace(/"/g, '""')}"`,
        `"${(step.testData || '').replace(/"/g, '""')}"`,
        `"${step.expectedResult.replace(/"/g, '""')}"`,
        `"${(step.actualResult || '').replace(/"/g, '""')}"`,
        step.status,
        (step.evidences?.length || 0).toString(),
        `"${step.defect ? `${step.defect.id}: ${step.defect.title}` : ''}"`
      ]);
    });
  });

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `QAFlow_Matriz_Casos_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};
