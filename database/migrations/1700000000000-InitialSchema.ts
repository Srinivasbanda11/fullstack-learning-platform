import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Initial Database Schema Migration
 *
 * Learning: TypeORM migrations are version-controlled SQL changes.
 * - 'up' method: applies the migration
 * - 'down' method: rolls back the migration
 *
 * Run:    npm run migrate
 * Revert: npm run migrate:revert
 */
export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // PostgreSQL ENUM types
    await queryRunner.query(`CREATE TYPE "job_type_enum" AS ENUM('FULL_TIME','PART_TIME','CONTRACT','FREELANCE','INTERNSHIP','REMOTE')`);
    await queryRunner.query(`CREATE TYPE "experience_level_enum" AS ENUM('ENTRY','MID','SENIOR','LEAD','EXECUTIVE')`);
    await queryRunner.query(`CREATE TYPE "job_status_enum" AS ENUM('DRAFT','ACTIVE','CLOSED','EXPIRED')`);
    await queryRunner.query(`CREATE TYPE "user_role_enum" AS ENUM('JOB_SEEKER','EMPLOYER','ADMIN')`);
    await queryRunner.query(`CREATE TYPE "application_status_enum" AS ENUM('PENDING','REVIEWED','SHORTLISTED','REJECTED','ACCEPTED')`);

    // Users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id"         UUID NOT NULL DEFAULT gen_random_uuid(),
        "email"      VARCHAR(255) NOT NULL,
        "password"   VARCHAR(255) NOT NULL,
        "name"       VARCHAR(255) NOT NULL,
        "role"       "user_role_enum" NOT NULL DEFAULT 'JOB_SEEKER',
        "avatar_url" VARCHAR(500),
        "is_active"  BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_users_email" ON "users" ("email")`);

    // Companies table
    await queryRunner.query(`
      CREATE TABLE "companies" (
        "id"          UUID NOT NULL DEFAULT gen_random_uuid(),
        "name"        VARCHAR(255) NOT NULL,
        "description" TEXT,
        "website"     VARCHAR(500),
        "logo_url"    VARCHAR(500),
        "location"    VARCHAR(255),
        "owner_id"    UUID NOT NULL,
        "created_at"  TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at"  TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_companies" PRIMARY KEY ("id"),
        CONSTRAINT "FK_companies_owner" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // Jobs table
    await queryRunner.query(`
      CREATE TABLE "jobs" (
        "id"               UUID NOT NULL DEFAULT gen_random_uuid(),
        "title"            VARCHAR(255) NOT NULL,
        "description"      TEXT NOT NULL,
        "requirements"     TEXT[] NOT NULL DEFAULT '{}',
        "location"         VARCHAR(255) NOT NULL,
        "remote"           BOOLEAN NOT NULL DEFAULT false,
        "job_type"         "job_type_enum" NOT NULL DEFAULT 'FULL_TIME',
        "experience_level" "experience_level_enum" NOT NULL DEFAULT 'MID',
        "status"           "job_status_enum" NOT NULL DEFAULT 'DRAFT',
        "tags"             TEXT[] NOT NULL DEFAULT '{}',
        "salary_min"       INTEGER,
        "salary_max"       INTEGER,
        "salary_currency"  VARCHAR(3) NOT NULL DEFAULT 'USD',
        "expires_at"       TIMESTAMP,
        "company_id"       UUID NOT NULL,
        "posted_by_id"     UUID NOT NULL,
        "created_at"       TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at"       TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_jobs" PRIMARY KEY ("id"),
        CONSTRAINT "FK_jobs_company" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_jobs_user" FOREIGN KEY ("posted_by_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_jobs_status_created" ON "jobs" ("status", "created_at" DESC)`);
    await queryRunner.query(`CREATE INDEX "IDX_jobs_location" ON "jobs" ("location")`);
    await queryRunner.query(`CREATE INDEX "IDX_jobs_type_level" ON "jobs" ("job_type", "experience_level")`);
    await queryRunner.query(`CREATE INDEX "IDX_jobs_tags" ON "jobs" USING GIN ("tags")`);

    // Applications table
    await queryRunner.query(`
      CREATE TABLE "applications" (
        "id"           UUID NOT NULL DEFAULT gen_random_uuid(),
        "job_id"       UUID NOT NULL,
        "applicant_id" UUID NOT NULL,
        "cover_letter" TEXT,
        "resume_url"   VARCHAR(500),
        "status"       "application_status_enum" NOT NULL DEFAULT 'PENDING',
        "applied_at"   TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_applications" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_app_job_user" UNIQUE ("job_id", "applicant_id"),
        CONSTRAINT "FK_apps_job" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_apps_user" FOREIGN KEY ("applicant_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_applications_job" ON "applications" ("job_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_applications_user" ON "applications" ("applicant_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "applications"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "jobs"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "companies"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "application_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "user_role_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "job_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "experience_level_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "job_type_enum"`);
  }
}
