-- Initial schema initialization
CREATE TABLE IF NOT EXISTS system_metadata (
    id VARCHAR(50) PRIMARY KEY,
    initialized_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    description TEXT
);

INSERT INTO system_metadata (id, description)
VALUES ('SYSTEM_INIT', 'SignalHire database initialized successfully')
ON CONFLICT (id) DO NOTHING;
