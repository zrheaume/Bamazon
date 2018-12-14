use bamazonDB;

UPDATE products
SET cost = 10.99
WHERE item_id = 1;

UPDATE products
SET cost = 0.99
WHERE item_id = 2;

UPDATE products
SET cost = 1.99
WHERE item_id = 3;

UPDATE products
SET cost = 0.21
WHERE item_id = 4;

UPDATE products
SET cost = 0.69
WHERE item_id = 5;

UPDATE products
SET cost = 0.89
WHERE item_id = 6;

UPDATE products
SET cost = 2.05
WHERE item_id = 7;

UPDATE products
SET cost = 21.50
WHERE item_id = 8;

UPDATE products
SET cost = 900
WHERE item_id = 9;

UPDATE products
SET cost = 80.00
WHERE item_id = 10;

UPDATE products
SET cost = 1499.99
WHERE item_id = 11;

UPDATE products
SET cost = 6.75
WHERE item_id = 12;

UPDATE products
SET cost = 18.50
WHERE item_id = 13;

UPDATE products
SET cost = 4.25
WHERE item_id = 14;

UPDATE products
SET cost = 24.00
WHERE item_id = 15;

SELECT * FROM products
