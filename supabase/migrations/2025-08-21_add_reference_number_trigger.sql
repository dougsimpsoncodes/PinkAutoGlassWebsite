-- Create function to generate reference numbers
CREATE OR REPLACE FUNCTION generate_reference_number()
RETURNS TRIGGER AS $$
BEGIN
  -- Generate reference number if not provided
  IF NEW.reference_number IS NULL THEN
    NEW.reference_number = 'PAG-' || TO_CHAR(NOW(), 'YYMMDD') || '-' || 
                           LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate reference numbers
DROP TRIGGER IF EXISTS generate_reference_number_trigger ON leads;
CREATE TRIGGER generate_reference_number_trigger
  BEFORE INSERT ON leads
  FOR EACH ROW
  EXECUTE FUNCTION generate_reference_number();

-- Update existing records that don't have reference numbers
UPDATE leads 
SET reference_number = 'PAG-' || TO_CHAR(created_at, 'YYMMDD') || '-' || 
                       LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0')
WHERE reference_number IS NULL;