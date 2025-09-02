-- Crear extensión para UUID si no existe
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Crear tabla Site
CREATE TABLE IF NOT EXISTS "Site" (
    "siteId" VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" VARCHAR(100) NOT NULL,
    "address" VARCHAR(200),
    "phone" VARCHAR(20),
    "email" VARCHAR(100),
    "status" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla Plan
CREATE TABLE IF NOT EXISTS "Plan" (
    "planId" VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
    "siteId" VARCHAR(36) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "monthlyPayments" INTEGER NOT NULL,
    "monthlyAmount" DECIMAL(10,2) NOT NULL,
    "inscriptionFee" DECIMAL(10,2) NOT NULL,
    "validityMonths" INTEGER DEFAULT 12,
    "extensionMonths" INTEGER DEFAULT 4,
    "status" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("siteId") REFERENCES "Site"("siteId")
);

-- Crear tabla Membership
CREATE TABLE IF NOT EXISTS "Membership" (
    "membershipId" VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
    "planId" VARCHAR(36) NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "extensionDate" DATE,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "paidAmount" DECIMAL(10,2) DEFAULT 0,
    "status" VARCHAR(20) DEFAULT 'active',
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("planId") REFERENCES "Plan"("planId")
);

-- Crear tabla Student
CREATE TABLE IF NOT EXISTS "Student" (
    "userId" VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
    "roleId" VARCHAR(7) DEFAULT 'student',
    "siteId" VARCHAR(36) NOT NULL,
    "membershipId" VARCHAR(36),
    "enrollment" VARCHAR(50) UNIQUE NOT NULL,
    "username" VARCHAR(100) UNIQUE NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "fullName" VARCHAR(200) NOT NULL,
    "email" VARCHAR(100),
    "phone" VARCHAR(20),
    "password" VARCHAR(255) NOT NULL,
    "picture" VARCHAR(255),
    "notification" BOOLEAN DEFAULT true,
    "changePass" BOOLEAN DEFAULT true,
    "status" BOOLEAN DEFAULT true,
    "resetPasswordToken" VARCHAR(255),
    "expireResetToken" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "registration" DATE,
    "endLimited" DATE,
    "expiration" DATE,
    "expirationExtension" DATE,
    "workshopHours" INTEGER DEFAULT 0,
    "weekCancellation" INTEGER DEFAULT 0,
    "weeklyAbsences" INTEGER DEFAULT 0,
    "weeklyClass" INTEGER DEFAULT 0,
    "clubHours" INTEGER DEFAULT 0,
    FOREIGN KEY ("siteId") REFERENCES "Site"("siteId"),
    FOREIGN KEY ("membershipId") REFERENCES "Membership"("membershipId")
);

-- Crear tabla Payment
CREATE TABLE IF NOT EXISTS "Payment" (
    "paymentId" VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
    "studentId" VARCHAR(36) NOT NULL,
    "membershipId" VARCHAR(36),
    "receiptNumber" VARCHAR(50) UNIQUE NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "paymentDate" DATE NOT NULL,
    "dueDate" DATE NOT NULL,
    "paymentMethod" VARCHAR(50) NOT NULL,
    "paymentType" VARCHAR(50) NOT NULL,
    "lateFeeDays" INTEGER DEFAULT 0,
    "lateFeeAmount" DECIMAL(10,2) DEFAULT 0,
    "status" VARCHAR(20) DEFAULT 'pending',
    "notes" TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("studentId") REFERENCES "Student"("userId"),
    FOREIGN KEY ("membershipId") REFERENCES "Membership"("membershipId")
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS "idx_student_enrollment" ON "Student"("enrollment");
CREATE INDEX IF NOT EXISTS "idx_student_status" ON "Student"("status");
CREATE INDEX IF NOT EXISTS "idx_payment_status" ON "Payment"("status");
CREATE INDEX IF NOT EXISTS "idx_payment_due_date" ON "Payment"("dueDate");
CREATE INDEX IF NOT EXISTS "idx_payment_student" ON "Payment"("studentId");
