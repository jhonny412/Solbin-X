-- SQL para crear la tabla de estadísticas y función de contador de visitas
-- Ejecutar esto en el SQL Editor de Supabase

-- 1. Crear tabla para estadísticas del sitio
CREATE TABLE IF NOT EXISTS site_stats (
    id INTEGER PRIMARY KEY DEFAULT 1,
    visit_count INTEGER DEFAULT 0,
    last_visit TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Insertar registro inicial (solo si no existe)
INSERT INTO site_stats (id, visit_count, last_visit, updated_at)
VALUES (1, 0, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 3. Crear función para incrementar el contador de visitas
CREATE OR REPLACE FUNCTION increment_visit_count()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_count INTEGER;
BEGIN
    UPDATE site_stats 
    SET visit_count = visit_count + 1,
        last_visit = NOW(),
        updated_at = NOW()
    WHERE id = 1
    RETURNING visit_count INTO new_count;
    
    RETURN new_count;
END;
$$;

-- 4. Crear función para obtener el contador actual (opcional, pero útil)
CREATE OR REPLACE FUNCTION get_visit_count()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_count INTEGER;
BEGIN
    SELECT visit_count INTO current_count
    FROM site_stats
    WHERE id = 1;
    
    RETURN COALESCE(current_count, 0);
END;
$$;

-- 5. Configurar políticas RLS (Row Level Security) - Opcional pero recomendado
ALTER TABLE site_stats ENABLE ROW LEVEL SECURITY;

-- Permitir lectura pública
CREATE POLICY "Permitir lectura pública de estadísticas"
    ON site_stats
    FOR SELECT
    TO PUBLIC
    USING (true);

-- Permitir actualización solo a usuarios autenticados o via RPC
CREATE POLICY "Permitir actualización via RPC"
    ON site_stats
    FOR UPDATE
    TO PUBLIC
    USING (true)
    WITH CHECK (true);

-- Verificar que todo esté configurado correctamente
SELECT 'Configuración completada' as status;
SELECT * FROM site_stats;
