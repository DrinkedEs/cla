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
  DoctorAccount,
  DoctorDashboardData,
  DoctorPhoto,
  DoctorService,
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

function formatDateInput(value: Date | string) {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return value.slice(0, 10);
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

  const [servicesRows, photoRows] = await Promise.all([
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
    photos: photoRows[0].map(mapDoctorPhoto)
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

  const [featuredDoctors, featuredServices] = await Promise.all([
    getFeaturedDoctors(3),
    searchPublicServices()
  ]);

  return {
    account,
    featuredDoctors,
    featuredServices: featuredServices.slice(0, 4)
  } satisfies PatientDashboardData;
}

export async function getDoctorDashboardData(userId: number) {
  const account = await getDoctorAccountByUserId(userId);

  if (!account) {
    return null;
  }

  return {
    account,
    stats: {
      activeServices: account.services.filter((service) => service.isActive).length,
      galleryPhotos: account.photos.length
    }
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
