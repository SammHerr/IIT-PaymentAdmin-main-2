-- Insertar sitio por defecto
INSERT INTO "Site" ("siteId", "name", "address", "phone", "email") 
VALUES ('default-site-id', 'Inglés Individual Tapachula', 'Tapachula, Chiapas', '962-000-0000', 'info@inglesindividual.com')
ON CONFLICT ("siteId") DO NOTHING;

-- Insertar planes por defecto
INSERT INTO "Plan" ("planId", "siteId", "name", "monthlyPayments", "monthlyAmount", "inscriptionFee") VALUES
('plan-5-months', 'default-site-id', 'Plan 5 Mensualidades', 5, 1200.00, 500.00),
('plan-8-months', 'default-site-id', 'Plan 8 Mensualidades', 8, 1500.00, 800.00),
('plan-10-months', 'default-site-id', 'Plan 10 Mensualidades', 10, 1800.00, 1000.00)
ON CONFLICT ("planId") DO NOTHING;

-- Insertar membresías de ejemplo
INSERT INTO "Membership" ("membershipId", "planId", "startDate", "endDate", "extensionDate", "totalAmount") VALUES
('membership-1', 'plan-8-months', '2024-01-01', '2025-01-01', '2025-05-01', 12800.00),
('membership-2', 'plan-10-months', '2024-02-01', '2025-02-01', '2025-06-01', 19000.00),
('membership-3', 'plan-5-months', '2023-06-01', '2024-06-01', '2024-10-01', 6500.00)
ON CONFLICT ("membershipId") DO NOTHING;

-- Insertar estudiantes de ejemplo
INSERT INTO "Student" (
    "userId", "siteId", "membershipId", "enrollment", "username", 
    "name", "lastName", "fullName", "email", "phone", "password",
    "registration", "expiration", "expirationExtension"
) VALUES
(
    'student-1', 'default-site-id', 'membership-1', 'ENG001', 'juan.perez',
    'Juan', 'Pérez García', 'Juan Pérez García', 'juan@email.com', '962-123-4567',
    '$2a$10$example.hash.password', '2024-01-01', '2025-01-01', '2025-05-01'
),
(
    'student-2', 'default-site-id', 'membership-2', 'ENG002', 'maria.lopez',
    'María', 'López Hernández', 'María López Hernández', 'maria@email.com', '962-234-5678',
    '$2a$10$example.hash.password', '2024-02-01', '2025-02-01', '2025-06-01'
),
(
    'student-3', 'default-site-id', 'membership-3', 'ENG003', 'carlos.rodriguez',
    'Carlos', 'Rodríguez Sánchez', 'Carlos Rodríguez Sánchez', 'carlos@email.com', '962-345-6789',
    '$2a$10$example.hash.password', '2023-06-01', '2024-06-01', '2024-10-01'
)
ON CONFLICT ("userId") DO NOTHING;

-- Insertar pagos de ejemplo
INSERT INTO "Payment" (
    "paymentId", "studentId", "membershipId", "receiptNumber", "amount",
    "paymentDate", "dueDate", "paymentMethod", "paymentType", "status"
) VALUES
(
    'payment-1', 'student-1', 'membership-1', 'REC001', 1500.00,
    '2024-01-15', '2024-01-10', 'Efectivo', 'monthly', 'paid'
),
(
    'payment-2', 'student-2', 'membership-2', 'REC002', 1800.00,
    '2024-02-01', '2024-02-01', 'Transferencia', 'monthly', 'paid'
),
(
    'payment-3', 'student-3', 'membership-3', 'REC003', 1200.00,
    '2024-01-01', '2024-01-05', 'Efectivo', 'monthly', 'pending'
)
ON CONFLICT ("paymentId") DO NOTHING;
