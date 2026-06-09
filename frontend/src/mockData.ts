import { Appointment } from './types';

export const SEED_APPOINTMENTS: Appointment[] = [
  {
    id: "APT_SEED_1",
    code: "SC8921",
    name: "Ramesh Sharma",
    phone: "+91 91234 56789",
    email: "ramesh.sharma@example.com",
    service: "implants",
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days ago
    timeSlot: "afternoon",
    message: "Had a missing molar for 2 years, looking for high strength biocompatible implant consultation.",
    status: "completed",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    notes: "Successfully drilled and positioned Nobel Biocare 4.3mm implant. Primary stability achieved at 35N. Healing abutment torqued. Patient scheduled for crown placement in 12 weeks.",
    billingAmount: 28000
  },
  {
    id: "APT_SEED_2",
    code: "SC7765",
    name: "Aishwarya Sen",
    phone: "+91 98761 23450",
    email: "aishwarya.s@gmail.com",
    service: "braces",
    date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
    timeSlot: "afternoon",
    message: "Interested in getting Invisalign trays. Would appreciate 3D digital simulation preview.",
    status: "approved",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    notes: "",
    billingAmount: 0
  },
  {
    id: "APT_SEED_3",
    code: "SC3319",
    name: "Pratik Patel",
    phone: "+91 90044 11223",
    email: "pratik.patel@rediffmail.com",
    service: "rootcanal",
    date: new Date().toISOString().split('T')[0], // Today
    timeSlot: "morning",
    message: "Extremely painful throbbing in my lower left molar. Haven't slept properly for 2 nights.",
    status: "pending",
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    notes: "",
    billingAmount: 0
  },
  {
    id: "APT_SEED_4",
    code: "SC5102",
    name: "Sunita Deshmukh",
    phone: "+91 93221 44556",
    email: "sunita.desh@outlook.com",
    service: "whitening",
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Yesterday
    timeSlot: "evening",
    message: "Coffee stains on front incisors. Getting married next month, want rapid whitening treatment.",
    status: "completed",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    notes: "Did active Zoom light teeth whitening procedure. Completed 3 cycles of 15 mins each. Enamel shades lightened by 6 gradations. Handed over sensitive protection toothpaste.",
    billingAmount: 5000
  },
  {
    id: "APT_SEED_5",
    code: "SC1182",
    name: "Karan Johar",
    phone: "+91 99887 76655",
    email: "kj@dharmaprod.com",
    service: "general",
    date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 6 days ago
    timeSlot: "morning",
    message: "Routine teeth cleanup checkup.",
    status: "cancelled",
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    notes: "Cancelled by patient due to filming conflicts.",
    billingAmount: 0
  }
];
