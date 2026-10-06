import { TestCase } from '../types/qa';

// SVG helpers to create crisp, lightweight mock screenshots of QA evidence
const createSvgDataUrl = (title: string, subtitle: string, badgeText: string, badgeBg: string, details: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
    <rect width="800" height="450" fill="#0f172a"/>
    <rect x="20" y="20" width="760" height="410" rx="8" fill="#1e293b" stroke="#334155" stroke-width="2"/>
    <circle cx="45" cy="45" r="6" fill="#ef4444"/>
    <circle cx="65" cy="45" r="6" fill="#f59e0b"/>
    <circle cx="85" cy="45" r="6" fill="#10b981"/>
    <rect x="120" y="35" width="400" height="20" rx="4" fill="#0f172a"/>
    <text x="135" y="49" fill="#94a3b8" font-family="monospace" font-size="11">https://app.enterprise-qa.local/checkout</text>
    <rect x="640" y="35" width="120" height="20" rx="4" fill="${badgeBg}"/>
    <text x="700" y="49" fill="#ffffff" font-family="sans-serif" font-weight="bold" font-size="10" text-anchor="middle">${badgeText}</text>
    
    <line x1="20" y1="70" x2="780" y2="70" stroke="#334155" stroke-width="1"/>
    
    <rect x="50" y="100" width="700" height="50" rx="6" fill="#0f172a" stroke="#475569" stroke-width="1"/>
    <text x="70" y="132" fill="#38bdf8" font-family="sans-serif" font-weight="bold" font-size="18">${title}</text>
    
    <text x="70" y="180" fill="#cbd5e1" font-family="sans-serif" font-size="14">${subtitle}</text>
    
    <rect x="50" y="210" width="700" height="180" rx="6" fill="#090d16" stroke="#1e293b" stroke-width="1"/>
    <text x="70" y="245" fill="#64748b" font-family="monospace" font-size="12">// EVIDENCIA QA CAPTURADA PASO A PASO</text>
    <text x="70" y="280" fill="#a5f3fc" font-family="monospace" font-size="14">${details}</text>
    <text x="70" y="320" fill="#94a3b8" font-family="monospace" font-size="12">Timestamp: 2026-10-06 13:45:22 GMT-5 | Environment: STAGING-V2</text>
    <text x="70" y="350" fill="#4ade80" font-family="monospace" font-size="12">✓ DOM Validado | Headers: 200 OK | Response Time: 182ms</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const INITIAL_TEST_CASES: TestCase[] = [
  {
    id: 'TC-AUTH-001',
    title: 'Autenticación con Segundo Factor (2FA - TOTP) y reenvío de código',
    description: 'Verificar que un usuario registrado puede autenticarse exitosamente ingresando credenciales válidas y el código TOTP correspondiente, gestionando el bloqueo tras 3 intentos fallidos.',
    suite: 'Autenticación & Seguridad',
    priority: 'critical',
    type: 'security',
    preconditions: '1. Usuario registrado con 2FA habilitado en base de datos de Staging.\n2. Servidor de sincronización horaria NTP operativo.\n3. Navegador Chrome v128 en modo incógnito.',
    testDataRequirements: 'Usuario: qa.senior@flowtest.io\nPassword: TestPassword2026!\nTOTP Secret: JBSWY3DPEHPK3PXP',
    author: 'Ing. QA Lead',
    assignedTo: 'Carlos Méndez (QA Senior)',
    createdAt: '2026-10-04T09:00:00Z',
    updatedAt: '2026-10-06T10:15:00Z',
    lastExecutedAt: '2026-10-06T10:30:00Z',
    executionDurationSecs: 145,
    overallStatus: 'passed',
    tags: ['Auth', '2FA', 'Seguridad', 'Sprint-42', 'Regresion'],
    steps: [
      {
        id: 'step-auth-1',
        stepNumber: 1,
        action: 'Navegar a la URL de inicio de sesión https://app.flowtest.io/login',
        testData: 'URL: /login',
        expectedResult: 'Se despliega el formulario con campos de Email, Contraseña y botón "Continuar".',
        actualResult: 'Formulario renderizado correctamente con campos limpios y autofocus en Email.',
        status: 'passed',
        executedAt: '2026-10-06T10:25:00Z',
        evidences: [
          {
            id: 'ev-1',
            type: 'screenshot',
            name: 'Paso 1 - Vista de Login limpia.png',
            dataUrl: createSvgDataUrl('PANTALLA DE LOGIN - FORMULARIO BASE', 'Campos email y password accesibles y validados', 'PASSED', '#10b981', 'Formulario renderizado en 120ms sin errores de consola.'),
            fileSize: '142 KB',
            timestamp: '2026-10-06 10:25:12',
            notes: 'Verificado contraste WCAG AA en inputs.'
          }
        ]
      },
      {
        id: 'step-auth-2',
        stepNumber: 2,
        action: 'Ingresar Email y Contraseña válidos y presionar el botón "Continuar"',
        testData: 'Email: qa.senior@flowtest.io | Password: TestPassword2026!',
        expectedResult: 'El sistema valida credenciales y redirecciona automáticamente a la pantalla de verificación 2FA (/login/2fa).',
        actualResult: 'Credenciales validadas, respuesta HTTP 200 con token temporal y transición fluida a la vista 2FA.',
        status: 'passed',
        executedAt: '2026-10-06T10:26:30Z',
        evidences: [
          {
            id: 'ev-2-img',
            type: 'screenshot',
            name: 'Paso 2 - Solicitud de Código 2FA.png',
            dataUrl: createSvgDataUrl('PANTALLA VERIFICACIÓN 2FA', 'Modal pidiendo token de 6 dígitos con countdown de 30s', 'PASSED', '#10b981', 'Input de 6 cajones automáticos con soporte para pegar código.'),
            fileSize: '158 KB',
            timestamp: '2026-10-06 10:26:40'
          },
          {
            id: 'ev-2-log',
            type: 'payload',
            name: 'Paso 2 - Network POST /api/v1/auth/login.json',
            textContent: JSON.stringify({
              status: 200,
              data: {
                challenge: "totp_required",
                tempSessionToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.s78291a...",
                expiresIn: 300,
                maskedEmail: "q***@flowtest.io"
              }
            }, null, 2),
            timestamp: '2026-10-06 10:26:45',
            notes: 'Payload verificado: No expone datos sensibles ni contraseñas.'
          }
        ]
      },
      {
        id: 'step-auth-3',
        stepNumber: 3,
        action: 'Ingresar código TOTP válido de 6 dígitos generado por Google Authenticator',
        testData: 'Código: 849201',
        expectedResult: 'El sistema valida el token, genera la sesión JWT principal y redirige al Dashboard principal.',
        actualResult: 'Sesión iniciada con éxito. Redirección a /dashboard en 450ms.',
        status: 'passed',
        executedAt: '2026-10-06T10:28:10Z',
        evidences: [
          {
            id: 'ev-3',
            type: 'screenshot',
            name: 'Paso 3 - Acceso concedido al Dashboard.png',
            dataUrl: createSvgDataUrl('DASHBOARD PRINCIPAL - SESIÓN ACTIVA', 'Usuario autenticado correctamente con rol QA Senior', 'PASSED', '#10b981', 'Navbar muestra avatar de usuario, tenant ID cargado y token guardado en Secure Storage.'),
            fileSize: '185 KB',
            timestamp: '2026-10-06 10:28:15'
          }
        ]
      }
    ]
  },
  {
    id: 'TC-PAY-002',
    title: 'Procesamiento de Pago con Tarjeta de Crédito 3D Secure y cálculo de impuestos',
    description: 'Validar el flujo de checkout al procesar una tarjeta Visa sujeta a autenticación bancaria 3DS, comprobando el desglose de IVA y control de error en caso de rechazo bancario.',
    suite: 'Pasarela de Pagos',
    priority: 'critical',
    type: 'functional',
    preconditions: '1. Carrito con al menos 2 ítems cuyo subtotal sume $120.00 USD.\n2. Gateway Stripe / Adyen configurado en modo Sandbox.',
    testDataRequirements: 'Tarjeta 3DS: 4000 0012 3456 0005 | Exp: 12/28 | CVV: 312\nCódigo Desafío 3DS: 1234',
    author: 'Ing. QA Lead',
    assignedTo: 'Valeria Rojas (QA Automation)',
    createdAt: '2026-10-05T11:20:00Z',
    updatedAt: '2026-10-06T11:45:00Z',
    lastExecutedAt: '2026-10-06T12:10:00Z',
    executionDurationSecs: 210,
    overallStatus: 'failed',
    tags: ['Pagos', 'Checkout', 'Stripe', '3DS', 'Financiero'],
    steps: [
      {
        id: 'step-pay-1',
        stepNumber: 1,
        action: 'Ingresar a la pantalla de Pago con un pedido de $120.00 USD y verificar resumen de precios',
        testData: 'Subtotal: $120.00 USD, Envío: $15.00 USD',
        expectedResult: 'El desglose muestra Subtotal $120, Envío $15, IVA (16%) $21.60 y Total $156.60 USD.',
        actualResult: 'Desglose exacto y cálculo de IVA coincide con la normativa fiscal.',
        status: 'passed',
        executedAt: '2026-10-06T12:05:00Z',
        evidences: [
          {
            id: 'ev-pay-1',
            type: 'screenshot',
            name: 'Paso 1 - Desglose de impuestos correcto.png',
            dataUrl: createSvgDataUrl('RESUMEN DE ORDEN & IMPUESTOS', 'Subtotal: $120.00 | IVA 16%: $21.60 | Total: $156.60', 'PASSED', '#10b981', 'Validado cálculo aritmético exacto y moneda USD.'),
            fileSize: '160 KB',
            timestamp: '2026-10-06 12:05:30'
          }
        ]
      },
      {
        id: 'step-pay-2',
        stepNumber: 2,
        action: 'Ingresar los datos de la tarjeta de prueba 3DS y hacer clic en "Confirmar y Pagar"',
        testData: 'Tarjeta: 4000 0012 3456 0005 | CVC: 312',
        expectedResult: 'Se dispara el iframe o modal bancario de validación 3D Secure con el desafío OTP.',
        actualResult: 'Iframe 3DS cargado correctamente sin problemas de CORS ni CSP.',
        status: 'passed',
        executedAt: '2026-10-06T12:07:15Z',
        evidences: [
          {
            id: 'ev-pay-2',
            type: 'screenshot',
            name: 'Paso 2 - Modal 3D Secure Banco emisor.png',
            dataUrl: createSvgDataUrl('MODAL 3D SECURE PASARELA', 'Simulador Verified by Visa desplegado', 'PASSED', '#10b981', 'Desafío de prueba solicitado por el emisor.'),
            fileSize: '172 KB',
            timestamp: '2026-10-06 12:07:30'
          }
        ]
      },
      {
        id: 'step-pay-3',
        stepNumber: 3,
        action: 'Ingresar código de autenticación 3DS incorrecto "9999" para verificar control de error bancario',
        testData: 'OTP 3DS: 9999 (Provoca fallo de autenticación)',
        expectedResult: 'El sistema captura el error "3DS_AUTHENTICATION_FAILED", mantiene el carrito activo y muestra mensaje claro al usuario sin recargar la página.',
        actualResult: 'ERROR NO CONTROLADO: La aplicación muestra pantalla en blanco (Crash React ErrorBoundary: Uncaught TypeError: Cannot read property "status" of undefined).',
        status: 'failed',
        executedAt: '2026-10-06T12:09:40Z',
        defect: {
          id: 'BUG-4092',
          title: 'Pantalla blanca (Crash React) al rechazar autenticación 3DS en Checkout',
          severity: 'critical',
          description: 'Al fallar la autenticación 3DS, el callback no verifica si response.paymentIntent existe antes de leer el estado, causando un NullPointerException en cliente que bloquea la UI.',
          jiraTicket: 'PROD-819',
          timestamp: '2026-10-06 12:10:05'
        },
        evidences: [
          {
            id: 'ev-pay-3-img',
            type: 'screenshot',
            name: 'Paso 3 - EVIDENCIA DE DEFECTO: Pantalla Blanca.png',
            dataUrl: createSvgDataUrl('ERROR DE CRASH - PANTALLA EN BLANCO', 'TypeError en checkout/payment-handler.tsx:88', 'DEFECT FOUND', '#ef4444', 'CRITICAL BUG: El usuario pierde los datos del carrito y queda bloqueado sin mensaje de error accesible.'),
            fileSize: '194 KB',
            timestamp: '2026-10-06 12:09:50',
            notes: 'Captura adjunta para ticket JIRA PROD-819.'
          },
          {
            id: 'ev-pay-3-log',
            type: 'log',
            name: 'Paso 3 - StackTrace de Consola DevTools.log',
            textContent: `Uncaught TypeError: Cannot read properties of undefined (reading 'status')
    at PaymentHandler.handle3dsCallback (payment-handler.tsx:88:24)
    at iframeMessageListener (stripe-bridge.ts:42:11)
    at dispatchEvent (event-target.js:192:5)
[HTTP 402] POST /api/v1/payments/confirm - Bank response: "authentication_failed"`,
            timestamp: '2026-10-06 12:09:55',
            notes: 'StackTrace completo para desarrolladores.'
          }
        ]
      }
    ]
  },
  {
    id: 'TC-CART-003',
    title: 'Validación de Cupones de Descuento acumulables y fecha de vigencia',
    description: 'Comprobar que los cupones con fecha vencida o límite de uso agotado son rechazados con feedback explícito, y que los cupones válidos descuentan el porcentaje estipulado.',
    suite: 'Módulo de Carrito & Promociones',
    priority: 'high',
    type: 'regression',
    preconditions: '1. Cupón "SUMMER20" configurado con 20% de descuento activo.\n2. Cupón "EXPIRED10" configurado con fecha límite expirada ayer.',
    testDataRequirements: 'Cupón 1: SUMMER20\nCupón 2: EXPIRED10',
    author: 'Ing. QA Lead',
    assignedTo: 'Carlos Méndez (QA Senior)',
    createdAt: '2026-10-06T08:00:00Z',
    updatedAt: '2026-10-06T09:30:00Z',
    lastExecutedAt: '2026-10-06T09:40:00Z',
    executionDurationSecs: 90,
    overallStatus: 'passed',
    tags: ['Carrito', 'Cupones', 'Promociones', 'Regression'],
    steps: [
      {
        id: 'step-cart-1',
        stepNumber: 1,
        action: 'En la vista del carrito con $100.00 en productos, ingresar el cupón expirado "EXPIRED10" y presionar "Aplicar"',
        testData: 'Código: EXPIRED10',
        expectedResult: 'Mensaje de advertencia en rojo: "El cupón ha expirado. Por favor ingresa uno vigente." El total no cambia.',
        actualResult: 'Alerta descriptiva mostrada en color ámbar/rojo con aria-live para accesibilidad. Total permanece en $100.00.',
        status: 'passed',
        executedAt: '2026-10-06T09:35:00Z',
        evidences: [
          {
            id: 'ev-cart-1',
            type: 'screenshot',
            name: 'Paso 1 - Feedback de Cupón Expirado.png',
            dataUrl: createSvgDataUrl('VALIDACIÓN CUPÓN VENCIDO', 'Mensaje de error controlado correctamente', 'PASSED', '#10b981', 'El usuario recibe aviso claro sin afectación del total.'),
            fileSize: '138 KB',
            timestamp: '2026-10-06 09:35:20'
          }
        ]
      },
      {
        id: 'step-cart-2',
        stepNumber: 2,
        action: 'Ingresar el cupón vigente "SUMMER20" y presionar "Aplicar"',
        testData: 'Código: SUMMER20 (20% off)',
        expectedResult: 'Se aplica descuento de -$20.00 USD, tag visual "SUMMER20 (-20%)" con opción de remover, y el total se actualiza a $80.00 USD.',
        actualResult: 'Descuento aplicado en tiempo real, badge verde creado y monto final ajustado a $80.00 USD.',
        status: 'passed',
        executedAt: '2026-10-06T09:38:00Z',
        evidences: [
          {
            id: 'ev-cart-2',
            type: 'screenshot',
            name: 'Paso 2 - Descuento del 20% reflejado.png',
            dataUrl: createSvgDataUrl('CUPÓN APLICADO SATISFACTORIAMENTE', 'Subtotal: $100.00 | Descuento: -$20.00 | Total: $80.00', 'PASSED', '#10b981', 'Etiqueta con botón de remoción y persistencia en LocalStorage verificada.'),
            fileSize: '155 KB',
            timestamp: '2026-10-06 09:38:30'
          }
        ]
      }
    ]
  }
];
