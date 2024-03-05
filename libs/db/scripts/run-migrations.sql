DO $$ BEGIN
 CREATE TYPE "facility_type" AS ENUM('Truck', 'Push Cart');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "permit_status" AS ENUM('APPROVED', 'REQUESTED', 'EXPIRED', 'ISSUED', 'SUSPEND');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "facilities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"applicant" varchar(200) NOT NULL,
	"type" "facility_type",
	"cnn" varchar(20) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "locations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"facility_id" uuid NOT NULL,
	"location_id" varchar(20),
	"description" varchar(500),
	"address" varchar(100),
	"block_lot" varchar(20),
	"block" varchar(10),
	"lot" varchar(10),
	"food_items" varchar(500),
	"x" numeric,
	"y" numeric,
	"latitude" numeric(8, 6) NOT NULL,
	"longitude" numeric(9, 6) NOT NULL,
	"location" varchar(100),
	"schedule" varchar(400),
	"days_hours" varchar(50),
	"fire_prevention_districts" varchar(5),
	"police_districts" varchar(5),
	"supervisor_districts" varchar(5),
	"zip_codes" varchar(10),
	"neighborhoods_old" varchar(5)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "permits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"location_id" uuid NOT NULL,
	"permit" varchar(20) NOT NULL,
	"status" "permit_status",
	"noi_sent" timestamp,
	"approved_at" timestamp,
	"received_at" date NOT NULL,
	"prior_permit" boolean DEFAULT false NOT NULL,
	"expiration_date" timestamp,
	CONSTRAINT "permits_location_id_unique" UNIQUE("location_id")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "applicant_idx" ON "facilities" ("applicant");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "faclity_id_idx" ON "locations" ("facility_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "location_id_idx" ON "permits" ("location_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "locations" ADD CONSTRAINT "locations_facility_id_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "permits" ADD CONSTRAINT "permits_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
