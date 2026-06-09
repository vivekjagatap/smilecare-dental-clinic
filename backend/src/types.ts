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
}
