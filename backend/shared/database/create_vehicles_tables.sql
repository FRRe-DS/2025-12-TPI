-- Crear tabla vehicles
CREATE TABLE IF NOT EXISTS "vehicles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "license_plate" VARCHAR(20) NOT NULL UNIQUE,
    "make" VARCHAR(50) NOT NULL,
    "model" VARCHAR(50) NOT NULL,
    "year" INTEGER NOT NULL,
    "capacity_kg" INTEGER NOT NULL,
    "volume_m3" DECIMAL(10,2) NOT NULL,
    "fuel_type" VARCHAR(20) NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "transport_method_id" UUID,
    "driver_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- Crear tabla drivers
CREATE TABLE IF NOT EXISTS "drivers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "employee_id" VARCHAR(30) NOT NULL UNIQUE,
    "first_name" VARCHAR(80) NOT NULL,
    "last_name" VARCHAR(80) NOT NULL,
    "email" VARCHAR(150) NOT NULL UNIQUE,
    "phone" VARCHAR(30) NOT NULL,
    "license_number" VARCHAR(50) NOT NULL UNIQUE,
    "license_type" VARCHAR(10) NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT "drivers_pkey" PRIMARY KEY ("id")
);

-- Crear índices
CREATE INDEX IF NOT EXISTS "idx_vehicles_license_plate" ON "vehicles"("license_plate");
CREATE INDEX IF NOT EXISTS "idx_vehicles_status" ON "vehicles"("status");
CREATE INDEX IF NOT EXISTS "idx_drivers_employee_id" ON "drivers"("employee_id");
CREATE INDEX IF NOT EXISTS "idx_drivers_email" ON "drivers"("email");
CREATE INDEX IF NOT EXISTS "idx_drivers_status" ON "drivers"("status");

-- Agregar foreign keys
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_transport_method_id_fkey" 
    FOREIGN KEY ("transport_method_id") REFERENCES "transport_methods"("id") ON DELETE SET NULL;

ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_driver_id_fkey" 
    FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE SET NULL;
