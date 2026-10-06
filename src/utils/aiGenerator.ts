import { TestCase } from '../types/qa';

interface GenerateOptions {
  requirement: string;
  suite: string;
  type: 'functional' | 'security' | 'regression' | 'api';
  priority: 'critical' | 'high' | 'medium' | 'low';
  author: string;
}

// Built-in expert QA heuristic templates that cover typical software engineering scenarios
export const generateTestCaseFromRequirement = async (options: GenerateOptions): Promise<TestCase> => {
  const { requirement, suite, type, priority, author } = options;
  const timestamp = new Date().toISOString();
  const idPrefix = suite ? suite.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'TC') : 'TC';
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  const caseId = `${idPrefix}-${randomSuffix}`;

  // Analyze requirement keywords to generate hyper-relevant steps
  const reqLower = requirement.toLowerCase();

  let steps = [];

  if (reqLower.includes('pago') || reqLower.includes('tarjeta') || reqLower.includes('checkout') || reqLower.includes('stripe')) {
    steps = [
      {
        id: `step-${Date.now()}-1`,
        stepNumber: 1,
        action: 'Acceder a la pantalla de Checkout con una orden de compra activa y verificar los totales.',
        testData: 'Orden ID: #ORD-9821 con subtotal $50.00 USD',
        expectedResult: 'El desglose de subtotal, costos de envío e impuestos se muestra desglosado con precisión.',
        status: 'untested' as const,
        evidences: []
      },
      {
        id: `step-${Date.now()}-2`,
        stepNumber: 2,
        action: 'Completar los campos de tarjeta (Número, Fecha expiración, CVV, Nombre titular) con datos de prueba.',
        testData: 'PAN: 4242 4242 4242 4242 | EXP: 12/28 | CVV: 123',
        expectedResult: 'Validaciones de formulario activas sin errores de formato. El botón de confirmación se habilita.',
        status: 'untested' as const,
        evidences: []
      },
      {
        id: `step-${Date.now()}-3`,
        stepNumber: 3,
        action: 'Presionar "Confirmar y Pagar" y monitorear la respuesta del gateway bancario.',
        testData: 'Proceso síncrono 3DS / Webhook',
        expectedResult: 'Respuesta HTTP 200/201 con comprobante de transacción generado y vaciado del carrito.',
        status: 'untested' as const,
        evidences: []
      }
    ];
  } else if (reqLower.includes('login') || reqLower.includes('autentica') || reqLower.includes('password') || reqLower.includes('usuario')) {
    steps = [
      {
        id: `step-${Date.now()}-1`,
        stepNumber: 1,
        action: 'Navegar al formulario de autenticación e ingresar datos inválidos para probar validación negativa.',
        testData: 'Usuario: invalido@correo.com | Clave: 123',
        expectedResult: 'Alerta descriptiva: "Credenciales inválidas" sin revelar si el usuario existe (OWASP A07).',
        status: 'untested' as const,
        evidences: []
      },
      {
        id: `step-${Date.now()}-2`,
        stepNumber: 2,
        action: 'Limpiar campos e ingresar credenciales autorizadas válidas con formato correcto.',
        testData: 'Usuario: qa.auditor@empresa.com | Clave: Valida2026!*',
        expectedResult: 'El sistema valida contraseña cifrada y responde con token JWT o sesión segura.',
        status: 'untested' as const,
        evidences: []
      },
      {
        id: `step-${Date.now()}-3`,
        stepNumber: 3,
        action: 'Verificar redirección y preservación de token en sesión / localStorage / cookie HttpOnly.',
        testData: 'Storage check & Redirección',
        expectedResult: 'Usuario navega al Dashboard con permisos asociados y visualiza su nombre en cabecera.',
        status: 'untested' as const,
        evidences: []
      }
    ];
  } else if (reqLower.includes('archivo') || reqLower.includes('upload') || reqLower.includes('documento') || reqLower.includes('imagen')) {
    steps = [
      {
        id: `step-${Date.now()}-1`,
        stepNumber: 1,
        action: 'Intentar subir un archivo con extensión no permitida (.exe o .bat) de 2MB.',
        testData: 'Archivo: test_malicious.exe',
        expectedResult: 'Rechazo inmediato en cliente y servidor con mensaje: "Tipo de archivo no admitido".',
        status: 'untested' as const,
        evidences: []
      },
      {
        id: `step-${Date.now()}-2`,
        stepNumber: 2,
        action: 'Intentar subir un archivo permitido (.png) que exceda el límite de tamaño (ej. >10MB).',
        testData: 'Archivo: large_photo.png (12.5 MB)',
        expectedResult: 'Mensaje de error explícito de peso máximo excedido sin bloquear la interfaz.',
        status: 'untested' as const,
        evidences: []
      },
      {
        id: `step-${Date.now()}-3`,
        stepNumber: 3,
        action: 'Subir archivo válido (.png o .pdf) de 1.5MB y confirmar almacenamiento.',
        testData: 'Archivo: documento_valido.pdf (1.5 MB)',
        expectedResult: 'Barra de progreso al 100%, previsualización generada y URL de CDN persistida.',
        status: 'untested' as const,
        evidences: []
      }
    ];
  } else {
    // Standard QA Test Case step structure for any generic requirement
    steps = [
      {
        id: `step-${Date.now()}-1`,
        stepNumber: 1,
        action: `Verificar el estado inicial y precondiciones de la funcionalidad: "${requirement}".`,
        testData: 'Entorno de pruebas y estado de datos inicial',
        expectedResult: 'La vista carga todos los componentes requeridos sin errores en consola ni alertas bloqueantes.',
        status: 'untested' as const,
        evidences: []
      },
      {
        id: `step-${Date.now()}-2`,
        stepNumber: 2,
        action: 'Ejecutar la acción principal con datos de entrada válidos según los criterios de aceptación.',
        testData: 'Datos de prueba acordes a la especificación funcional',
        expectedResult: 'El sistema procesa la solicitud, muestra indicador de carga y actualiza el estado en pantalla.',
        status: 'untested' as const,
        evidences: []
      },
      {
        id: `step-${Date.now()}-3`,
        stepNumber: 3,
        action: 'Verificar la persistencia en base de datos y la respuesta esperada en la interfaz de usuario.',
        testData: 'Consulta de confirmación en UI / API',
        expectedResult: 'Confirmación visual exitosa, datos persistidos correctamente y registros de auditoría generados.',
        status: 'untested' as const,
        evidences: []
      }
    ];
  }

  return {
    id: caseId,
    title: requirement.length > 80 ? requirement.substring(0, 77) + '...' : requirement,
    description: `Caso de prueba diseñado para validar la especificación: ${requirement}`,
    suite: suite || 'Funcionalidad General',
    priority,
    type,
    preconditions: '1. Ambiente de pruebas Staging / QA desplegado con última versión.\n2. Datos de prueba creados en base de datos.\n3. Usuario con credenciales de prueba activas.',
    testDataRequirements: 'Datos específicos según el flujo descrito en los pasos.',
    steps,
    overallStatus: 'untested',
    author: author || 'QA Engineer Senior',
    assignedTo: author || 'QA Engineer Senior',
    createdAt: timestamp,
    updatedAt: timestamp,
    tags: [suite || 'General', type, priority]
  };
};
