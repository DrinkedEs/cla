CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  role ENUM('paciente', 'doctor') NOT NULL,
  email VARCHAR(190) NOT NULL,
  phone VARCHAR(40) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  status ENUM('active', 'disabled') NOT NULL DEFAULT 'active',
  deleted_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
);

CREATE TABLE IF NOT EXISTS sessions (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  token_hash CHAR(64) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_sessions_token_hash (token_hash),
  KEY idx_sessions_user_id (user_id),
  CONSTRAINT fk_sessions_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS patient_profiles (
  user_id INT UNSIGNED NOT NULL,
  full_name VARCHAR(160) NOT NULL,
  birth_date DATE NOT NULL,
  sex ENUM('femenino', 'masculino', 'otro', 'prefiero_no_decir') NOT NULL,
  allergies TEXT NOT NULL,
  current_medications TEXT NOT NULL,
  consultation_reason TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  CONSTRAINT fk_patient_profiles_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS doctor_profiles (
  user_id INT UNSIGNED NOT NULL,
  full_name VARCHAR(160) NOT NULL,
  university VARCHAR(190) NOT NULL,
  semester VARCHAR(60) NOT NULL,
  bio TEXT NOT NULL,
  cv_path VARCHAR(255) NULL,
  cv_asset_id INT UNSIGNED NULL,
  public_slug VARCHAR(190) NOT NULL,
  display_title VARCHAR(190) NOT NULL DEFAULT 'Estudiante de odontologia',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  UNIQUE KEY uq_doctor_profiles_slug (public_slug),
  CONSTRAINT fk_doctor_profiles_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS doctor_photos (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  doctor_id INT UNSIGNED NOT NULL,
  file_path VARCHAR(255) NULL,
  asset_id INT UNSIGNED NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_doctor_photos_doctor_id (doctor_id),
  CONSTRAINT fk_doctor_photos_doctor
    FOREIGN KEY (doctor_id) REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS file_assets (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  owner_user_id INT UNSIGNED NOT NULL,
  purpose ENUM('doctor_cv', 'doctor_photo') NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(190) NOT NULL,
  byte_size INT UNSIGNED NOT NULL,
  sha256 CHAR(64) NOT NULL,
  is_public TINYINT(1) NOT NULL DEFAULT 1,
  content LONGBLOB NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_file_assets_owner_user_id (owner_user_id),
  KEY idx_file_assets_purpose (purpose),
  KEY idx_file_assets_sha256 (sha256),
  CONSTRAINT fk_file_assets_owner
    FOREIGN KEY (owner_user_id) REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS doctor_services (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  doctor_id INT UNSIGNED NOT NULL,
  title VARCHAR(190) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  price_mxn DECIMAL(10, 2) NOT NULL,
  duration_minutes INT NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_doctor_services_doctor_id (doctor_id),
  KEY idx_doctor_services_active (is_active),
  CONSTRAINT fk_doctor_services_doctor
    FOREIGN KEY (doctor_id) REFERENCES users(id)
    ON DELETE CASCADE
);
