import type { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { db, queryOne, withTransaction } from "@/lib/db";
import {
  buildMediaUrl,
  deleteAssetIfUnreferenced,
  insertFileAsset,
  type FileAssetInput
} from "@/lib/file-assets";
import { apiError } from "@/lib/http";
import { slugify } from "@/lib/slug";
import type {
  ActivitySummary,
  Appointment,
  AppointmentStatus,
  ClinicalRecord,
  ClinicalRecordEntry,
  ConversationPreview,
  DirectMessage,
  DoctorAccount,
  DoctorDashboardData,
  DoctorPhoto,
  DoctorService,
  FeedPost,
  FeedVisibility,
  PatientAccount,
  PatientDashboardData,
  PublicDoctor,
  PublicDoctorProfile,
  PublicService,
  Role,
  SessionUser
} from "@/lib/types";

type CountRow = RowDataPacket & {
  total: number;
};

type PatientRow = RowDataPacket & {
  id: number;
  role: Role;
  email: string;
  phone: string;
  status: "active" | "disabled";
  full_name: string;
  birth_date: Date | string;
  sex: PatientAccount["profile"]["sex"];
  allergies: string;
  current_medications: string;
  consultation_reason: string;
};

type DoctorProfileRow = RowDataPacket & {
  id: number;
  role: Role;
  email: string;
  phone: string;
  status: "active" | "disabled";
  full_name: string;
  university: string;
  semester: string;
  bio: string;
  cv_asset_id: number | null;
  cv_original_name: string | null;
  public_slug: string;
  display_title: string;
};

type DoctorServiceRow = RowDataPacket & {
  id: number;
  title: string;
  category: string;
  description: string;
  price_mxn: number;
  duration_minutes: number;
  is_active: 0 | 1;
};

type DoctorPhotoRow = RowDataPacket & {
  id: number;
  asset_id: number;
  sort_order: number;
};

type PublicDoctorRow = RowDataPacket & {
  id: number;
  full_name: string;
  public_slug: string;
  display_title: string;
  university: string;
  semester: string;
  bio: string;
  photo_asset_id: number | null;
  service_count: number;
};

type PublicServiceRow = RowDataPacket & {
  id: number;
  title: string;
  category: string;
  description: string;
  price_mxn: number;
  duration_minutes: number;
  doctor_id: number;
  doctor_name: string;
  doctor_slug: string;
  doctor_title: string;
  doctor_university: string;
  doctor_semester: string;
  doctor_bio: string;
  photo_asset_id: number | null;
};

type FeedPostRow = RowDataPacket & {
  id: number;
  doctor_id: number;
  doctor_name: string;
  doctor_slug: string;
  doctor_title: string;
  doctor_university: string;
  doctor_semester: string;
  doctor_photo_asset_id: number | null;
  headline: string;
  body: string;
  topic: string;
  visibility: FeedVisibility;
  is_featured: 0 | 1;
  reaction_count: number;
  created_at: Date | string;
};

type AppointmentRow = RowDataPacket & {
  id: number;
  patient_id: number;
  patient_name: string;
  doctor_id: number;
  doctor_name: string;
  doctor_slug: string;
  treatment_title: string;
  notes: string;
  status: AppointmentStatus;
  scheduled_for: Date | string;
  created_at: Date | string;
};

type ConversationPreviewRow = RowDataPacket & {
  conversation_id: number;
  counterpart_name: string;
  counterpart_role: Role;
  counterpart_slug: string | null;
  last_message: string | null;
  last_message_at: Date | string | null;
  unread_count: number;
};

type MessageRow = RowDataPacket & {
  id: number;
  conversation_id: number;
  sender_id: number;
  sender_name: string;
  body: string;
  created_at: Date | string;
};

type ClinicalRecordRow = RowDataPacket & {
  id: number;
  patient_id: number;
  patient_name: string;
  doctor_id: number;
  doctor_name: string;
  title: string;
  diagnosis: string;
  treatment_plan: string;
  status: "active" | "completed" | "follow_up";
  created_at: Date | string;
  updated_at: Date | string;
};

type ClinicalRecordEntryRow = RowDataPacket & {
  id: number;
  record_id: number;
  note: string;
  entry_type: "assessment" | "progress" | "prescription" | "follow_up";
  created_at: Date | string;
  author_name: string;
};

function formatDateInput(value: Date | string) {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return value.slice(0, 10);
}

function formatDateTime(value: Date | string) {
  if (value instanceof Date) {
    return value.toISOString();
  }

  return new Date(value).toISOString();
}

function mapDoctorPhoto(row: DoctorPhotoRow): DoctorPhoto {
  return {
    id: row.id,
    fileUrl: buildMediaUrl(row.asset_id) ?? "",
    sortOrder: row.sort_order
  };
}

function mapDoctorService(row: DoctorServiceRow): DoctorService {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    description: row.description,
    priceMxn: Number(row.price_mxn),
    durationMinutes: row.duration_minutes,
    isActive: Boolean(row.is_active)
  };
}

function mapPublicDoctor(row: PublicDoctorRow): PublicDoctor {
  return {
    id: row.id,
    fullName: row.full_name,
    slug: row.public_slug,
    displayTitle: row.display_title,
    university: row.university,
    semester: row.semester,
    bio: row.bio,
    photoUrl: buildMediaUrl(row.photo_asset_id),
    serviceCount: Number(row.service_count)
  };
}

function mapPublicService(row: PublicServiceRow): PublicService {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    description: row.description,
    priceMxn: Number(row.price_mxn),
    durationMinutes: row.duration_minutes,
    doctorId: row.doctor_id,
    doctorName: row.doctor_name,
    doctorSlug: row.doctor_slug,
    doctorTitle: row.doctor_title,
    doctorUniversity: row.doctor_university,
    doctorSemester: row.doctor_semester,
    doctorBio: row.doctor_bio,
    photoUrl: buildMediaUrl(row.photo_asset_id)
  };
}

function mapFeedPost(row: FeedPostRow): FeedPost {
  return {
    id: row.id,
    doctorId: row.doctor_id,
    doctorName: row.doctor_name,
    doctorSlug: row.doctor_slug,
    doctorTitle: row.doctor_title,
    doctorUniversity: row.doctor_university,
    doctorSemester: row.doctor_semester,
    doctorPhotoUrl: buildMediaUrl(row.doctor_photo_asset_id),
    headline: row.headline,
    body: row.body,
    topic: row.topic,
    visibility: row.visibility,
    featured: Boolean(row.is_featured),
    reactionCount: Number(row.reaction_count ?? 0),
    createdAt: formatDateTime(row.created_at)
  };
}

function mapAppointment(row: AppointmentRow): Appointment {
  return {
    id: row.id,
    patientId: row.patient_id,
    patientName: row.patient_name,
    doctorId: row.doctor_id,
    doctorName: row.doctor_name,
    doctorSlug: row.doctor_slug,
    treatmentTitle: row.treatment_title,
    notes: row.notes,
    status: row.status,
    scheduledFor: formatDateTime(row.scheduled_for),
    createdAt: formatDateTime(row.created_at)
  };
}

function mapConversationPreview(row: ConversationPreviewRow): ConversationPreview {
  return {
    conversationId: row.conversation_id,
    counterpartName: row.counterpart_name,
    counterpartRole: row.counterpart_role,
    counterpartSlug: row.counterpart_slug,
    lastMessage: row.last_message ?? "Sin mensajes todavia.",
    lastMessageAt: row.last_message_at ? formatDateTime(row.last_message_at) : new Date(0).toISOString(),
    unreadCount: Number(row.unread_count ?? 0)
  };
}

function mapMessage(row: MessageRow, currentUserId: number): DirectMessage {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    senderName: row.sender_name,
    body: row.body,
    createdAt: formatDateTime(row.created_at),
    isOwn: row.sender_id === currentUserId
  };
}

function mapClinicalRecord(row: ClinicalRecordRow): ClinicalRecord {
  return {
    id: row.id,
    patientId: row.patient_id,
    patientName: row.patient_name,
    doctorId: row.doctor_id,
    doctorName: row.doctor_name,
    title: row.title,
    diagnosis: row.diagnosis,
    treatmentPlan: row.treatment_plan,
    status: row.status,
    createdAt: formatDateTime(row.created_at),
    updatedAt: formatDateTime(row.updated_at)
  };
}

function mapClinicalEntry(row: ClinicalRecordEntryRow): ClinicalRecordEntry {
  return {
    id: row.id,
    recordId: row.record_id,
    note: row.note,
    entryType: row.entry_type,
    createdAt: formatDateTime(row.created_at),
    authorName: row.author_name
  };
}

function buildActivitySummary(userRole: Role, counts: {
  feed: number;
  appointments: number;
  conversations: number;
  records: number;
  services?: number;
  photos?: number;
}): ActivitySummary[] {
  const items: ActivitySummary[] = [
    {
      title: "Publicaciones",
      value: String(counts.feed),
      description: "Actualizaciones visibles para dar vida al feed clinico."
    },
    {
      title: "Citas activas",
      value: String(counts.appointments),
      description: "Agenda en movimiento con estados y seguimiento."
    },
    {
      title: "Mensajes",
      value: String(counts.conversations),
      description: "Conversaciones abiertas entre pacientes y doctores."
    },
    {
      title: "Expedientes",
      value: String(counts.records),
      description: "Historial clinico persistente para seguimiento."
    }
  ];

  if (userRole === "doctor") {
    items.unshift({
      title: "Servicios",
      value: String(counts.services ?? 0),
      description: "Tratamientos activos y visibles en tu perfil."
    });
    items.push({
      title: "Galeria",
      value: String(counts.photos ?? 0),
      description: "Fotos profesionales para reforzar confianza."
    });
  }

  return items;
}

async function ensureEmailAvailable(
  connection: PoolConnection,
  email: string,
  excludeUserId?: number
) {
  const values = excludeUserId ? [email, excludeUserId] : [email];
  const condition = excludeUserId ? "AND id <> ?" : "";
  const [rows] = await connection.query<RowDataPacket[]>(
    `SELECT id FROM users WHERE email = ? AND deleted_at IS NULL ${condition} LIMIT 1`,
    values
  );

  if (rows[0]) {
    apiError("Ese correo ya esta registrado.", 409);
  }
}

async function buildUniqueDoctorSlug(
  connection: PoolConnection,
  fullName: string
) {
  const baseSlug = slugify(fullName) || "doctor-la";
  let currentSlug = baseSlug;
  let counter = 2;

  while (true) {
    const [rows] = await connection.query<RowDataPacket[]>(
      "SELECT user_id FROM doctor_profiles WHERE public_slug = ? LIMIT 1",
      [currentSlug]
    );

    if (!rows[0]) {
      return currentSlug;
    }

    currentSlug = `${baseSlug}-${counter}`;
    counter += 1;
  }
}

async function getDoctorProfileRecordByUserId(userId: number) {
  return queryOne<DoctorProfileRow>(
    `
      SELECT
        u.id,
        u.role,
        u.email,
        u.phone,
        u.status,
        dp.full_name,
        dp.university,
        dp.semester,
        dp.bio,
        dp.cv_asset_id,
        fa.original_name AS cv_original_name,
        dp.public_slug,
        dp.display_title
      FROM users u
      INNER JOIN doctor_profiles dp ON dp.user_id = u.id
      LEFT JOIN file_assets fa ON fa.id = dp.cv_asset_id
      WHERE u.id = ? AND u.role = 'doctor'
      LIMIT 1
    `,
    [userId]
  );
}

async function ensureConversationBetween(
  connection: PoolConnection,
  doctorId: number,
  patientId: number
) {
  const [rows] = await connection.query<RowDataPacket[]>(
    "SELECT id FROM conversations WHERE doctor_id = ? AND patient_id = ? LIMIT 1",
    [doctorId, patientId]
  );

  if (rows[0]?.id) {
    return Number(rows[0].id);
  }

  const [result] = await connection.query<ResultSetHeader>(
    "INSERT INTO conversations (doctor_id, patient_id) VALUES (?, ?)",
    [doctorId, patientId]
  );

  const conversationId = result.insertId;

  await connection.query(
    "INSERT INTO conversation_members (conversation_id, user_id, role) VALUES (?, ?, 'doctor'), (?, ?, 'paciente')",
    [conversationId, doctorId, conversationId, patientId]
  );

  return conversationId;
}

export async function getPublicStats() {
  const [doctorRows] = await db.query<CountRow[]>(
    `
      SELECT COUNT(*) AS total
      FROM users
      WHERE role = 'doctor'
        AND status = 'active'
        AND deleted_at IS NULL
    `
  );
  const [serviceRows] = await db.query<CountRow[]>(
    `
      SELECT COUNT(*) AS total
      FROM doctor_services ds
      INNER JOIN users u ON u.id = ds.doctor_id
      WHERE ds.is_active = 1
        AND u.status = 'active'
        AND u.deleted_at IS NULL
    `
  );

  return {
    activeDoctors: doctorRows[0]?.total ?? 0,
    activeServices: serviceRows[0]?.total ?? 0
  };
}

export async function getFeaturedDoctors(limit = 4) {
  const [rows] = await db.query<PublicDoctorRow[]>(
    `
      SELECT
        u.id,
        dp.full_name,
        dp.public_slug,
        dp.display_title,
        dp.university,
        dp.semester,
        dp.bio,
        (
          SELECT photo.asset_id
          FROM doctor_photos photo
          WHERE photo.doctor_id = u.id
            AND photo.asset_id IS NOT NULL
          ORDER BY photo.sort_order ASC, photo.id ASC
          LIMIT 1
        ) AS photo_asset_id,
        (
          SELECT COUNT(*)
          FROM doctor_services ds
          WHERE ds.doctor_id = u.id AND ds.is_active = 1
        ) AS service_count
      FROM users u
      INNER JOIN doctor_profiles dp ON dp.user_id = u.id
      WHERE u.role = 'doctor'
        AND u.status = 'active'
        AND u.deleted_at IS NULL
      ORDER BY service_count DESC, u.created_at DESC
      LIMIT ?
    `,
    [limit]
  );

  return rows.map(mapPublicDoctor);
}

export async function searchPublicServices({
  query = "",
  category = ""
}: {
  query?: string;
  category?: string;
} = {}) {
  const normalizedQuery = query.trim();
  const normalizedCategory = category.trim();

  const conditions = [
    "u.status = 'active'",
    "u.deleted_at IS NULL",
    "ds.is_active = 1"
  ];
  const values: unknown[] = [];

  if (normalizedQuery) {
    conditions.push(
      "(ds.title LIKE ? OR ds.category LIKE ? OR ds.description LIKE ? OR dp.full_name LIKE ? OR dp.university LIKE ?)"
    );
    const wildcard = `%${normalizedQuery}%`;
    values.push(wildcard, wildcard, wildcard, wildcard, wildcard);
  }

  if (normalizedCategory) {
    conditions.push("ds.category LIKE ?");
    values.push(`%${normalizedCategory}%`);
  }

  const [rows] = await db.query<PublicServiceRow[]>(
    `
      SELECT
        ds.id,
        ds.title,
        ds.category,
        ds.description,
        ds.price_mxn,
        ds.duration_minutes,
        u.id AS doctor_id,
        dp.full_name AS doctor_name,
        dp.public_slug AS doctor_slug,
        dp.display_title AS doctor_title,
        dp.university AS doctor_university,
        dp.semester AS doctor_semester,
        dp.bio AS doctor_bio,
        (
          SELECT photo.asset_id
          FROM doctor_photos photo
          WHERE photo.doctor_id = u.id
            AND photo.asset_id IS NOT NULL
          ORDER BY photo.sort_order ASC, photo.id ASC
          LIMIT 1
        ) AS photo_asset_id
      FROM doctor_services ds
      INNER JOIN users u ON u.id = ds.doctor_id
      INNER JOIN doctor_profiles dp ON dp.user_id = u.id
      WHERE ${conditions.join(" AND ")}
      ORDER BY ds.created_at DESC
      LIMIT 24
    `,
    values
  );

  return rows.map(mapPublicService);
}

export async function getPublicFeed(limit = 8) {
  const [rows] = await db.query<FeedPostRow[]>(
    `
      SELECT
        p.id,
        p.doctor_id,
        dp.full_name AS doctor_name,
        dp.public_slug AS doctor_slug,
        dp.display_title AS doctor_title,
        dp.university AS doctor_university,
        dp.semester AS doctor_semester,
        (
          SELECT photo.asset_id
          FROM doctor_photos photo
          WHERE photo.doctor_id = p.doctor_id
            AND photo.asset_id IS NOT NULL
          ORDER BY photo.sort_order ASC, photo.id ASC
          LIMIT 1
        ) AS doctor_photo_asset_id,
        p.headline,
        p.body,
        p.topic,
        p.visibility,
        p.is_featured,
        (
          SELECT COUNT(*)
          FROM post_reactions pr
          WHERE pr.post_id = p.id
        ) AS reaction_count,
        p.created_at
      FROM doctor_posts p
      INNER JOIN users u ON u.id = p.doctor_id
      INNER JOIN doctor_profiles dp ON dp.user_id = p.doctor_id
      WHERE u.status = 'active'
        AND u.deleted_at IS NULL
        AND p.visibility = 'public'
      ORDER BY p.is_featured DESC, p.created_at DESC
      LIMIT ?
    `,
    [limit]
  );

  return rows.map(mapFeedPost);
}

export async function getDoctorProfileBySlug(slug: string) {
  const doctor = await queryOne<DoctorProfileRow>(
    `
      SELECT
        u.id,
        u.role,
        u.email,
        u.phone,
        u.status,
        dp.full_name,
        dp.university,
        dp.semester,
        dp.bio,
        dp.cv_asset_id,
        fa.original_name AS cv_original_name,
        dp.public_slug,
        dp.display_title
      FROM users u
      INNER JOIN doctor_profiles dp ON dp.user_id = u.id
      LEFT JOIN file_assets fa ON fa.id = dp.cv_asset_id
      WHERE dp.public_slug = ?
        AND u.status = 'active'
        AND u.deleted_at IS NULL
      LIMIT 1
    `,
    [slug]
  );

  if (!doctor) {
    return null;
  }

  const [servicesRows, photoRows, feedRows] = await Promise.all([
    db.query<DoctorServiceRow[]>(
      `
        SELECT id, title, category, description, price_mxn, duration_minutes, is_active
        FROM doctor_services
        WHERE doctor_id = ? AND is_active = 1
        ORDER BY created_at DESC
      `,
      [doctor.id]
    ),
    db.query<DoctorPhotoRow[]>(
      `
        SELECT id, asset_id, sort_order
        FROM doctor_photos
        WHERE doctor_id = ?
          AND asset_id IS NOT NULL
        ORDER BY sort_order ASC, id ASC
      `,
      [doctor.id]
    ),
    db.query<FeedPostRow[]>(
      `
        SELECT
          p.id,
          p.doctor_id,
          dp.full_name AS doctor_name,
          dp.public_slug AS doctor_slug,
          dp.display_title AS doctor_title,
          dp.university AS doctor_university,
          dp.semester AS doctor_semester,
          (
            SELECT photo.asset_id
            FROM doctor_photos photo
            WHERE photo.doctor_id = p.doctor_id
              AND photo.asset_id IS NOT NULL
            ORDER BY photo.sort_order ASC, photo.id ASC
            LIMIT 1
          ) AS doctor_photo_asset_id,
          p.headline,
          p.body,
          p.topic,
          p.visibility,
          p.is_featured,
          (
            SELECT COUNT(*)
            FROM post_reactions pr
            WHERE pr.post_id = p.id
          ) AS reaction_count,
          p.created_at
        FROM doctor_posts p
        INNER JOIN doctor_profiles dp ON dp.user_id = p.doctor_id
        WHERE p.doctor_id = ?
          AND p.visibility = 'public'
        ORDER BY p.created_at DESC
        LIMIT 6
      `,
      [doctor.id]
    )
  ]);

  return {
    id: doctor.id,
    fullName: doctor.full_name,
    slug: doctor.public_slug,
    displayTitle: doctor.display_title,
    university: doctor.university,
    semester: doctor.semester,
    bio: doctor.bio,
    email: doctor.email,
    phone: doctor.phone,
    cvUrl: buildMediaUrl(doctor.cv_asset_id),
    services: servicesRows[0].map(mapDoctorService),
    photos: photoRows[0].map(mapDoctorPhoto),
    feed: feedRows[0].map(mapFeedPost)
  } satisfies PublicDoctorProfile;
}

export async function createPatientAccount(input: {
  email: string;
  phone: string;
  passwordHash: string;
  fullName: string;
  birthDate: string;
  sex: PatientAccount["profile"]["sex"];
  allergies: string;
  currentMedications: string;
  consultationReason: string;
}) {
  return withTransaction(async (connection) => {
    await ensureEmailAvailable(connection, input.email);

    const [userResult] = await connection.query<ResultSetHeader>(
      `
        INSERT INTO users (role, email, phone, password_hash)
        VALUES ('paciente', ?, ?, ?)
      `,
      [input.email, input.phone, input.passwordHash]
    );

    const userId = userResult.insertId;

    await connection.query(
      `
        INSERT INTO patient_profiles (
          user_id,
          full_name,
          birth_date,
          sex,
          allergies,
          current_medications,
          consultation_reason
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        userId,
        input.fullName,
        input.birthDate,
        input.sex,
        input.allergies,
        input.currentMedications,
        input.consultationReason
      ]
    );

    return userId;
  });
}

export async function createDoctorAccount(input: {
  email: string;
  phone: string;
  passwordHash: string;
  fullName: string;
  university: string;
  semester: string;
  bio: string;
  cvAsset: FileAssetInput;
  photoAssets: FileAssetInput[];
  service: {
    title: string;
    category: string;
    description: string;
    priceMxn: number;
    durationMinutes: number;
  };
}) {
  return withTransaction(async (connection) => {
    await ensureEmailAvailable(connection, input.email);

    const [userResult] = await connection.query<ResultSetHeader>(
      `
        INSERT INTO users (role, email, phone, password_hash)
        VALUES ('doctor', ?, ?, ?)
      `,
      [input.email, input.phone, input.passwordHash]
    );

    const userId = userResult.insertId;
    const slug = await buildUniqueDoctorSlug(connection, input.fullName);
    const cvAssetId = await insertFileAsset(connection, userId, input.cvAsset);

    await connection.query(
      `
        INSERT INTO doctor_profiles (
          user_id,
          full_name,
          university,
          semester,
          bio,
          cv_path,
          cv_asset_id,
          public_slug,
          display_title
        )
        VALUES (?, ?, ?, ?, ?, NULL, ?, ?, 'Estudiante de odontologia')
      `,
      [
        userId,
        input.fullName,
        input.university,
        input.semester,
        input.bio,
        cvAssetId,
        slug
      ]
    );

    if (input.photoAssets.length > 0) {
      for (const [index, asset] of input.photoAssets.entries()) {
        const assetId = await insertFileAsset(connection, userId, asset);
        await connection.query(
          `
            INSERT INTO doctor_photos (doctor_id, file_path, asset_id, sort_order)
            VALUES (?, NULL, ?, ?)
          `,
          [userId, assetId, index]
        );
      }
    }

    await connection.query(
      `
        INSERT INTO doctor_services (
          doctor_id,
          title,
          category,
          description,
          price_mxn,
          duration_minutes,
          is_active
        )
        VALUES (?, ?, ?, ?, ?, ?, 1)
      `,
      [
        userId,
        input.service.title,
        input.service.category,
        input.service.description,
        input.service.priceMxn,
        input.service.durationMinutes
      ]
    );

    await connection.query(
      `
        INSERT INTO doctor_posts (
          doctor_id,
          headline,
          body,
          topic,
          visibility,
          is_featured
        )
        VALUES (?, ?, ?, ?, 'public', 1)
      `,
      [
        userId,
        "Bienvenido a mi perfil profesional",
        `Hola, soy ${input.fullName}. Aqui compartire avances clinicos, recomendaciones y nuevos espacios de agenda para mis pacientes.`,
        "Presentacion"
      ]
    );

    return userId;
  });
}

export async function getPatientAccountByUserId(userId: number) {
  const row = await queryOne<PatientRow>(
    `
      SELECT
        u.id,
        u.role,
        u.email,
        u.phone,
        u.status,
        pp.full_name,
        pp.birth_date,
        pp.sex,
        pp.allergies,
        pp.current_medications,
        pp.consultation_reason
      FROM users u
      INNER JOIN patient_profiles pp ON pp.user_id = u.id
      WHERE u.id = ? AND u.role = 'paciente'
      LIMIT 1
    `,
    [userId]
  );

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    role: row.role,
    email: row.email,
    phone: row.phone,
    status: row.status,
    profile: {
      fullName: row.full_name,
      birthDate: formatDateInput(row.birth_date),
      sex: row.sex,
      allergies: row.allergies,
      currentMedications: row.current_medications,
      consultationReason: row.consultation_reason
    }
  } satisfies PatientAccount;
}

export async function getDoctorAccountByUserId(userId: number) {
  const row = await getDoctorProfileRecordByUserId(userId);

  if (!row) {
    return null;
  }

  const [serviceRows, photoRows] = await Promise.all([
    db.query<DoctorServiceRow[]>(
      `
        SELECT id, title, category, description, price_mxn, duration_minutes, is_active
        FROM doctor_services
        WHERE doctor_id = ?
        ORDER BY created_at DESC
      `,
      [userId]
    ),
    db.query<DoctorPhotoRow[]>(
      `
        SELECT id, asset_id, sort_order
        FROM doctor_photos
        WHERE doctor_id = ?
          AND asset_id IS NOT NULL
        ORDER BY sort_order ASC, id ASC
      `,
      [userId]
    )
  ]);

  return {
    id: row.id,
    role: row.role,
    email: row.email,
    phone: row.phone,
    status: row.status,
    profile: {
      fullName: row.full_name,
      university: row.university,
      semester: row.semester,
      bio: row.bio,
      cvUrl: buildMediaUrl(row.cv_asset_id),
      cvFilename: row.cv_original_name ?? "Sin CV cargado",
      publicSlug: row.public_slug,
      displayTitle: row.display_title
    },
    photos: photoRows[0].map(mapDoctorPhoto),
    services: serviceRows[0].map(mapDoctorService)
  } satisfies DoctorAccount;
}

export async function getAppointmentsForUser(user: SessionUser) {
  const [rows] = await db.query<AppointmentRow[]>(
    `
      SELECT
        a.id,
        a.patient_id,
        pp.full_name AS patient_name,
        a.doctor_id,
        dp.full_name AS doctor_name,
        dp.public_slug AS doctor_slug,
        a.treatment_title,
        a.notes,
        a.status,
        a.scheduled_for,
        a.created_at
      FROM appointments a
      INNER JOIN patient_profiles pp ON pp.user_id = a.patient_id
      INNER JOIN doctor_profiles dp ON dp.user_id = a.doctor_id
      WHERE ${user.role === "doctor" ? "a.doctor_id" : "a.patient_id"} = ?
      ORDER BY a.scheduled_for ASC
      LIMIT 8
    `,
    [user.id]
  );

  return rows.map(mapAppointment);
}

export async function getFeedForUser(user: SessionUser) {
  const [rows] = await db.query<FeedPostRow[]>(
    `
      SELECT
        p.id,
        p.doctor_id,
        dp.full_name AS doctor_name,
        dp.public_slug AS doctor_slug,
        dp.display_title AS doctor_title,
        dp.university AS doctor_university,
        dp.semester AS doctor_semester,
        (
          SELECT photo.asset_id
          FROM doctor_photos photo
          WHERE photo.doctor_id = p.doctor_id
            AND photo.asset_id IS NOT NULL
          ORDER BY photo.sort_order ASC, photo.id ASC
          LIMIT 1
        ) AS doctor_photo_asset_id,
        p.headline,
        p.body,
        p.topic,
        p.visibility,
        p.is_featured,
        (
          SELECT COUNT(*)
          FROM post_reactions pr
          WHERE pr.post_id = p.id
        ) AS reaction_count,
        p.created_at
      FROM doctor_posts p
      INNER JOIN users u ON u.id = p.doctor_id
      INNER JOIN doctor_profiles dp ON dp.user_id = p.doctor_id
      WHERE u.status = 'active'
        AND u.deleted_at IS NULL
        AND (? = 'doctor' OR p.visibility IN ('public', 'patients_only'))
      ORDER BY
        CASE WHEN p.doctor_id = ? THEN 0 ELSE 1 END,
        p.is_featured DESC,
        p.created_at DESC
      LIMIT 12
    `,
    [user.role, user.id]
  );

  return rows.map(mapFeedPost);
}

export async function getConversationsForUser(user: SessionUser) {
  const [rows] = await db.query<ConversationPreviewRow[]>(
    `
      SELECT
        c.id AS conversation_id,
        ${user.role === "doctor" ? "pp.full_name" : "dp.full_name"} AS counterpart_name,
        ${user.role === "doctor" ? "'paciente'" : "'doctor'"} AS counterpart_role,
        ${user.role === "doctor" ? "NULL" : "dp.public_slug"} AS counterpart_slug,
        (
          SELECT m.body
          FROM messages m
          WHERE m.conversation_id = c.id
          ORDER BY m.created_at DESC, m.id DESC
          LIMIT 1
        ) AS last_message,
        (
          SELECT m.created_at
          FROM messages m
          WHERE m.conversation_id = c.id
          ORDER BY m.created_at DESC, m.id DESC
          LIMIT 1
        ) AS last_message_at,
        0 AS unread_count
      FROM conversations c
      INNER JOIN patient_profiles pp ON pp.user_id = c.patient_id
      INNER JOIN doctor_profiles dp ON dp.user_id = c.doctor_id
      WHERE ${user.role === "doctor" ? "c.doctor_id" : "c.patient_id"} = ?
      ORDER BY COALESCE(last_message_at, c.updated_at) DESC
      LIMIT 8
    `,
    [user.id]
  );

  return rows.map(mapConversationPreview);
}

export async function getMessagesForUser(user: SessionUser, conversationId?: number | null) {
  const conversations = await getConversationsForUser(user);
  const activeConversationId = conversationId ?? conversations[0]?.conversationId ?? null;

  if (!activeConversationId) {
    return [];
  }

  const [rows] = await db.query<MessageRow[]>(
    `
      SELECT
        m.id,
        m.conversation_id,
        m.sender_id,
        COALESCE(dp.full_name, pp.full_name, u.email) AS sender_name,
        m.body,
        m.created_at
      FROM messages m
      INNER JOIN users u ON u.id = m.sender_id
      LEFT JOIN doctor_profiles dp ON dp.user_id = u.id
      LEFT JOIN patient_profiles pp ON pp.user_id = u.id
      INNER JOIN conversation_members cm ON cm.conversation_id = m.conversation_id AND cm.user_id = ?
      WHERE m.conversation_id = ?
      ORDER BY m.created_at ASC, m.id ASC
      LIMIT 50
    `,
    [user.id, activeConversationId]
  );

  return rows.map((row) => mapMessage(row, user.id));
}

export async function getClinicalRecordsForUser(user: SessionUser) {
  const [rows] = await db.query<ClinicalRecordRow[]>(
    `
      SELECT
        cr.id,
        cr.patient_id,
        pp.full_name AS patient_name,
        cr.doctor_id,
        dp.full_name AS doctor_name,
        cr.title,
        cr.diagnosis,
        cr.treatment_plan,
        cr.status,
        cr.created_at,
        cr.updated_at
      FROM clinical_records cr
      INNER JOIN patient_profiles pp ON pp.user_id = cr.patient_id
      INNER JOIN doctor_profiles dp ON dp.user_id = cr.doctor_id
      WHERE ${user.role === "doctor" ? "cr.doctor_id" : "cr.patient_id"} = ?
      ORDER BY cr.updated_at DESC
      LIMIT 8
    `,
    [user.id]
  );

  return rows.map(mapClinicalRecord);
}

export async function getClinicalEntriesForUser(user: SessionUser) {
  const [rows] = await db.query<ClinicalRecordEntryRow[]>(
    `
      SELECT
        e.id,
        e.record_id,
        e.note,
        e.entry_type,
        e.created_at,
        COALESCE(dp.full_name, pp.full_name, u.email) AS author_name
      FROM clinical_record_entries e
      INNER JOIN clinical_records cr ON cr.id = e.record_id
      INNER JOIN users u ON u.id = e.author_user_id
      LEFT JOIN doctor_profiles dp ON dp.user_id = u.id
      LEFT JOIN patient_profiles pp ON pp.user_id = u.id
      WHERE ${user.role === "doctor" ? "cr.doctor_id" : "cr.patient_id"} = ?
      ORDER BY e.created_at DESC
      LIMIT 12
    `,
    [user.id]
  );

  return rows.map(mapClinicalEntry);
}

export async function getDashboardData(user: SessionUser) {
  if (user.role === "paciente") {
    return getPatientDashboardData(user.id);
  }

  return getDoctorDashboardData(user.id);
}

export async function getPatientDashboardData(userId: number) {
  const account = await getPatientAccountByUserId(userId);

  if (!account) {
    return null;
  }

  const sessionUser: SessionUser = {
    id: account.id,
    role: account.role,
    email: account.email,
    phone: account.phone,
    status: account.status
  };

  const [featuredDoctors, featuredServices, feed, appointments, conversations, clinicalRecords, clinicalEntries] =
    await Promise.all([
      getFeaturedDoctors(4),
      searchPublicServices(),
      getFeedForUser(sessionUser),
      getAppointmentsForUser(sessionUser),
      getConversationsForUser(sessionUser),
      getClinicalRecordsForUser(sessionUser),
      getClinicalEntriesForUser(sessionUser)
    ]);
  const messages = await getMessagesForUser(sessionUser, conversations[0]?.conversationId ?? null);

  return {
    account,
    featuredDoctors,
    featuredServices: featuredServices.slice(0, 6),
    feed,
    appointments,
    conversations,
    messages,
    clinicalRecords,
    clinicalEntries,
    activitySummary: buildActivitySummary("paciente", {
      feed: feed.length,
      appointments: appointments.length,
      conversations: conversations.length,
      records: clinicalRecords.length
    })
  } satisfies PatientDashboardData;
}

export async function getDoctorDashboardData(userId: number) {
  const account = await getDoctorAccountByUserId(userId);

  if (!account) {
    return null;
  }

  const sessionUser: SessionUser = {
    id: account.id,
    role: account.role,
    email: account.email,
    phone: account.phone,
    status: account.status
  };

  const [feed, appointments, conversations, clinicalRecords, clinicalEntries] = await Promise.all([
    getFeedForUser(sessionUser),
    getAppointmentsForUser(sessionUser),
    getConversationsForUser(sessionUser),
    getClinicalRecordsForUser(sessionUser),
    getClinicalEntriesForUser(sessionUser)
  ]);
  const messages = await getMessagesForUser(sessionUser, conversations[0]?.conversationId ?? null);

  return {
    account,
    stats: {
      activeServices: account.services.filter((service) => service.isActive).length,
      galleryPhotos: account.photos.length
    },
    feed,
    appointments,
    conversations,
    messages,
    clinicalRecords,
    clinicalEntries,
    activitySummary: buildActivitySummary("doctor", {
      feed: feed.length,
      appointments: appointments.length,
      conversations: conversations.length,
      records: clinicalRecords.length,
      services: account.services.filter((service) => service.isActive).length,
      photos: account.photos.length
    })
  } satisfies DoctorDashboardData;
}

export async function getOwnAccount(user: SessionUser) {
  if (user.role === "paciente") {
    return getPatientAccountByUserId(user.id);
  }

  return getDoctorAccountByUserId(user.id);
}

export async function updatePatientAccount(
  userId: number,
  input: {
    email: string;
    phone: string;
    fullName: string;
    birthDate: string;
    sex: PatientAccount["profile"]["sex"];
    allergies: string;
    currentMedications: string;
    consultationReason: string;
  }
) {
  await withTransaction(async (connection) => {
    await ensureEmailAvailable(connection, input.email, userId);

    await connection.query(
      `
        UPDATE users
        SET email = ?, phone = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      [input.email, input.phone, userId]
    );

    await connection.query(
      `
        UPDATE patient_profiles
        SET
          full_name = ?,
          birth_date = ?,
          sex = ?,
          allergies = ?,
          current_medications = ?,
          consultation_reason = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `,
      [
        input.fullName,
        input.birthDate,
        input.sex,
        input.allergies,
        input.currentMedications,
        input.consultationReason,
        userId
      ]
    );
  });

  return getPatientAccountByUserId(userId);
}

export async function updateDoctorAccount(
  userId: number,
  input: {
    email: string;
    phone: string;
    fullName: string;
    university: string;
    semester: string;
    bio: string;
    cvAsset?: FileAssetInput | null;
  }
) {
  const current = await getDoctorProfileRecordByUserId(userId);

  if (!current) {
    apiError("No encontramos el perfil del doctor.", 404);
  }

  await withTransaction(async (connection) => {
    await ensureEmailAvailable(connection, input.email, userId);

    let nextCvAssetId = current.cv_asset_id;

    if (input.cvAsset) {
      nextCvAssetId = await insertFileAsset(connection, userId, input.cvAsset);
    }

    await connection.query(
      `
        UPDATE users
        SET email = ?, phone = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      [input.email, input.phone, userId]
    );

    await connection.query(
      `
        UPDATE doctor_profiles
        SET
          full_name = ?,
          university = ?,
          semester = ?,
          bio = ?,
          cv_asset_id = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `,
      [
        input.fullName,
        input.university,
        input.semester,
        input.bio,
        nextCvAssetId,
        userId
      ]
    );

    if (input.cvAsset && current.cv_asset_id && current.cv_asset_id !== nextCvAssetId) {
      await deleteAssetIfUnreferenced(connection, current.cv_asset_id);
    }
  });

  return {
    account: await getDoctorAccountByUserId(userId)
  };
}

export async function createDoctorService(
  userId: number,
  input: {
    title: string;
    category: string;
    description: string;
    priceMxn: number;
    durationMinutes: number;
    isActive?: boolean;
  }
) {
  await db.query(
    `
      INSERT INTO doctor_services (
        doctor_id,
        title,
        category,
        description,
        price_mxn,
        duration_minutes,
        is_active
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      userId,
      input.title,
      input.category,
      input.description,
      input.priceMxn,
      input.durationMinutes,
      input.isActive ?? true
    ]
  );

  const account = await getDoctorAccountByUserId(userId);
  return account?.services ?? [];
}

export async function updateDoctorService(
  userId: number,
  input: {
    serviceId: number;
    title: string;
    category: string;
    description: string;
    priceMxn: number;
    durationMinutes: number;
    isActive?: boolean;
  }
) {
  const [result] = await db.query<ResultSetHeader>(
    `
      UPDATE doctor_services
      SET
        title = ?,
        category = ?,
        description = ?,
        price_mxn = ?,
        duration_minutes = ?,
        is_active = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND doctor_id = ?
    `,
    [
      input.title,
      input.category,
      input.description,
      input.priceMxn,
      input.durationMinutes,
      input.isActive ?? true,
      input.serviceId,
      userId
    ]
  );

  if (result.affectedRows === 0) {
    apiError("No encontramos ese servicio.", 404);
  }

  const account = await getDoctorAccountByUserId(userId);
  return account?.services ?? [];
}

export async function deleteDoctorService(userId: number, serviceId: number) {
  const [result] = await db.query<ResultSetHeader>(
    "DELETE FROM doctor_services WHERE id = ? AND doctor_id = ?",
    [serviceId, userId]
  );

  if (result.affectedRows === 0) {
    apiError("No encontramos ese servicio.", 404);
  }

  const account = await getDoctorAccountByUserId(userId);
  return account?.services ?? [];
}

export async function addDoctorPhotos(userId: number, photoAssets: FileAssetInput[]) {
  if (photoAssets.length === 0) {
    return [];
  }

  await withTransaction(async (connection) => {
    const [countRows] = await connection.query<CountRow[]>(
      "SELECT COUNT(*) AS total FROM doctor_photos WHERE doctor_id = ?",
      [userId]
    );

    let sortOrder = countRows[0]?.total ?? 0;

    for (const asset of photoAssets) {
      const assetId = await insertFileAsset(connection, userId, asset);
      await connection.query(
        `
          INSERT INTO doctor_photos (doctor_id, file_path, asset_id, sort_order)
          VALUES (?, NULL, ?, ?)
        `,
        [userId, assetId, sortOrder]
      );
      sortOrder += 1;
    }
  });

  const account = await getDoctorAccountByUserId(userId);
  return account?.photos ?? [];
}

export async function deleteDoctorPhoto(userId: number, photoId: number) {
  const row = await queryOne<
    RowDataPacket & {
      id: number;
      asset_id: number | null;
    }
  >(
    `
      SELECT id, asset_id
      FROM doctor_photos
      WHERE id = ? AND doctor_id = ?
      LIMIT 1
    `,
    [photoId, userId]
  );

  if (!row) {
    apiError("No encontramos esa foto.", 404);
  }

  await withTransaction(async (connection) => {
    await connection.query("DELETE FROM doctor_photos WHERE id = ? AND doctor_id = ?", [
      photoId,
      userId
    ]);
    await deleteAssetIfUnreferenced(connection, row.asset_id);
  });

  const account = await getDoctorAccountByUserId(userId);

  return {
    photos: account?.photos ?? []
  };
}

export async function createFeedPost(
  doctorId: number,
  input: {
    headline: string;
    body: string;
    topic: string;
    visibility: FeedVisibility;
    featured?: boolean;
  }
) {
  await db.query(
    `
      INSERT INTO doctor_posts (doctor_id, headline, body, topic, visibility, is_featured)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [doctorId, input.headline, input.body, input.topic, input.visibility, input.featured ?? false]
  );

  return getFeedForUser({
    id: doctorId,
    role: "doctor",
    email: "",
    phone: "",
    status: "active"
  });
}

export async function createAppointmentForPatient(
  patientId: number,
  input: {
    doctorId: number;
    treatmentTitle: string;
    notes: string;
    scheduledFor: string;
  }
) {
  return withTransaction(async (connection) => {
    const [result] = await connection.query<ResultSetHeader>(
      `
        INSERT INTO appointments (patient_id, doctor_id, treatment_title, notes, scheduled_for)
        VALUES (?, ?, ?, ?, ?)
      `,
      [patientId, input.doctorId, input.treatmentTitle, input.notes, input.scheduledFor]
    );

    await connection.query(
      `
        INSERT INTO appointment_status_history (
          appointment_id,
          changed_by_user_id,
          status,
          note
        )
        VALUES (?, ?, 'pending', 'Cita creada por el paciente')
      `,
      [result.insertId, patientId]
    );

    const conversationId = await ensureConversationBetween(connection, input.doctorId, patientId);

    await connection.query(
      "INSERT INTO messages (conversation_id, sender_id, body) VALUES (?, ?, ?)",
      [
        conversationId,
        patientId,
        `Hola, acabo de solicitar una cita para ${input.treatmentTitle} y la programe para ${input.scheduledFor}.`
      ]
    );

    return result.insertId;
  });
}

export async function updateAppointmentStatus(
  user: SessionUser,
  input: {
    appointmentId: number;
    status: AppointmentStatus;
    note?: string;
  }
) {
  return withTransaction(async (connection) => {
    const [rows] = await connection.query<RowDataPacket[]>(
      `
        SELECT id, patient_id, doctor_id
        FROM appointments
        WHERE id = ?
          AND (${user.role === "doctor" ? "doctor_id" : "patient_id"} = ?)
        LIMIT 1
      `,
      [input.appointmentId, user.id]
    );

    const appointment = rows[0];

    if (!appointment) {
      apiError("No encontramos esa cita.", 404);
    }

    await connection.query(
      "UPDATE appointments SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [input.status, input.appointmentId]
    );

    await connection.query(
      `
        INSERT INTO appointment_status_history (
          appointment_id,
          changed_by_user_id,
          status,
          note
        )
        VALUES (?, ?, ?, ?)
      `,
      [input.appointmentId, user.id, input.status, input.note ?? ""]
    );

    return input.appointmentId;
  });
}

export async function sendConversationMessage(
  user: SessionUser,
  input: {
    conversationId: number;
    body: string;
  }
) {
  const [rows] = await db.query<RowDataPacket[]>(
    `
      SELECT 1
      FROM conversation_members
      WHERE conversation_id = ? AND user_id = ?
      LIMIT 1
    `,
    [input.conversationId, user.id]
  );

  if (!rows[0]) {
    apiError("No tienes acceso a esa conversacion.", 403);
  }

  await db.query(
    "INSERT INTO messages (conversation_id, sender_id, body) VALUES (?, ?, ?)",
    [input.conversationId, user.id, input.body]
  );

  await db.query(
    "UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [input.conversationId]
  );

  return getMessagesForUser(user, input.conversationId);
}

export async function createClinicalRecord(
  doctorId: number,
  input: {
    patientId: number;
    title: string;
    diagnosis: string;
    treatmentPlan: string;
    status: "active" | "completed" | "follow_up";
  }
) {
  return withTransaction(async (connection) => {
    const [result] = await connection.query<ResultSetHeader>(
      `
        INSERT INTO clinical_records (
          patient_id,
          doctor_id,
          title,
          diagnosis,
          treatment_plan,
          status
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        input.patientId,
        doctorId,
        input.title,
        input.diagnosis,
        input.treatmentPlan,
        input.status
      ]
    );

    await connection.query(
      `
        INSERT INTO clinical_record_entries (
          record_id,
          author_user_id,
          entry_type,
          note
        )
        VALUES (?, ?, 'assessment', ?)
      `,
      [result.insertId, doctorId, input.diagnosis]
    );

    return result.insertId;
  });
}

export async function addClinicalRecordEntry(
  user: SessionUser,
  input: {
    recordId: number;
    note: string;
    entryType: "assessment" | "progress" | "prescription" | "follow_up";
  }
) {
  const [rows] = await db.query<RowDataPacket[]>(
    `
      SELECT id
      FROM clinical_records
      WHERE id = ?
        AND (${user.role === "doctor" ? "doctor_id" : "patient_id"} = ?)
      LIMIT 1
    `,
    [input.recordId, user.id]
  );

  if (!rows[0]) {
    apiError("No tienes acceso a ese expediente.", 403);
  }

  await db.query(
    `
      INSERT INTO clinical_record_entries (
        record_id,
        author_user_id,
        entry_type,
        note
      )
      VALUES (?, ?, ?, ?)
    `,
    [input.recordId, user.id, input.entryType, input.note]
  );

  await db.query(
    "UPDATE clinical_records SET updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [input.recordId]
  );

  return getClinicalEntriesForUser(user);
}

export async function deactivateOwnAccount(userId: number) {
  await withTransaction(async (connection) => {
    await connection.query(
      `
        UPDATE users
        SET status = 'disabled', deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      [userId]
    );

    await connection.query("DELETE FROM sessions WHERE user_id = ?", [userId]);
  });
}

export async function getPasswordUserByEmail(email: string) {
  return queryOne<
    RowDataPacket & {
      id: number;
      role: Role;
      email: string;
      phone: string;
      password_hash: string;
      status: "active" | "disabled";
      deleted_at: Date | null;
    }
  >(
    `
      SELECT id, role, email, phone, password_hash, status, deleted_at
      FROM users
      WHERE email = ?
      LIMIT 1
    `,
    [email]
  );
}
