-- AlterTable: aumenta precisão de areaM2 para suportar áreas grandes (rurais etc.)
ALTER TABLE "properties" ALTER COLUMN "area_m2" TYPE DECIMAL(12,2);
