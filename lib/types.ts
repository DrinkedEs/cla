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

export type FeedVisibility = "public" | "patients_only";

export type FeedPost = {
  id: number;
  doctorId: number;
  doctorName: string;
  doctorSlug: string;
  doctorTitle: string;
  doctorUniversity: string;
  doctorSemester: string;
  doctorPhotoUrl: string | null;
  headline: string;
  body: string;
  topic: string;
  visibility: FeedVisibility;
  featured: boolean;
  reactionCount: number;
  createdAt: string;
};

export type ActivitySummary = {
  title: string;
  value: string;
  description: string;
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
  feed: FeedPost[];
};

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "in_review";

export type Appointment = {
  id: number;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  doctorSlug: string;
  treatmentTitle: string;
  notes: string;
  status: AppointmentStatus;
  scheduledFor: string;
  createdAt: string;
};

export type ConversationPreview = {
  conversationId: number;
  counterpartName: string;
  counterpartRole: Role;
  counterpartSlug: string | null;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
};

export type DirectMessage = {
  id: number;
  conversationId: number;
  senderId: number;
  senderName: string;
  body: string;
  createdAt: string;
  isOwn: boolean;
};

export type ClinicalRecord = {
  id: number;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  title: string;
  diagnosis: string;
  treatmentPlan: string;
  status: "active" | "completed" | "follow_up";
  createdAt: string;
  updatedAt: string;
};

export type ClinicalRecordEntry = {
  id: number;
  recordId: number;
  note: string;
  entryType: "assessment" | "progress" | "prescription" | "follow_up";
  createdAt: string;
  authorName: string;
};

export type PatientDashboardData = {
  account: PatientAccount;
  featuredDoctors: PublicDoctor[];
  featuredServices: PublicService[];
  feed: FeedPost[];
  appointments: Appointment[];
  conversations: ConversationPreview[];
  messages: DirectMessage[];
  clinicalRecords: ClinicalRecord[];
  clinicalEntries: ClinicalRecordEntry[];
  activitySummary: ActivitySummary[];
};

export type DoctorDashboardData = {
  account: DoctorAccount;
  stats: {
    activeServices: number;
    galleryPhotos: number;
  };
  feed: FeedPost[];
  appointments: Appointment[];
  conversations: ConversationPreview[];
  messages: DirectMessage[];
  clinicalRecords: ClinicalRecord[];
  clinicalEntries: ClinicalRecordEntry[];
  activitySummary: ActivitySummary[];
};
