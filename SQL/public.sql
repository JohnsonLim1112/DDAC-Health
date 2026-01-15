/*
 Navicat Premium Dump SQL

 Source Server         : 123
 Source Server Type    : PostgreSQL
 Source Server Version : 170006 (170006)
 Source Host           : assignment.cuax3k01vlit.us-east-1.rds.amazonaws.com:5432
 Source Catalog        : postgres
 Source Schema         : public

 Target Server Type    : PostgreSQL
 Target Server Version : 170006 (170006)
 File Encoding         : 65001

 Date: 09/01/2026 19:33:55
*/


-- ----------------------------
-- Table structure for book
-- ----------------------------
DROP TABLE IF EXISTS "public"."book";
CREATE TABLE "public"."book" (
  "id" text COLLATE "pg_catalog"."default" NOT NULL,
  "user_id" text COLLATE "pg_catalog"."default" NOT NULL,
  "doctor_id" text COLLATE "pg_catalog"."default" NOT NULL,
  "is_accept" bool NOT NULL,
  "illness_txt" text COLLATE "pg_catalog"."default" NOT NULL,
  "medicine" text COLLATE "pg_catalog"."default" NOT NULL,
  "price" float8 NOT NULL,
  "comment" text COLLATE "pg_catalog"."default" NOT NULL,
  "status" text COLLATE "pg_catalog"."default" NOT NULL,
  "date" timestamp(6),
  "start_time" timestamp(6),
  "end_time" timestamp(6),
  "is_reminded" bool
)
;

-- ----------------------------
-- Table structure for health
-- ----------------------------
DROP TABLE IF EXISTS "public"."health";
CREATE TABLE "public"."health" (
  "id" varchar(50) COLLATE "pg_catalog"."default" NOT NULL,
  "user_id" varchar(50) COLLATE "pg_catalog"."default" NOT NULL,
  "height" numeric(5,2),
  "weight" numeric(5,2),
  "blood_pressure_systolic" int4,
  "blood_pressure_diastolic" int4,
  "medical_history" text COLLATE "pg_catalog"."default",
  "record_date" date NOT NULL,
  "notes" text COLLATE "pg_catalog"."default",
  "create_time" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "update_time" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
)
;

-- ----------------------------
-- Table structure for login
-- ----------------------------
DROP TABLE IF EXISTS "public"."login";
CREATE TABLE "public"."login" (
  "id" varchar(50) COLLATE "pg_catalog"."default" NOT NULL,
  "username" varchar(50) COLLATE "pg_catalog"."default" NOT NULL,
  "password" varchar(100) COLLATE "pg_catalog"."default" NOT NULL,
  "security_password" varchar(100) COLLATE "pg_catalog"."default" NOT NULL,
  "role" varchar(20) COLLATE "pg_catalog"."default" NOT NULL
)
;

-- ----------------------------
-- Table structure for user_info
-- ----------------------------
DROP TABLE IF EXISTS "public"."user_info";
CREATE TABLE "public"."user_info" (
  "user_id" varchar(50) COLLATE "pg_catalog"."default" NOT NULL,
  "name" varchar(100) COLLATE "pg_catalog"."default" NOT NULL,
  "gender" varchar(10) COLLATE "pg_catalog"."default" NOT NULL,
  "age" int4 NOT NULL,
  "address" varchar(500) COLLATE "pg_catalog"."default",
  "specialization" varchar(100) COLLATE "pg_catalog"."default",
  "experience_years" int4,
  "bio" text COLLATE "pg_catalog"."default",
  "picture" varchar(100) COLLATE "pg_catalog"."default"
)
;

-- ----------------------------
-- Primary Key structure for table book
-- ----------------------------
ALTER TABLE "public"."book" ADD CONSTRAINT "book_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table health
-- ----------------------------
CREATE INDEX "idx_health_create_time" ON "public"."health" USING btree (
  "create_time" "pg_catalog"."timestamp_ops" ASC NULLS LAST
);

-- ----------------------------
-- Uniques structure for table health
-- ----------------------------
ALTER TABLE "public"."health" ADD CONSTRAINT "health_user_id_record_date_key" UNIQUE ("user_id", "record_date");

-- ----------------------------
-- Checks structure for table health
-- ----------------------------
ALTER TABLE "public"."health" ADD CONSTRAINT "health_blood_pressure_systolic_check" CHECK (blood_pressure_systolic >= 0);
ALTER TABLE "public"."health" ADD CONSTRAINT "health_height_check" CHECK (height > 0::numeric AND height <= 300::numeric);
ALTER TABLE "public"."health" ADD CONSTRAINT "health_blood_pressure_diastolic_check" CHECK (blood_pressure_diastolic >= 0);
ALTER TABLE "public"."health" ADD CONSTRAINT "health_weight_check" CHECK (weight > 0::numeric AND weight <= 500::numeric);

-- ----------------------------
-- Primary Key structure for table health
-- ----------------------------
ALTER TABLE "public"."health" ADD CONSTRAINT "health_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Uniques structure for table login
-- ----------------------------
ALTER TABLE "public"."login" ADD CONSTRAINT "login_username_key" UNIQUE ("username");

-- ----------------------------
-- Primary Key structure for table login
-- ----------------------------
ALTER TABLE "public"."login" ADD CONSTRAINT "login_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table user_info
-- ----------------------------
ALTER TABLE "public"."user_info" ADD CONSTRAINT "user_info_pkey" PRIMARY KEY ("user_id");

-- ----------------------------
-- Foreign Keys structure for table health
-- ----------------------------
ALTER TABLE "public"."health" ADD CONSTRAINT "health_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."login" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
