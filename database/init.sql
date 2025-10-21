CREATE TABLE tickets(
  id SERIAL PRIMARY KEY,
  user_id INT,
  ticket_number VARCHAR(20),
  status VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE payments(
  id SERIAL PRIMARY KEY,
  ticket_id INT,
  amount DECIMAL(10,2),
  status VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO tickets (user_id, ticket_number, status)
VALUES (1, 'TCK12345', 'PENDING');
