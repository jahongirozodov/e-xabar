-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "RoleName" AS ENUM ('ADMIN', 'SPECIALIST', 'SECTION_HEAD', 'DEPARTMENT_HEAD');

-- CreateEnum
CREATE TYPE "EmployeeStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('OS', 'LIBRARY', 'APPLICATION', 'FRAMEWORK', 'DATABASE');

-- CreateEnum
CREATE TYPE "AssetStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('NONE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "FindingStatus" AS ENUM ('NEW', 'PENDING_REVIEW', 'APPLICABLE', 'NOTIFIED', 'ACKNOWLEDGED', 'IN_PROGRESS', 'PATCHED', 'PENDING_VERIFICATION', 'VERIFIED', 'CLOSED', 'NOT_APPLICABLE', 'ACCEPTED_RISK', 'NEEDS_INVESTIGATION', 'PATCH_FAILED');

-- CreateEnum
CREATE TYPE "SuppressionScope" AS ENUM ('CVE', 'CVE_ASSET', 'CVE_VENDOR', 'ASSET_ATTR', 'GLOBAL');

-- CreateEnum
CREATE TYPE "ScanType" AS ENUM ('SCHEDULED', 'MANUAL', 'KEV_PRIORITY');

-- CreateEnum
CREATE TYPE "ScanStatus" AS ENUM ('RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('QUEUED', 'SENT', 'FAILED', 'BOUNCED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "totp_secret" TEXT,
    "totp_enabled" BOOLEAN NOT NULL DEFAULT false,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "name" "RoleName" NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "user_id" TEXT NOT NULL,
    "role_id" INTEGER NOT NULL,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("user_id","role_id")
);

-- CreateTable
CREATE TABLE "employees" (
    "id" TEXT NOT NULL,
    "external_id" TEXT,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "section" TEXT,
    "position" TEXT,
    "status" "EmployeeStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assets" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "vendor" TEXT,
    "version" TEXT NOT NULL,
    "purl" TEXT,
    "cpe_uri" TEXT,
    "hostname" TEXT,
    "asset_type" "AssetType" NOT NULL DEFAULT 'APPLICATION',
    "platform" TEXT,
    "description" TEXT,
    "status" "AssetStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_attributes" (
    "id" TEXT NOT NULL,
    "asset_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'imported',

    CONSTRAINT "asset_attributes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_assets" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "asset_id" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unassigned_at" TIMESTAMP(3),

    CONSTRAINT "employee_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vulnerabilities" (
    "id" TEXT NOT NULL,
    "cve_id" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "cvss_v3_score" DECIMAL(3,1),
    "cvss_v3_vector" TEXT,
    "severity" "Severity" NOT NULL DEFAULT 'NONE',
    "epss_score" DECIMAL(5,4),
    "is_kev" BOOLEAN NOT NULL DEFAULT false,
    "kev_added_date" TIMESTAMP(3),
    "published_at" TIMESTAMP(3),
    "last_modified_at" TIMESTAMP(3),
    "affected_versions" JSONB,
    "references" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vulnerabilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vulnerability_sources" (
    "id" TEXT NOT NULL,
    "vulnerability_id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "source_url" TEXT,
    "raw_data" JSONB,
    "patched_versions" JSONB,
    "fetched_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vulnerability_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "findings" (
    "id" TEXT NOT NULL,
    "asset_id" TEXT NOT NULL,
    "vulnerability_id" TEXT NOT NULL,
    "scan_run_id" TEXT,
    "confidence_score" DECIMAL(3,2) NOT NULL,
    "confidence_factors" JSONB,
    "risk_score" DECIMAL(5,2),
    "sources" JSONB NOT NULL,
    "status" "FindingStatus" NOT NULL DEFAULT 'NEW',
    "triage_reason" TEXT,
    "triaged_by" TEXT,
    "triaged_at" TIMESTAMP(3),
    "first_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_verified_at" TIMESTAMP(3),
    "notification_sent_at" TIMESTAMP(3),

    CONSTRAINT "findings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suppressions" (
    "id" TEXT NOT NULL,
    "scope" "SuppressionScope" NOT NULL,
    "cve_id" TEXT,
    "asset_id" TEXT,
    "vendor" TEXT,
    "asset_attribute_filter" JSONB,
    "reason" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "suppressions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scan_runs" (
    "id" TEXT NOT NULL,
    "scan_type" "ScanType" NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finished_at" TIMESTAMP(3),
    "status" "ScanStatus" NOT NULL DEFAULT 'RUNNING',
    "triggered_by" TEXT,
    "assets_scanned" INTEGER NOT NULL DEFAULT 0,
    "findings_new" INTEGER NOT NULL DEFAULT 0,
    "findings_recurring" INTEGER NOT NULL DEFAULT 0,
    "emails_sent" INTEGER NOT NULL DEFAULT 0,
    "errors_count" INTEGER NOT NULL DEFAULT 0,
    "error_log" JSONB,

    CONSTRAINT "scan_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "scan_run_id" TEXT,
    "email_subject" TEXT NOT NULL,
    "findings_count" INTEGER NOT NULL,
    "findings_critical_count" INTEGER NOT NULL DEFAULT 0,
    "findings_high_count" INTEGER NOT NULL DEFAULT 0,
    "status" "NotificationStatus" NOT NULL DEFAULT 'QUEUED',
    "sent_at" TIMESTAMP(3),
    "delivery_attempts" INTEGER NOT NULL DEFAULT 0,
    "error_message" TEXT,
    "acknowledged_at" TIMESTAMP(3),
    "ack_token" TEXT,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_findings" (
    "notification_id" TEXT NOT NULL,
    "finding_id" TEXT NOT NULL,

    CONSTRAINT "notification_findings_pkey" PRIMARY KEY ("notification_id","finding_id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" TEXT NOT NULL,
    "actor_id" TEXT,
    "action" TEXT NOT NULL,
    "entity_type" TEXT,
    "entity_id" TEXT,
    "old_value" JSONB,
    "new_value" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_fp_stats" (
    "id" TEXT NOT NULL,
    "vendor" TEXT NOT NULL,
    "total_findings" INTEGER NOT NULL DEFAULT 0,
    "false_positives" INTEGER NOT NULL DEFAULT 0,
    "fp_rate" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendor_fp_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_settings" (
    "key" TEXT NOT NULL,
    "value_encrypted" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "integration_health" (
    "source" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "last_checked_at" TIMESTAMP(3) NOT NULL,
    "last_success_at" TIMESTAMP(3),
    "error_message" TEXT,

    CONSTRAINT "integration_health_pkey" PRIMARY KEY ("source")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "report_type" TEXT NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "file_path" TEXT,
    "format" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "employees_email_key" ON "employees"("email");

-- CreateIndex
CREATE INDEX "employees_email_idx" ON "employees"("email");

-- CreateIndex
CREATE INDEX "employees_department_idx" ON "employees"("department");

-- CreateIndex
CREATE INDEX "assets_purl_idx" ON "assets"("purl");

-- CreateIndex
CREATE INDEX "assets_status_idx" ON "assets"("status");

-- CreateIndex
CREATE UNIQUE INDEX "assets_name_version_hostname_key" ON "assets"("name", "version", "hostname");

-- CreateIndex
CREATE INDEX "asset_attributes_asset_id_idx" ON "asset_attributes"("asset_id");

-- CreateIndex
CREATE INDEX "asset_attributes_key_value_idx" ON "asset_attributes"("key", "value");

-- CreateIndex
CREATE UNIQUE INDEX "employee_assets_employee_id_asset_id_key" ON "employee_assets"("employee_id", "asset_id");

-- CreateIndex
CREATE UNIQUE INDEX "vulnerabilities_cve_id_key" ON "vulnerabilities"("cve_id");

-- CreateIndex
CREATE INDEX "vulnerabilities_cve_id_idx" ON "vulnerabilities"("cve_id");

-- CreateIndex
CREATE INDEX "vulnerabilities_is_kev_idx" ON "vulnerabilities"("is_kev");

-- CreateIndex
CREATE INDEX "vulnerabilities_severity_idx" ON "vulnerabilities"("severity");

-- CreateIndex
CREATE INDEX "vulnerability_sources_vulnerability_id_idx" ON "vulnerability_sources"("vulnerability_id");

-- CreateIndex
CREATE INDEX "findings_status_idx" ON "findings"("status");

-- CreateIndex
CREATE INDEX "findings_confidence_score_idx" ON "findings"("confidence_score");

-- CreateIndex
CREATE UNIQUE INDEX "findings_asset_id_vulnerability_id_key" ON "findings"("asset_id", "vulnerability_id");

-- CreateIndex
CREATE INDEX "suppressions_is_active_idx" ON "suppressions"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "notifications_ack_token_key" ON "notifications"("ack_token");

-- CreateIndex
CREATE INDEX "audit_log_actor_id_created_at_idx" ON "audit_log"("actor_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "vendor_fp_stats_vendor_key" ON "vendor_fp_stats"("vendor");

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_attributes" ADD CONSTRAINT "asset_attributes_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_assets" ADD CONSTRAINT "employee_assets_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_assets" ADD CONSTRAINT "employee_assets_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vulnerability_sources" ADD CONSTRAINT "vulnerability_sources_vulnerability_id_fkey" FOREIGN KEY ("vulnerability_id") REFERENCES "vulnerabilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "findings" ADD CONSTRAINT "findings_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "findings" ADD CONSTRAINT "findings_vulnerability_id_fkey" FOREIGN KEY ("vulnerability_id") REFERENCES "vulnerabilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "findings" ADD CONSTRAINT "findings_scan_run_id_fkey" FOREIGN KEY ("scan_run_id") REFERENCES "scan_runs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "findings" ADD CONSTRAINT "findings_triaged_by_fkey" FOREIGN KEY ("triaged_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suppressions" ADD CONSTRAINT "suppressions_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suppressions" ADD CONSTRAINT "suppressions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_findings" ADD CONSTRAINT "notification_findings_notification_id_fkey" FOREIGN KEY ("notification_id") REFERENCES "notifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_findings" ADD CONSTRAINT "notification_findings_finding_id_fkey" FOREIGN KEY ("finding_id") REFERENCES "findings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
