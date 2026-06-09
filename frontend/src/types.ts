declare global {
  interface Window {
    openAdminPortal?: () => void;
    refreshDoctorAppointments?: () => void;
    showToast?: (message: string, type?: 'success' | 'warning' | 'info') => void;
  }
}

export interface Appointment {
  id: string;
  code: string;
  name: string;
  phone: string;
  email: string;
  service: string;
  date: string;
  timeSlot: 'morning' | 'afternoon' | 'evening' | string;
  message: string;
  status: 'pending' | 'approved' | 'completed' | 'cancelled';
  createdAt: string;
  notes?: string;
  billingAmount?: number;
}

export type AppointmentStatus = 'all' | 'pending' | 'approved' | 'completed' | 'cancelled';

export interface TreatmentDetail {
  id: string;
  name: string;
  price: number;
  duration: string;
  category: string;
  icon: string;
}

export const TREATMENTS: Record<string, TreatmentDetail> = {
  general: {
    id: 'general',
    name: 'General Dentistry & Diagnostics',
    price: 800,
    duration: '30 mins',
    category: 'Diagnostic',
    icon: 'Stethoscope'
  },
  whitening: {
    id: 'whitening',
    name: 'Laser Teeth Whitening',
    price: 5000,
    duration: '45 mins',
    category: 'Cosmetic',
    icon: 'Wand2'
  },
  implants: {
    id: 'implants',
    name: 'Titanium Dental Implants',
    price: 28000,
    duration: '60 mins',
    category: 'Surgical',
    icon: 'Hammer'
  },
  braces: {
    id: 'braces',
    name: 'Braces & Aligners',
    price: 45000,
    duration: '45 mins',
    category: 'Orthodontics',
    icon: 'Smile'
  },
  rootcanal: {
    id: 'rootcanal',
    name: 'Microscopic Root Canal Therapy',
    price: 7500,
    duration: '60 mins',
    category: 'Endodontics',
    icon: 'ShieldAlert'
  },
  pediatric: {
    id: 'pediatric',
    name: 'Gentle Pediatric Checkups',
    price: 1200,
    duration: '30 mins',
    category: 'Pediatric',
    icon: 'Baby'
  }
};
