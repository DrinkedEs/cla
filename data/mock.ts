import type { ScreenKey } from "@/components/navigation/types";
import type { AppIconName } from "@/components/icons/AppIcon";

export type Treatment = {
  id: string;
  title: string;
  category: string;
  price: string;
  duration: string;
  availability: string;
  rating: number;
};

export type Student = {
  name: string;
  role: string;
  semester: string;
  university: string;
  rating: number;
  completedTreatments: number;
  bio: string;
  specialties: string[];
};

export type Appointment = {
  id: string;
  patient: string;
  treatment: string;
  date: string;
  time: string;
  status: "Confirmada" | "Pendiente" | "En revision";
};

export type Message = {
  id: string;
  from: string;
  preview: string;
  time: string;
  unread?: boolean;
};

export type ClinicalRecord = {
  id: string;
  title: string;
  date: string;
  notes: string;
  status: string;
};

export const navItems: Array<{ key: ScreenKey; label: string; icon: AppIconName }> = [
  { key: "home", label: "Inicio", icon: "home" },
  { key: "search", label: "Buscar", icon: "search" },
  { key: "agenda", label: "Agenda", icon: "calendar" },
  { key: "messages", label: "Mensajes", icon: "message" },
  { key: "profile", label: "Perfil", icon: "user" }
];

export const student: Student = {
  name: "Linda Martinez",
  role: "Estudiante de odontologia",
  semester: "8vo semestre",
  university: "Facultad de Odontologia L&A",
  rating: 4.9,
  completedTreatments: 126,
  bio: "Atencion enfocada en prevencion, limpieza profunda, restauraciones esteticas y seguimiento clinico con supervision academica.",
  specialties: ["Limpieza dental", "Resinas", "Blanqueamiento", "Revision clinica"]
};

export const creator = {
  name: "Alexis Valdez",
  role: "Desarrollador full stack",
  project: "Proyecto L&A"
};

export const treatments: Treatment[] = [
  {
    id: "cleaning",
    title: "Limpieza dental profunda",
    category: "Preventivo",
    price: "$350 MXN",
    duration: "55 min",
    availability: "Hoy 4:30 PM",
    rating: 4.9
  },
  {
    id: "resin",
    title: "Resina estetica",
    category: "Restaurativo",
    price: "$480 MXN",
    duration: "70 min",
    availability: "Manana 10:00 AM",
    rating: 4.8
  },
  {
    id: "diagnostic",
    title: "Valoracion inicial",
    category: "Diagnostico",
    price: "$180 MXN",
    duration: "30 min",
    availability: "Viernes 1:00 PM",
    rating: 5
  },
  {
    id: "whitening",
    title: "Blanqueamiento supervisado",
    category: "Estetico",
    price: "$620 MXN",
    duration: "80 min",
    availability: "Sabado 11:30 AM",
    rating: 4.7
  }
];

export const appointments: Appointment[] = [
  {
    id: "apt-001",
    patient: "Mariana Ruiz",
    treatment: "Limpieza dental profunda",
    date: "22 Abr",
    time: "4:30 PM",
    status: "Confirmada"
  },
  {
    id: "apt-002",
    patient: "Carlos Medina",
    treatment: "Valoracion inicial",
    date: "24 Abr",
    time: "10:00 AM",
    status: "Pendiente"
  },
  {
    id: "apt-003",
    patient: "Sofia Reyes",
    treatment: "Resina estetica",
    date: "26 Abr",
    time: "12:15 PM",
    status: "En revision"
  }
];

export const messages: Message[] = [
  {
    id: "msg-001",
    from: "Linda Martinez",
    preview: "Te comparto el link para confirmar tu cita y subir tus datos clinicos.",
    time: "2 min",
    unread: true
  },
  {
    id: "msg-002",
    from: "Mariana Ruiz",
    preview: "Listo, ya complete mi historial. Nos vemos a las 4:30.",
    time: "18 min"
  },
  {
    id: "msg-003",
    from: "Clinica L&A",
    preview: "La cita de Carlos necesita validacion del supervisor.",
    time: "1 h",
    unread: true
  }
];

export const clinicalHistory: ClinicalRecord[] = [
  {
    id: "rec-001",
    title: "Valoracion inicial",
    date: "12 Mar 2026",
    notes: "Paciente sin dolor activo. Se recomienda limpieza y radiografia de control.",
    status: "Completado"
  },
  {
    id: "rec-002",
    title: "Limpieza dental",
    date: "19 Mar 2026",
    notes: "Profilaxis con ultrasonido. Se agenda revision de encias en 4 semanas.",
    status: "Seguimiento"
  },
  {
    id: "rec-003",
    title: "Plan de resinas",
    date: "02 Abr 2026",
    notes: "Dos restauraciones sugeridas. Pendiente autorizacion y horario.",
    status: "Pendiente"
  }
];

export const quickStats = [
  { label: "Citas activas", value: "12" },
  { label: "Pacientes", value: "84" },
  { label: "Rating", value: "4.9" }
];
