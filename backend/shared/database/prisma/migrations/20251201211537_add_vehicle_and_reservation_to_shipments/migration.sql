-- AlterTable
-- Agregar columnas a vehicles (si no existen ya)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vehicles' AND column_name = 'transport_method_id') THEN
        ALTER TABLE "vehicles" ADD COLUMN "transport_method_id" UUID;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vehicles' AND column_name = 'driver_id') THEN
        ALTER TABLE "vehicles" ADD COLUMN "driver_id" UUID;
    END IF;
END $$;

-- AlterTable
-- Agregar columnas a shipments
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'shipments' AND column_name = 'vehicle_id') THEN
        ALTER TABLE "shipments" ADD COLUMN "vehicle_id" UUID;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'shipments' AND column_name = 'reservation_id') THEN
        ALTER TABLE "shipments" ADD COLUMN "reservation_id" VARCHAR(100);
    END IF;
END $$;

-- CreateIndex
-- Crear índices si no existen
CREATE INDEX IF NOT EXISTS "idx_vehicles_driver" ON "vehicles"("driver_id");
CREATE INDEX IF NOT EXISTS "idx_vehicles_transport_method" ON "vehicles"("transport_method_id");

-- AddForeignKey
-- Agregar foreign keys si no existen
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'fk_vehicles_transport_method'
    ) THEN
        ALTER TABLE "vehicles" ADD CONSTRAINT "fk_vehicles_transport_method" 
        FOREIGN KEY ("transport_method_id") 
        REFERENCES "transport_methods"("id") 
        ON DELETE NO ACTION 
        ON UPDATE NO ACTION;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'fk_vehicles_driver'
    ) THEN
        ALTER TABLE "vehicles" ADD CONSTRAINT "fk_vehicles_driver" 
        FOREIGN KEY ("driver_id") 
        REFERENCES "drivers"("id") 
        ON DELETE NO ACTION 
        ON UPDATE NO ACTION;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'fk_shipments_vehicle'
    ) THEN
        ALTER TABLE "shipments" ADD CONSTRAINT "fk_shipments_vehicle" 
        FOREIGN KEY ("vehicle_id") 
        REFERENCES "vehicles"("id") 
        ON DELETE SET NULL 
        ON UPDATE NO ACTION;
    END IF;
END $$;




