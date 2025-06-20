INSERT INTO Users (username, email, password_hash, role) VALUES
('alice123', 'alice@example.com', 'hashed123', 'owner'),
('bobwalker', 'bob@example.com', 'hashed456', 'walker'),
('carol123', 'carol@example.com', 'hashed789', 'owner'),
('carol123', 'carol@example.com', 'hashed789', 'owner'),
('lebronjames', 'lebron@example.com', 'hashed321', 'walker'),
('jasper', 'jasper@example.com', 'hashed987', 'owner');

INSERT INTO Dogs (owner_id, name, size) VALUES
((SELECT user_id FROM Users WHERE username = 'alice123'), 'Max', 'medium'),
((SELECT user_id FROM Users WHERE username = 'carol123'), 'Bella', 'small'),
((SELECT user_id FROM Users WHERE username = 'lebronjames'), 'Sam', 'large'),
((SELECT user_id FROM Users WHERE username = 'jasper'), 'Spot', 'medium'),
((SELECT user_id FROM Users WHERE username = 'jasper'), 'Reggie', 'large');

INSERT INTO WalkRequests (dog_id, requested_time, duration_minutes, location, status) VALUES
((SELECT dog_id FROM Dogs WHERE name = 'Max' AND owner_id = (select user_id FROM Users WHERE username = 'alice123')), '2025-06-10 08:00:00', 30, 'Parklands', 'open'),
((SELECT dog_id FROM Dogs WHERE name = 'Bella' AND owner_id = (select user_id FROM Users WHERE username = 'carol123')), '2025-06-10 09:30:00', 45, 'Beachside Ave', 'accepted'),
((SELECT dog_id FROM Dogs WHERE name = 'Bella' AND owner_id = (select user_id FROM Users WHERE username = 'carol123')), '2025-06-10 09:30:00', 45, 'Beachside Ave', 'accepted'),