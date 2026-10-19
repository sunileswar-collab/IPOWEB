CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'ANALYST', 'VIEWER') NOT NULL DEFAULT 'VIEWER',
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ipos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    logo_url VARCHAR(500),
    price_band VARCHAR(100),
    open_date DATE NOT NULL,
    close_date DATE NOT NULL,
    issue_size VARCHAR(100),
    issue_type VARCHAR(100),
    listing_date DATE,
    status ENUM('UPCOMING', 'ONGOING', 'LISTED') NOT NULL DEFAULT 'UPCOMING',
    ipo_price DOUBLE,
    listing_price DOUBLE,
    current_market_price DOUBLE,
    rhp_pdf_url VARCHAR(500),
    drhp_pdf_url VARCHAR(500),
    risk_score ENUM('LOW', 'MEDIUM', 'HIGH'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE watchlist (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    ipo_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (ipo_id) REFERENCES ipos(id) ON DELETE CASCADE,
    UNIQUE KEY unique_watchlist (user_id, ipo_id)
);

CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    ipo_id BIGINT NOT NULL,
    message VARCHAR(500) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (ipo_id) REFERENCES ipos(id) ON DELETE CASCADE
);
