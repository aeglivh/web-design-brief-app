-- Add VAT rate to rates table (0 = VAT-exempt, e.g. 8.1 for Switzerland)
alter table rates add column if not exists vat_rate numeric default 0;
