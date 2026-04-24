import path from "node:path";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import mysql from "mysql2/promise";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });
dotenv.config();

const connection = await mysql.createConnection({
  host: process.env.DB_HOST ?? "127.0.0.1",
  port: Number(process.env.DB_PORT ?? "3306"),
  user: process.env.DB_USER ?? "root",
  password: process.env.DB_PASSWORD ?? "root",
  database: process.env.DB_NAME ?? "la_dental"
});

async function ensureUser({ role, email, phone, password, fullName, birthDate, sex, allergies, currentMedications, consultationReason, university, semester, bio, slug, title }) {
  const [rows] = await connection.query("SELECT id FROM users WHERE email = ? LIMIT 1", [email]);
  if (rows[0]?.id) {
    return Number(rows[0].id);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const [userResult] = await connection.query(
    "INSERT INTO users (role, email, phone, password_hash) VALUES (?, ?, ?, ?)",
    [role, email, phone, passwordHash]
  );
  const userId = userResult.insertId;

  if (role === "paciente") {
    await connection.query(
      `
        INSERT INTO patient_profiles (
          user_id, full_name, birth_date, sex, allergies, current_medications, consultation_reason
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [userId, fullName, birthDate, sex, allergies, currentMedications, consultationReason]
    );
  } else {
    await connection.query(
      `
        INSERT INTO doctor_profiles (
          user_id, full_name, university, semester, bio, cv_path, cv_asset_id, public_slug, display_title
        )
        VALUES (?, ?, ?, ?, ?, NULL, NULL, ?, ?)
      `,
      [userId, fullName, university, semester, bio, slug, title]
    );
  }

  return userId;
}

async function seed() {
  const doctor1 = await ensureUser({
    role: "doctor",
    email: "linda@la-demo.mx",
    phone: "+52 55 1111 1111",
    password: "Demo12345",
    fullName: "Linda Martinez",
    university: "Facultad de Odontologia L&A",
    semester: "8vo semestre",
    bio: "Atencion clinica preventiva y restaurativa con seguimiento humano, visual y claro para pacientes.",
    slug: "linda-martinez",
    title: "Estudiante de odontologia"
  });

  const doctor2 = await ensureUser({
    role: "doctor",
    email: "andrea@la-demo.mx",
    phone: "+52 55 2222 2222",
    password: "Demo12345",
    fullName: "Andrea Solis",
    university: "Clinica Universitaria Dental",
    semester: "9no semestre",
    bio: "Me enfoco en limpieza, valoracion y acompanamiento visual con lenguaje simple para el paciente.",
    slug: "andrea-solis",
    title: "Estudiante de odontologia"
  });

  const patient1 = await ensureUser({
    role: "paciente",
    email: "mariana@la-demo.mx",
    phone: "+52 55 3333 3333",
    password: "Demo12345",
    fullName: "Mariana Ruiz",
    birthDate: "1998-05-14",
    sex: "femenino",
    allergies: "Ninguna",
    currentMedications: "Ninguno",
    consultationReason: "Limpieza y revision general"
  });

  const patient2 = await ensureUser({
    role: "paciente",
    email: "carlos@la-demo.mx",
    phone: "+52 55 4444 4444",
    password: "Demo12345",
    fullName: "Carlos Medina",
    birthDate: "1992-11-02",
    sex: "masculino",
    allergies: "Latex",
    currentMedications: "Ibuprofeno ocasional",
    consultationReason: "Molestia en molar posterior"
  });

  await connection.query(
    `
      INSERT IGNORE INTO doctor_services
        (doctor_id, title, category, description, price_mxn, duration_minutes, is_active)
      VALUES
        (?, 'Limpieza dental profunda', 'Preventivo', 'Profilaxis con recomendaciones y seguimiento.', 350, 55, 1),
        (?, 'Valoracion inicial', 'Diagnostico', 'Revision general con plan de tratamiento.', 180, 30, 1),
        (?, 'Resina estetica', 'Restaurativo', 'Restauracion funcional y estetica.', 480, 70, 1)
    `,
    [doctor1, doctor1, doctor2]
  );

  await connection.query(
    `
      INSERT INTO doctor_posts (doctor_id, headline, body, topic, visibility, is_featured)
      SELECT ?, ?, ?, ?, 'public', 1
      WHERE NOT EXISTS (
        SELECT 1 FROM doctor_posts WHERE doctor_id = ? AND headline = ?
      )
    `,
    [
      doctor1,
      "Nueva jornada de limpieza y valoracion",
      "Abrimos espacios con enfoque calmado, explicaciones claras y seguimiento despues de cada cita.",
      "Agenda",
      doctor1,
      "Nueva jornada de limpieza y valoracion"
    ]
  );

  await connection.query(
    `
      INSERT INTO doctor_posts (doctor_id, headline, body, topic, visibility, is_featured)
      SELECT ?, ?, ?, ?, 'patients_only', 0
      WHERE NOT EXISTS (
        SELECT 1 FROM doctor_posts WHERE doctor_id = ? AND headline = ?
      )
    `,
    [
      doctor2,
      "Consejos antes de una resina estetica",
      "Evita alimentos muy pigmentados despues del procedimiento y escribe por mensaje si quieres revisar tu caso.",
      "Cuidados",
      doctor2,
      "Consejos antes de una resina estetica"
    ]
  );

  await connection.query(
    `
      INSERT INTO appointments (patient_id, doctor_id, treatment_title, notes, status, scheduled_for)
      SELECT ?, ?, 'Limpieza dental profunda', 'Quiero una limpieza y revision completa.', 'confirmed', DATE_ADD(NOW(), INTERVAL 2 DAY)
      WHERE NOT EXISTS (
        SELECT 1 FROM appointments WHERE patient_id = ? AND doctor_id = ?
      )
    `,
    [patient1, doctor1, patient1, doctor1]
  );

  await connection.query(
    `
      INSERT INTO appointments (patient_id, doctor_id, treatment_title, notes, status, scheduled_for)
      SELECT ?, ?, 'Valoracion inicial', 'Tengo molestia ligera al masticar.', 'in_review', DATE_ADD(NOW(), INTERVAL 4 DAY)
      WHERE NOT EXISTS (
        SELECT 1 FROM appointments WHERE patient_id = ? AND doctor_id = ?
      )
    `,
    [patient2, doctor2, patient2, doctor2]
  );

  await connection.query(
    `
      INSERT INTO conversations (doctor_id, patient_id)
      SELECT ?, ?
      WHERE NOT EXISTS (
        SELECT 1 FROM conversations WHERE doctor_id = ? AND patient_id = ?
      )
    `,
    [doctor1, patient1, doctor1, patient1]
  );

  const [conversationRows] = await connection.query(
    "SELECT id FROM conversations WHERE doctor_id = ? AND patient_id = ? LIMIT 1",
    [doctor1, patient1]
  );
  const conversationId = conversationRows[0]?.id;

  if (conversationId) {
    await connection.query(
      `
        INSERT IGNORE INTO conversation_members (conversation_id, user_id, role)
        VALUES (?, ?, 'doctor'), (?, ?, 'paciente')
      `,
      [conversationId, doctor1, conversationId, patient1]
    );

    await connection.query(
      `
        INSERT INTO messages (conversation_id, sender_id, body)
        SELECT ?, ?, ?
        WHERE NOT EXISTS (
          SELECT 1 FROM messages WHERE conversation_id = ? AND sender_id = ? AND body = ?
        )
      `,
      [
        conversationId,
        doctor1,
        "Hola Mariana, ya vi tu solicitud. Si quieres te comparto preparacion previa para tu limpieza.",
        conversationId,
        doctor1,
        "Hola Mariana, ya vi tu solicitud. Si quieres te comparto preparacion previa para tu limpieza."
      ]
    );
  }

  await connection.query(
    `
      INSERT INTO clinical_records (patient_id, doctor_id, title, diagnosis, treatment_plan, status)
      SELECT ?, ?, 'Seguimiento inicial', 'Acumulacion ligera de placa y sensibilidad gingival.', 'Limpieza, control de higiene y seguimiento.', 'follow_up'
      WHERE NOT EXISTS (
        SELECT 1 FROM clinical_records WHERE patient_id = ? AND doctor_id = ? AND title = 'Seguimiento inicial'
      )
    `,
    [patient1, doctor1, patient1, doctor1]
  );

  const [recordRows] = await connection.query(
    "SELECT id FROM clinical_records WHERE patient_id = ? AND doctor_id = ? LIMIT 1",
    [patient1, doctor1]
  );
  const recordId = recordRows[0]?.id;

  if (recordId) {
    await connection.query(
      `
        INSERT INTO clinical_record_entries (record_id, author_user_id, entry_type, note)
        SELECT ?, ?, 'assessment', ?
        WHERE NOT EXISTS (
          SELECT 1 FROM clinical_record_entries WHERE record_id = ? AND entry_type = 'assessment'
        )
      `,
      [
        recordId,
        doctor1,
        "Paciente orientada sobre tecnica de cepillado y se agenda seguimiento en dos semanas.",
        recordId
      ]
    );
  }

  console.log("Seed demo completado. Usuarios demo:");
  console.log("Doctor: linda@la-demo.mx / Demo12345");
  console.log("Doctor: andrea@la-demo.mx / Demo12345");
  console.log("Paciente: mariana@la-demo.mx / Demo12345");
  console.log("Paciente: carlos@la-demo.mx / Demo12345");
}

try {
  await seed();
} finally {
  await connection.end();
}
