-- Adiciona o campo de observações para os pets
ALTER TABLE IF EXISTS pets
ADD COLUMN IF NOT EXISTS observacoes text;
