export type Role = "paciente" | "doctor";

export type UserStatus = "active" | "disabled";

export type Sex = "femenino" | "masculino" | "otro" | "prefiero_no_decir";

export type SessionUser = {
  id: number;
  role: Role;
  email: string;
  phone: string;
  status: UserStatus;
};

export type PublicService = {
  id: number;
  title: string;
  category: string;
  description: string;
  priceMxn: number;
  durationMinutes: number;
  doctorId: number;
  doctorName: string;
  doctorSlug: string;
  doctorTitle: string;
  doctorUniversity: string;
  doctorSemester: string;
  doctorBio: string;
  photoUrl: string | null;
};

export type PublicDoctor = {
  id: number;
  fullName: string;
  slug: string;
  displayTitle: string;
  university: string;
  semester: string;
  bio: string;
  photoUrl: string | null;
  serviceCount: number;
};

export type PatientAccount = SessionUser & {
  profile: {
    fullName: string;
    birthDate: string;
    sex: Sex;
    allergies: string;
    currentMedications: string;
    consultationReason: string;
  };
};

export type DoctorService = {
  id: number;
  title: string;
  category: string;
  description: string;
  priceMxn: number;
  durationMinutes: number;
  isActive: boolean;
};

export type DoctorPhoto = {
  id: number;
  fileUrl: string;
  sortOrder: number;
};

export type DoctorAccount = SessionUser & {
  profile: {
    fullName: string;
    university: string;
    semester: string;
    bio: string;
    cvUrl: string | null;
    cvFilename: string;
    publicSlug: string;
    displayTitle: string;
  };
  photos: DoctorPhoto[];
  services: DoctorService[];
};

export type PublicDoctorProfile = {
  id: number;
  fullName: string;
  slug: string;
  displayTitle: string;
  university: string;
  semester: string;
  bio: string;
  email: string;
  phone: string;
  cvUrl: string | null;
  services: DoctorService[];
  photos: DoctorPhoto[];
};

export type PatientDashboardData = {
  account: PatientAccount;
  featuredDoctors: PublicDoctor[];
  featuredServices: PublicService[];
};

export type DoctorDashboardData = {
  account: DoctorAccount;
  stats: {
    activeServices: number;
    galleryPhotos: number;
  };
};
