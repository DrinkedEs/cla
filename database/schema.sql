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

CREATE TABLE IF NOT EXISTS doctor_posts (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  doctor_id INT UNSIGNED NOT NULL,
  headline VARCHAR(190) NOT NULL,
  body TEXT NOT NULL,
  topic VARCHAR(100) NOT NULL,
  visibility ENUM('public', 'patients_only') NOT NULL DEFAULT 'public',
  is_featured TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_doctor_posts_doctor_id (doctor_id),
  KEY idx_doctor_posts_visibility (visibility),
  CONSTRAINT fk_doctor_posts_doctor
    FOREIGN KEY (doctor_id) REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS post_reactions (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  post_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  reaction_type ENUM('apoyo', 'me_interesa', 'gracias') NOT NULL DEFAULT 'apoyo',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_post_reactions_post_user (post_id, user_id),
  KEY idx_post_reactions_user_id (user_id),
  CONSTRAINT fk_post_reactions_post
    FOREIGN KEY (post_id) REFERENCES doctor_posts(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_post_reactions_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS appointments (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  patient_id INT UNSIGNED NOT NULL,
  doctor_id INT UNSIGNED NOT NULL,
  treatment_title VARCHAR(190) NOT NULL,
  notes TEXT NOT NULL,
  status ENUM('pending', 'confirmed', 'completed', 'cancelled', 'in_review') NOT NULL DEFAULT 'pending',
  scheduled_for DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_appointments_patient_id (patient_id),
  KEY idx_appointments_doctor_id (doctor_id),
  KEY idx_appointments_status (status),
  CONSTRAINT fk_appointments_patient
    FOREIGN KEY (patient_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_appointments_doctor
    FOREIGN KEY (doctor_id) REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS appointment_status_history (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  appointment_id INT UNSIGNED NOT NULL,
  changed_by_user_id INT UNSIGNED NOT NULL,
  status ENUM('pending', 'confirmed', 'completed', 'cancelled', 'in_review') NOT NULL,
  note VARCHAR(255) NOT NULL DEFAULT '',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_appointment_status_history_appointment_id (appointment_id),
  CONSTRAINT fk_appointment_status_history_appointment
    FOREIGN KEY (appointment_id) REFERENCES appointments(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_appointment_status_history_user
    FOREIGN KEY (changed_by_user_id) REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS conversations (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  doctor_id INT UNSIGNED NOT NULL,
  patient_id INT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_conversations_doctor_patient (doctor_id, patient_id),
  CONSTRAINT fk_conversations_doctor
    FOREIGN KEY (doctor_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_conversations_patient
    FOREIGN KEY (patient_id) REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS conversation_members (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  conversation_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  role ENUM('paciente', 'doctor') NOT NULL,
  joined_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_conversation_members_conversation_user (conversation_id, user_id),
  KEY idx_conversation_members_user_id (user_id),
  CONSTRAINT fk_conversation_members_conversation
    FOREIGN KEY (conversation_id) REFERENCES conversations(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_conversation_members_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS messages (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  conversation_id INT UNSIGNED NOT NULL,
  sender_id INT UNSIGNED NOT NULL,
  body TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_messages_conversation_id (conversation_id),
  KEY idx_messages_sender_id (sender_id),
  CONSTRAINT fk_messages_conversation
    FOREIGN KEY (conversation_id) REFERENCES conversations(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_messages_sender
    FOREIGN KEY (sender_id) REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS clinical_records (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  patient_id INT UNSIGNED NOT NULL,
  doctor_id INT UNSIGNED NOT NULL,
  title VARCHAR(190) NOT NULL,
  diagnosis TEXT NOT NULL,
  treatment_plan TEXT NOT NULL,
  status ENUM('active', 'completed', 'follow_up') NOT NULL DEFAULT 'active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_clinical_records_patient_id (patient_id),
  KEY idx_clinical_records_doctor_id (doctor_id),
  CONSTRAINT fk_clinical_records_patient
    FOREIGN KEY (patient_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_clinical_records_doctor
    FOREIGN KEY (doctor_id) REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS clinical_record_entries (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  record_id INT UNSIGNED NOT NULL,
  author_user_id INT UNSIGNED NOT NULL,
  entry_type ENUM('assessment', 'progress', 'prescription', 'follow_up') NOT NULL,
  note TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_clinical_record_entries_record_id (record_id),
  CONSTRAINT fk_clinical_record_entries_record
    FOREIGN KEY (record_id) REFERENCES clinical_records(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_clinical_record_entries_author
    FOREIGN KEY (author_user_id) REFERENCES users(id)
    ON DELETE CASCADE
);
