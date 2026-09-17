-- PhoneDir database schema.
-- Run this in phpMyAdmin (SQL tab) on your NEW Freehostia database.

CREATE TABLE phones (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(255)  NOT NULL,
    brand       VARCHAR(255)  NOT NULL,
    model       VARCHAR(255)  NOT NULL,
    price       DECIMAL(10,2) NOT NULL,
    description TEXT,
    image_url   VARCHAR(1000)
);

-- Optional seed rows for testing (safe to delete afterwards).
INSERT INTO phones (name, brand, model, price, description, image_url) VALUES
('Galaxy S24 Ultra', 'Samsung', 'SM-S928B', 74999.00, 'Flagship with S Pen and titanium frame.', ''),
('iPhone 15 Pro',    'Apple',   'A3102',    71990.00, 'A17 Pro chip, titanium design.',          ''),
('Pixel 8 Pro',      'Google',  'GC3VE',    56990.00, 'Tensor G3 with 7 years of updates.',      '');
