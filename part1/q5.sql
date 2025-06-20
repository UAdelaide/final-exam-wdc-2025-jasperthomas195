INSERT INTO Users (username, email, password_hash, role) VALUES
('alice123', 'alice@example.com', 'hashed123', 'owner'),
('bobwalker', 'bob@example.com', 'hashed456', 'walker'),
('carol123', 'carol@example.com', 'hashed789', 'owner'),
('carol123', 'carol@example.com', 'hashed789', 'owner'),
('lebronjames', 'lebron@example.com', 'hashed321', 'walker'),
('jasper', 'jasper@example.com', 'hashed987', 'owner'),

INSERT INTO Dogs (owner_id, name, size) VALUES
((SELECT user_id FROM Users WHERE username = 'alice123'), 'Max', 'medium'),
((SELECT user_id FROM Users WHERE username = 'carol123'), 'Bella', 'small'),
((SELECT user_id FROM Users WHERE username = 'lebronjames'), 'Sam', 'small'),