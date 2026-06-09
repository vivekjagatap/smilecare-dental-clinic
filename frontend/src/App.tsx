import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
  Calendar,
  Users,
  CheckCircle,
  Clock,
  DollarSign,
  PlusCircle,
  Search,
  Filter,
  LogOut,
  X,
  Lock,
  Sliders,
  AlertTriangle,
  UserCheck,
  CalendarDays,
  FileText,
  AlertOctagon,
  TrendingUp,
  Activity,
  User,
  Phone,
  Mail,
  ListRestart,
  CreditCard,
  FileHeart,
  ChevronRight,
  ShieldCheck,
  Stethoscope,
  Scissors,
  Wand2,
  Trash2
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

import { Appointment, TREATMENTS, AppointmentStatus } from './types';
import { SEED_APPOINTMENTS } from './mockData';

export default function App() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [passcode, setPasscode] = useState<string>('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'appointments' | 'walkin' | 'settings'>('dashboard');

  // Filters State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');

  // Selected Appt for detail viewing
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);

  // Appt currently being rescheduled
  const [apptToReschedule, setApptToReschedule] = useState<Appointment | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<string>('');
  const [rescheduleSlot, setRescheduleSlot] = useState<string>('morning');

  // Appt currently being marked as completed
  const [apptToComplete, setApptToComplete] = useState<Appointment | null>(null);
  const [completionNotes, setCompletionNotes] = useState<string>('');
  const [completionAmount, setCompletionAmount] = useState<number>(0);

  // Walk-in raw form state
  const [walkinForm, setWalkinForm] = useState({
    name: '',
    phone: '',
    email: '',
    service: 'general',
    date: new Date().toISOString().split('T')[0],
    timeSlot: 'morning',
    message: '',
    painLevel: 'none',
    hasPhobia: false
  });

  // Expose callbacks to window and synchronize local storage
  useEffect(() => {
    const raw = localStorage.getItem('smilecare_appointments');
    if (raw) {
      try {
        setAppointments(JSON.parse(raw));
      } catch (err) {
        setAppointments(SEED_APPOINTMENTS);
      }
    } else {
      // Seed initial data
      localStorage.setItem('smilecare_appointments', JSON.stringify(SEED_APPOINTMENTS));
      setAppointments(SEED_APPOINTMENTS);
    }

    // Hash control
    const handleHashChange = () => {
      if (window.location.hash === '#admin') {
        setIsAdminMode(true);
      } else {
        setIsAdminMode(false);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    
    // Web hooks for click handlers
    window.openAdminPortal = () => {
      setIsAdminMode(true);
      window.location.hash = '#admin';
    };

    window.refreshDoctorAppointments = () => {
      const stored = localStorage.getItem('smilecare_appointments');
      if (stored) {
        try {
          setAppointments(JSON.parse(stored));
        } catch (e) {
          console.error(e);
        }
      }
    };

    if (window.location.hash === '#admin') {
      setIsAdminMode(true);
    }

    // Check if previously logged in (session state)
    const storedLogin = sessionStorage.getItem('smilecare_logged_in');
    if (storedLogin === 'true') {
      setIsLoggedIn(true);
    }

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      delete window.openAdminPortal;
      delete window.refreshDoctorAppointments;
    };
  }, []);

  // Sync state changes back to localStorage
  const saveAppointmentsToStorage = (updatedList: Appointment[]) => {
    setAppointments(updatedList);
    localStorage.setItem('smilecare_appointments', JSON.stringify(updatedList));
  };

  // Toggle page visibility based on role selection
  useEffect(() => {
    const wrapper = document.getElementById('patient-app-wrapper');
    if (wrapper) {
      if (isAdminMode) {
        wrapper.classList.add('hidden');
        wrapper.classList.remove('opacity-100');
        wrapper.classList.add('opacity-0');
        document.body.classList.add('bg-slate-900');
      } else {
        wrapper.classList.remove('hidden');
        wrapper.classList.remove('opacity-0');
        wrapper.classList.add('opacity-100');
        document.body.classList.remove('bg-slate-900');
      }
    }
  }, [isAdminMode]);

  // Auth processing
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.toLowerCase() === 'admin' || passcode === 'smile123') {
      setIsLoggedIn(true);
      setLoginError(null);
      sessionStorage.setItem('smilecare_logged_in', 'true');
    } else {
      setLoginError('Invalid Passcode. Try "admin" or "smile123" for test access.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    sessionStorage.removeItem('smilecare_logged_in');
    window.location.hash = '#home';
    setIsAdminMode(false);
  };

  // Appointment Status Modification Logic
  const handleApproveAppointment = (id: string) => {
    const updated = appointments.map(app => {
      if (app.id === id) {
        return { ...app, status: 'approved' as const };
      }
      return app;
    });
    saveAppointmentsToStorage(updated);
    showUINotification('Appointment slot successfully approved!');
  };

  const handleCancelAppointment = (id: string) => {
    const updated = appointments.map(app => {
      if (app.id === id) {
        return { ...app, status: 'cancelled' as const };
      }
      return app;
    });
    saveAppointmentsToStorage(updated);
    showUINotification('Appointment reservation cancelled.');
  };

  const handleDeleteAppointment = (id: string) => {
    if (confirm("Are you sure you want to permanently delete this reservation record?")) {
      const updated = appointments.filter(app => app.id !== id);
      saveAppointmentsToStorage(updated);
      showUINotification('Record deleted from clinical database.');
      if (selectedAppt?.id === id) setSelectedAppt(null);
    }
  };

  // Open reschedule modal
  const openRescheduleModal = (app: Appointment) => {
    setApptToReschedule(app);
    setRescheduleDate(app.date);
    setRescheduleSlot(app.timeSlot);
  };

  const submitReschedule = () => {
    if (!apptToReschedule) return;
    const updated = appointments.map(app => {
      if (app.id === apptToReschedule.id) {
        return { 
          ...app, 
          date: rescheduleDate, 
          timeSlot: rescheduleSlot,
          status: 'approved' as const // automatically approve on reschedule
        };
      }
      return app;
    });
    saveAppointmentsToStorage(updated);
    setApptToReschedule(null);
    showUINotification('Appointment re-routed to new clinical slot!');
  };

  // Open completion modal
  const openCompleteModal = (app: Appointment) => {
    setApptToComplete(app);
    // Prefill billing model value
    const baseTreatment = TREATMENTS[app.service];
    setCompletionAmount(baseTreatment ? baseTreatment.price : 1000);
    setCompletionNotes(app.notes || '');
  };

  const submitCompletion = () => {
    if (!apptToComplete) return;
    const updated = appointments.map(app => {
      if (app.id === apptToComplete.id) {
        return {
          ...app,
          status: 'completed' as const,
          notes: completionNotes || 'Routine checkup completed successfully.',
          billingAmount: Number(completionAmount) || 0
        };
      }
      return app;
    });
    saveAppointmentsToStorage(updated);
    setApptToComplete(null);
    setCompletionNotes('');
    showUINotification('Appointment finalized and treatment invoice closed!');
  };

  // Submit manual Walk-in
  const handleWalkinAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkinForm.name || !walkinForm.phone) {
      alert("Name and phone number are required!");
      return;
    }

    const price = TREATMENTS[walkinForm.service]?.price || 1000;
    const code = "SC" + Math.floor(1000 + Math.random() * 9000);
    const complexMessage = `${walkinForm.message || 'No message.'} [Pain Level: ${walkinForm.painLevel.toUpperCase()}${walkinForm.hasPhobia ? ' | Has Dental Phobia' : ''}]`;

    const newAppt: Appointment = {
      id: "APT_" + Date.now(),
      code,
      name: walkinForm.name,
      phone: walkinForm.phone,
      email: walkinForm.email || 'no-email@smilecare.in',
      service: walkinForm.service,
      date: walkinForm.date,
      timeSlot: walkinForm.timeSlot,
      message: complexMessage,
      status: 'approved', // Walk-ins added by doctor are auto-approved
      createdAt: new Date().toISOString(),
      notes: '',
      billingAmount: 0
    };

    const list = [newAppt, ...appointments];
    saveAppointmentsToStorage(list);

    // Reset Form
    setWalkinForm({
      name: '',
      phone: '',
      email: '',
      service: 'general',
      date: new Date().toISOString().split('T')[0],
      timeSlot: 'morning',
      message: '',
      painLevel: 'none',
      hasPhobia: false
    });

    setActiveTab('appointments');
    showUINotification('Manual booking registered successfully!');
  };

  // Seeding backup restoration
  const handleRestoreBackup = () => {
    if (confirm("Restore clinical backup? This resets appointments to the custom seed state.")) {
      saveAppointmentsToStorage(SEED_APPOINTMENTS);
      showUINotification('Backup database successfully restored.');
    }
  };

  const handleClearDatabase = () => {
    if (confirm("Wipe all appointments? This cannot be undone.")) {
      saveAppointmentsToStorage([]);
      showUINotification('Clinical records wiped completely.');
    }
  };

  // Filter & Search computation
  const filteredAppointments = useMemo(() => {
    return appointments.filter(app => {
      const matchSearch = 
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.phone.includes(searchQuery) ||
        app.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchStatus = statusFilter === 'all' ? true : app.status === statusFilter;
      const matchService = serviceFilter === 'all' ? true : app.service === serviceFilter;
      const matchDate = dateFilter ? app.date === dateFilter : true;

      return matchSearch && matchStatus && matchService && matchDate;
    });
  }, [appointments, searchQuery, statusFilter, serviceFilter, dateFilter]);

  // Statistics calculation for dynamic dashboard analytics
  const statistics = useMemo(() => {
    let total = appointments.length;
    let pending = 0;
    let approved = 0;
    let completed = 0;
    let cancelled = 0;
    let totalSales = 0;
    let serviceCounts: Record<string, number> = {};

    appointments.forEach(app => {
      if (app.status === 'pending') pending++;
      else if (app.status === 'approved') approved++;
      else if (app.status === 'completed') {
        completed++;
        totalSales += app.billingAmount || 0;
      } else if (app.status === 'cancelled') cancelled++;

      serviceCounts[app.service] = (serviceCounts[app.service] || 0) + 1;
    });

    const popularServicesData = Object.entries(serviceCounts).map(([key, value]) => {
      return {
        name: TREATMENTS[key]?.name?.split(' ')[0] || key,
        appointments: value,
        fullName: TREATMENTS[key]?.name || key
      };
    });

    // Calendar timelines (Today's queue)
    const todayStr = new Date().toISOString().split('T')[0];
    const todayAppointments = appointments.filter(app => app.date === todayStr);

    // Revenue log charting
    // Build array of last 7 calendar dates mapping to completed invoice sums
    const dailySalesData = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000);
      const dayStr = d.toISOString().split('T')[0];
      const displayStr = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      
      const sumForDay = appointments
        .filter(app => app.status === 'completed' && app.date === dayStr)
        .reduce((acc, current) => acc + (current.billingAmount || 0), 0);

      return {
        date: displayStr,
        revenue: sumForDay
      };
    });

    return {
      total,
      pending,
      approved,
      completed,
      cancelled,
      totalSales,
      popularServicesData,
      todayAppointments,
      dailySalesData
    };
  }, [appointments]);

  // Helper toaster notification
  const showUINotification = (msg: string) => {
    // Rely on static template's window toast, or fallback
    if (window.showToast) {
      window.showToast(msg, 'success');
    } else {
      alert(`[SmileCare Admin]: ${msg}`);
    }
  };

  if (!isAdminMode) {
    return null;
  }

  // Color mappings
  const COLORS = {
    pending: '#F59E0B',
    approved: '#6366F1',
    completed: '#10B981',
    cancelled: '#EF4444'
  };

  return (
    <div id="admin-panel-overlay" className="fixed inset-0 z-50 flex bg-slate-950 font-sans text-slate-100 overflow-hidden animate-[fadeIn_0.4s_ease-out]">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-72 bg-[#061324] border-r border-teal/15 flex flex-col justify-between flex-shrink-0">
        <div>
          {/* Logo Brand Header */}
          <div className="p-6 border-b border-white/5 flex items-center gap-3">
            <div className="bg-teal/10 p-2.5 rounded-xl border border-teal/20 text-teal">
              <i className="fa-solid fa-tooth text-lg"></i>
            </div>
            <div>
              <span className="font-serif text-lg font-bold tracking-wide text-white block">SmileCare</span>
              <span className="text-[9px] uppercase tracking-widest font-mono text-teal block">Medical Dashboard</span>
            </div>
          </div>

          {/* Quick Active User Profile Card */}
          {isLoggedIn && (
            <div className="px-5 py-4 my-2 mx-3 bg-[#0B1F3A]/60 rounded-2xl border border-teal/10 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-teal/15 border border-teal/20 flex items-center justify-center text-teal">
                <i className="fa-solid fa-user-doctor"></i>
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">Dr. Aisha Mehta</p>
                <p className="text-[10px] text-teal font-mono tracking-wide">Chief MDS Surgeon</p>
              </div>
            </div>
          )}

          {/* Main List Navigation items */}
          {isLoggedIn && (
            <nav className="p-4 flex flex-col gap-1.5">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-teal text-navy font-bold shadow-md shadow-teal/15'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <LayoutDashboard size={18} />
                <span>Executive Overview</span>
              </button>

              <button
                onClick={() => setActiveTab('appointments')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all relative ${
                  activeTab === 'appointments'
                    ? 'bg-teal text-navy font-bold shadow-md shadow-teal/15'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Users size={18} />
                <span>Appointment Ledger</span>
                {statistics.pending > 0 && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-amber-500 text-navy font-black text-[10px] px-2 py-0.5 rounded-full">
                    {statistics.pending}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('walkin')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'walkin'
                    ? 'bg-teal text-navy font-bold shadow-md shadow-teal/15'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <PlusCircle size={18} />
                <span>Walk-in Booking Desk</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'settings'
                    ? 'bg-teal text-navy font-bold shadow-md shadow-teal/15'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Sliders size={18} />
                <span>Clinic Adjustments</span>
              </button>
            </nav>
          )}
        </div>

        {/* Footer Sidebar Controls */}
        <div className="p-4 border-t border-white/5 flex flex-col gap-2">
          {/* Real-time clinical status counter */}
          <div className="px-3.5 py-2.5 bg-navy-light/10 border border-white/5 rounded-xl font-mono text-[10px] text-slate-400 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-teal">
              <Activity size={10} className="animate-pulse" />
              <span className="font-bold tracking-wider">DATABASE STATUS</span>
            </div>
            <div>STATION: 3000 // OPERATIVE</div>
            <div>TIME: {new Date().toLocaleTimeString()}</div>
            <div>ROWS: {appointments.length} REGISTERS</div>
          </div>

          <button
            onClick={() => {
              setIsAdminMode(false);
              window.location.hash = '#home';
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border border-white/10 hover:border-teal/35 bg-white/5 hover:bg-teal/5 text-slate-300 hover:text-teal transition-all cursor-pointer"
          >
            <X size={14} />
            <span>Close Workspace</span>
          </button>

          {isLoggedIn && (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-navy border border-rose-500/20 hover:border-rose-500 transition-all cursor-pointer"
            >
              <LogOut size={14} />
              <span>Sign Out Section</span>
            </button>
          )}
        </div>
      </aside>

      {/* CORE DISPLAY WORKSPACE CONTAINER */}
      <main className="flex-1 bg-[#091524] overflow-y-auto flex flex-col">
        
        {/* TOP STATUS HEADER BAR */}
        <header className="h-20 bg-[#061324] border-b border-teal/15 px-8 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="bg-teal/10 text-teal py-1 px-3 border border-teal/20 text-[10px] font-mono rounded font-bold uppercase tracking-widest">
              Secured Clinical Hub
            </span>
            <h2 className="text-sm font-semibold text-slate-300">SmileCare Private Administration Workspace</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-xs text-slate-400 font-mono">
              <Clock size={14} className="text-teal" />
              <span>UTC : 2026-06-09 16:15</span>
            </div>
            {isLoggedIn && (
              <div className="h-3.5 w-3.5 rounded-full bg-emerald-500 animate-pulse border-2 border-slate-900" title="Clinic Server Connected"></div>
            )}
          </div>
        </header>

        {/* WORKSPACE VIEWS */}
        <div className="flex-1 p-8">

          {/* SECURE PASSCODE LAYOUT IF INSTANCE NOT LOGGED IN */}
          {!isLoggedIn ? (
            <div className="max-w-md mx-auto my-12 bg-[#061324] border border-teal/15 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-x-0 -bottom-32 h-64 bg-teal/5 rounded-full blur-2xl pointer-events-none"></div>
              
              <div className="text-center mb-8">
                <div className="inline-flex h-16 w-16 bg-teal/10 rounded-2xl border border-teal/20 items-center justify-center text-teal mb-4">
                  <Lock size={32} />
                </div>
                <h3 className="font-serif text-2xl font-bold text-white tracking-tight">Administrative Authentication</h3>
                <p className="text-xs text-slate-400 mt-2">Access restricts records to SmileCare licensed practitioners and desk coordinators.</p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-mono font-bold text-slate-400 mb-2">Doctor Passcode Key</label>
                  <input
                    type="password"
                    required
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="Enter gatekeeping credential..."
                    className="w-full bg-[#0B1F3A]/60 border border-teal/15 rounded-xl py-3.5 px-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-teal transition-all focus:ring-2 focus:ring-teal/10"
                  />
                  <p className="text-[10px] text-slate-500 font-mono mt-1.5 text-left">💡 Hint: Enter <strong>admin</strong> or <strong>smile123</strong> to audit.</p>
                </div>

                {loginError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/35 rounded-xl flex items-center gap-2 text-xs text-rose-400">
                    <AlertTriangle size={15} className="flex-shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-teal to-[#33D4C1] hover:from-[#33D4C1] hover:to-teal text-navy font-bold py-3.5 rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-teal/15 transition-all cursor-pointer"
                >
                  Confirm Gate Pass
                </button>
              </form>
            </div>
          ) : (
            <>
              {/* TAB 1: EXECUTIVE OVERVIEW (DASHBOARD) */}
              {activeTab === 'dashboard' && (
                <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]">
                  
                  {/* Doctor greeting banner */}
                  <div className="bg-[#061324] border border-teal/15 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-teal/5 rounded-full blur-2xl pointer-events-none"></div>
                    <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
                      <div className="bg-teal/15 h-16 w-16 border border-teal/20 rounded-2xl flex items-center justify-center text-teal text-2xl flex-shrink-0">
                        <FileHeart size={30} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white tracking-wide">Good day, Dr. Aisha Mehta!</h3>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-xl">
                          You are currently tracking <strong>{statistics.pending} queue requests</strong> awaiting slot confirmation. Invoices calculated total estimated clinical collections of <strong>₹{statistics.totalSales.toLocaleString('en-IN')}</strong>.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('walkin')}
                      className="bg-teal hover:bg-teal-light text-navy font-bold px-5 py-3 rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 transform hover:-translate-y-0.5 transition-all shadow-md cursor-pointer"
                    >
                      <PlusCircle size={15} />
                      <span>Manually Register Walk-In</span>
                    </button>
                  </div>

                  {/* Operational Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Stat CARD 1: Total Patients */}
                    <div className="bg-[#061324] border border-white/5 hover:border-teal/30 p-5 rounded-2xl shadow-sm flex items-center justify-between transition-all group">
                      <div className="space-y-1 text-left">
                        <span className="text-[10px] tracking-widest uppercase font-mono text-slate-400">Ledger Registers</span>
                        <h4 className="text-3xl font-serif font-black text-white">{statistics.total}</h4>
                        <span className="text-[10px] block text-teal font-mono">Total Patient Records</span>
                      </div>
                      <div className="bg-teal/10 text-teal p-3.5 rounded-xl border border-teal/20 group-hover:bg-teal group-hover:text-navy transition-all duration-300">
                        <Users size={20} />
                      </div>
                    </div>

                    {/* Stat CARD 2: Awaiting Approval */}
                    <div className="bg-[#061324] border border-white/5 hover:border-amber-500/30 p-5 rounded-2xl shadow-sm flex items-center justify-between transition-all group">
                      <div className="space-y-1 text-left">
                        <span className="text-[10px] tracking-widest uppercase font-mono text-slate-400">Queue Waitlist</span>
                        <h4 className="text-3xl font-serif font-black text-amber-400">{statistics.pending}</h4>
                        <span className="text-[10px] block text-amber-500 font-mono">Needs Slot Approval</span>
                      </div>
                      <div className="bg-amber-500/10 text-amber-400 p-3.5 rounded-xl border border-amber-500/20 group-hover:bg-amber-500 group-hover:text-navy transition-all duration-300">
                        <Clock size={20} />
                      </div>
                    </div>

                    {/* Stat CARD 3: Scheduled Active */}
                    <div className="bg-[#061324] border border-white/5 hover:border-indigo-400/30 p-5 rounded-2xl shadow-sm flex items-center justify-between transition-all group">
                      <div className="space-y-1 text-left">
                        <span className="text-[10px] tracking-widest uppercase font-mono text-slate-400">Secured Schedule</span>
                        <h4 className="text-3xl font-serif font-black text-indigo-400">{statistics.approved}</h4>
                        <span className="text-[10px] block text-indigo-400 font-mono">Confirmed Active Bookings</span>
                      </div>
                      <div className="bg-indigo-400/10 text-indigo-400 p-3.5 rounded-xl border border-indigo-400/20 group-hover:bg-indigo-400 group-hover:text-navy transition-all duration-300">
                        <UserCheck size={20} />
                      </div>
                    </div>

                    {/* Stat CARD 4: Business Revenue */}
                    <div className="bg-[#061324] border border-white/5 hover:border-emerald-500/30 p-5 rounded-2xl shadow-sm flex items-center justify-between transition-all group">
                      <div className="space-y-1 text-left">
                        <span className="text-[10px] tracking-widest uppercase font-mono text-slate-400">Billing Closed</span>
                        <h4 className="text-3xl font-serif font-black text-emerald-400">₹{statistics.totalSales.toLocaleString('en-IN')}</h4>
                        <span className="text-[10px] block text-emerald-400 font-mono">Sum finalized collections</span>
                      </div>
                      <div className="bg-emerald-500/10 text-emerald-400 p-3.5 rounded-xl border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-navy transition-all duration-300">
                        <DollarSign size={20} />
                      </div>
                    </div>
                  </div>

                  {/* Graphs Visualization Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Graph 1: Revenue Timeline (7 days history) */}
                    <div className="lg:col-span-7 bg-[#061324] border border-white/5 p-6 rounded-2xl flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-6">
                        <div className="text-left">
                          <span className="text-[10px] translate-y-[-2px] tracking-widest uppercase font-mono text-teal">clinical performance</span>
                          <h4 className="font-serif text-lg font-bold text-white mt-0.5">Billing & Revenue Tally</h4>
                        </div>
                        <span className="bg-white/5 border border-white/10 rounded px-2 py-1 text-[10px] font-mono text-slate-400">Last 7 Calendar Days</span>
                      </div>

                      <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={statistics.dailySalesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#00C9B1" stopOpacity={0.25}/>
                                <stop offset="95%" stopColor="#00C9B1" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                            <XAxis dataKey="date" stroke="#94A3B8" fontSize={10} fontStyle="italic" />
                            <YAxis stroke="#94A3B8" fontSize={10} />
                            <Tooltip contentStyle={{ backgroundColor: '#0B1F3A', borderColor: 'rgba(0, 201, 177, 0.25)', borderRadius: '12px', fontSize: '12px', color: '#FFF' }} />
                            <Area type="monotone" dataKey="revenue" stroke="#00C9B1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Graph 2: Popular Treatment distribution (pie style index) */}
                    <div className="lg:col-span-5 bg-[#061324] border border-white/5 p-6 rounded-2xl flex flex-col justify-between">
                      <div className="text-left mb-4">
                        <span className="text-[10px] tracking-widest uppercase font-mono text-teal">treatment indicators</span>
                        <h4 className="font-serif text-lg font-bold text-white mt-0.5">Departmental Breakdown</h4>
                      </div>

                      {statistics.popularServicesData.length === 0 ? (
                        <div className="h-64 flex items-center justify-center text-xs text-slate-500 font-mono italic">No data logged. Write manual walk-in or book via main page.</div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                          <div className="sm:col-span-7 h-56 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={statistics.popularServicesData} layout="vertical" margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                <XAxis type="number" stroke="#94A3B8" fontSize={9} />
                                <YAxis dataKey="name" type="category" stroke="#94A3B8" fontSize={9} width={65} />
                                <Tooltip contentStyle={{ backgroundColor: '#0B1F3A', borderColor: 'rgba(0, 201, 177, 0.15)', borderRadius: '10px', fontSize: '11px' }} />
                                <Bar dataKey="appointments" fill="#33D4C1" radius={[0, 4, 4, 0]} barSize={14}>
                                  {statistics.popularServicesData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#00C9B1' : '#33D4C1'} />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                          
                          {/* Services descriptive keys */}
                          <div className="sm:col-span-5 text-left flex flex-col gap-2.5">
                            <p className="text-[10px] font-mono tracking-wider text-slate-400 font-bold uppercase border-b border-white/5 pb-1">Treatment share</p>
                            <div className="space-y-2 overflow-y-auto max-h-36 pr-1">
                              {statistics.popularServicesData.map((entry, idx) => (
                                <div key={idx} className="flex flex-col">
                                  <span className="text-xs font-semibold text-slate-200 truncate">{entry.fullName}</span>
                                  <span className="text-[10px] text-teal font-mono">{entry.appointments} Patient{entry.appointments > 1 ? 's' : ''}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Row 3: Active Today schedule queues */}
                  <div className="bg-[#061324] border border-white/5 p-6 rounded-2xl">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                      <div className="text-left">
                        <span className="text-[10px] tracking-widest uppercase font-mono text-teal">Daily Operational Agenda</span>
                        <h4 className="font-serif text-lg font-bold text-white mt-0.5">Today's Clinic Time Queue</h4>
                      </div>
                      <span className="bg-teal/10 border border-teal/20 text-teal rounded-full px-3 py-1 font-mono text-xs font-bold">
                        🗓️ {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>

                    {statistics.todayAppointments.length === 0 ? (
                      <div className="py-12 border-2 border-dashed border-white/5 rounded-xl flex flex-col items-center justify-center text-slate-400">
                        <Calendar size={32} className="text-slate-500 mb-2" />
                        <p className="text-sm font-semibold">No patient bookings queued for today.</p>
                        <p className="text-xs text-slate-600 mt-1">Book an appointment on the primary page or add a manual Walk-in to load records.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {['morning', 'afternoon', 'evening'].map(slot => {
                          const apptsInSlot = statistics.todayAppointments.filter(app => app.timeSlot === slot);
                          return (
                            <div key={slot} className="bg-navy-light/10 border border-white/5 p-4 rounded-xl text-left">
                              <h5 className="text-xs font-bold uppercase tracking-wider font-mono text-teal mb-3.5 flex items-center justify-between">
                                <span>{slot.toUpperCase()} Queue</span>
                                <span className="bg-white/5 px-2 py-0.5 rounded text-[10px] font-normal text-slate-400">{apptsInSlot.length} Cases</span>
                              </h5>
                              
                              {apptsInSlot.length === 0 ? (
                                <p className="text-[11px] italic text-slate-500 font-mono py-4">No appointments registered in this time blocks.</p>
                              ) : (
                                <div className="space-y-3">
                                  {apptsInSlot.map(appt => (
                                    <div
                                      key={appt.id}
                                      onClick={() => { setSelectedAppt(appt); setActiveTab('appointments'); }}
                                      className="bg-[#0B1F3A]/40 hover:bg-[#0B1F3A] border border-white/5 hover:border-teal/20 rounded-lg p-3 transition-all cursor-pointer group"
                                    >
                                      <div className="flex items-center justify-between gap-2">
                                        <p className="text-xs font-bold text-white group-hover:text-teal transition-colors truncate">{appt.name}</p>
                                        <span className={`text-[9px] uppercase font-mono px-1.5 py-0.5 rounded ${
                                          appt.status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                                          appt.status === 'approved' ? 'bg-indigo-400/10 text-indigo-400' :
                                          appt.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                                          'bg-rose-500/10 text-rose-400'
                                        }`}>
                                          {appt.status}
                                        </span>
                                      </div>
                                      <p className="text-[10px] text-slate-300 font-mono mt-1.5">{TREATMENTS[appt.service]?.name || appt.service}</p>
                                      <div className="flex gap-2 items-center mt-2 pt-2 border-t border-white/5 text-[9px] text-slate-400">
                                        <span>☎️ {appt.phone}</span>
                                        <span className="font-mono text-[8px] bg-white/5 rounded px-1 ml-auto">{appt.code}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* TAB 2: APPOINTMENT LEDGER (MANAGE & GRID VIEW) */}
              {activeTab === 'appointments' && (
                <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
                  
                  {/* Ledger Header Page block descriptor */}
                  <div className="text-left">
                    <h3 className="font-serif text-2xl font-bold text-white">Clinical Appointment Ledger</h3>
                    <p className="text-xs text-slate-400 mt-1">Audit, modify, verify client diagnostic concerns, write notes, complete, or reschedule bookings.</p>
                  </div>

                  {/* Filter Rail Bar Block */}
                  <div className="bg-[#061324] border border-white/5 rounded-2xl p-5 space-y-4 text-left">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      {/* Search inputs */}
                      <div className="md:col-span-5 relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                          <Search size={14} />
                        </span>
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search patient names, contact numbers, ticket codes..."
                          className="w-full bg-[#0B1F3A]/60 border border-white/5 focus:border-teal rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none transition-all"
                        />
                      </div>

                      {/* Dropdown service categorization filters */}
                      <div className="md:col-span-3">
                        <select
                          value={serviceFilter}
                          onChange={(e) => setServiceFilter(e.target.value)}
                          className="w-full bg-[#0B1F3A]/60 border border-white/5 focus:border-teal rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none"
                        >
                          <option value="all">-- All Medical Services --</option>
                          {Object.entries(TREATMENTS).map(([key, details]) => (
                            <option key={key} value={key}>{details.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Date selection calendars */}
                      <div className="md:col-span-3">
                        <input
                          type="date"
                          value={dateFilter}
                          onChange={(e) => setDateFilter(e.target.value)}
                          className="w-full bg-[#0B1F3A]/60 border border-white/5 focus:border-teal rounded-xl py-2 px-3 text-xs text-white focus:outline-none text-left"
                        />
                      </div>

                      {/* Reset Filters button */}
                      <div className="md:col-span-1 flex items-center justify-end">
                        <button
                          onClick={() => { setSearchQuery(''); setStatusFilter('all'); setServiceFilter('all'); setDateFilter(''); }}
                          className="w-full h-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl text-xs py-2 px-2 border border-white/5 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                          title="Reset filter setup"
                        >
                          <ListRestart size={14} />
                          <span className="md:hidden">Reset</span>
                        </button>
                      </div>
                    </div>

                    {/* Status selection pill counters */}
                    <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-white/5 text-xs">
                      <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400 mr-2">Status filter:</span>
                      
                      <button
                        onClick={() => setStatusFilter('all')}
                        className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                          statusFilter === 'all'
                            ? 'bg-slate-200 text-navy font-bold shadow'
                            : 'bg-white/5 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        All ({appointments.length})
                      </button>

                      <button
                        onClick={() => setStatusFilter('pending')}
                        className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                          statusFilter === 'pending'
                            ? 'bg-amber-500 text-navy font-bold shadow'
                            : 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20'
                        }`}
                      >
                        <Clock size={12} />
                        Pending ({appointments.filter(a => a.status === 'pending').length})
                      </button>

                      <button
                        onClick={() => setStatusFilter('approved')}
                        className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                          statusFilter === 'approved'
                            ? 'bg-indigo-400 text-navy font-bold shadow'
                            : 'bg-indigo-400/10 text-indigo-400 hover:bg-indigo-400/20'
                        }`}
                      >
                        <UserCheck size={12} />
                        Approved ({appointments.filter(a => a.status === 'approved').length})
                      </button>

                      <button
                        onClick={() => setStatusFilter('completed')}
                        className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                          statusFilter === 'completed'
                            ? 'bg-emerald-500 text-navy font-bold shadow'
                            : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                        }`}
                      >
                        <CheckCircle size={12} />
                        Completed ({appointments.filter(a => a.status === 'completed').length})
                      </button>

                      <button
                        onClick={() => setStatusFilter('cancelled')}
                        className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                          statusFilter === 'cancelled'
                            ? 'bg-rose-500 text-navy font-bold shadow'
                            : 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                        }`}
                      >
                        <AlertOctagon size={12} />
                        Cancelled ({appointments.filter(a => a.status === 'cancelled').length})
                      </button>
                    </div>
                  </div>

                  {/* Main Grid: Data list + Patient detailed profiles */}
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    
                    {/* Database listing side */}
                    <div className="xl:col-span-8 space-y-4">
                      
                      {filteredAppointments.length === 0 ? (
                        <div className="bg-[#061324] border border-white/5 rounded-2xl py-16 px-6 text-center text-slate-400">
                          <Users size={40} className="mx-auto text-slate-600 mb-2" />
                          <p className="text-sm font-semibold">No appointment logs match search query parameters.</p>
                          <p className="text-xs text-slate-600 mt-1">Refine your active filter parameters or search words.</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto bg-[#061324] border border-white/5 rounded-2xl">
                          <table className="w-full text-left border-collapse min-w-[700px]">
                            <thead>
                              <tr className="bg-navy-light/10 text-[10px] uppercase font-mono tracking-wider text-slate-400 border-b border-white/5">
                                <th className="py-4 px-5">Ticket Code</th>
                                <th className="py-4 px-5">Patient Details</th>
                                <th className="py-4 px-5">Scheduled Slot</th>
                                <th className="py-4 px-5">Service Category</th>
                                <th className="py-4 px-5">Status</th>
                                <th className="py-4 px-5 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-xs">
                              {filteredAppointments.map(appt => (
                                <tr
                                  key={appt.id}
                                  onClick={() => setSelectedAppt(appt)}
                                  className={`hover:bg-[#0B1F3A]/40 transition-colors cursor-pointer ${
                                    selectedAppt?.id === appt.id ? 'bg-[#0B1F3A]/60 border-l-2 border-l-teal' : ''
                                  }`}
                                >
                                  {/* Code column */}
                                  <td className="py-3.5 px-5 font-mono font-bold text-teal">
                                    {appt.code}
                                  </td>

                                  {/* Patient details */}
                                  <td className="py-3.5 px-5">
                                    <div>
                                      <p className="font-bold text-white text-sm">{appt.name}</p>
                                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{appt.phone}</p>
                                    </div>
                                  </td>

                                  {/* Scheduled slot */}
                                  <td className="py-3.5 px-5">
                                    <div>
                                      <p className="font-semibold text-slate-200">
                                        {new Date(appt.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: '2-digit' })}
                                      </p>
                                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono mt-0.5">
                                        ⏱️ {appt.timeSlot}
                                      </p>
                                    </div>
                                  </td>

                                  {/* Service */}
                                  <td className="py-3.5 px-5">
                                    <div className="flex flex-col">
                                      <span className="font-semibold text-slate-300">
                                        {TREATMENTS[appt.service]?.name || appt.service}
                                      </span>
                                      {appt.billingAmount && appt.billingAmount > 0 ? (
                                        <span className="text-[10px] text-emerald-400 font-mono mt-0.5">
                                          Invoiced: ₹{appt.billingAmount.toLocaleString('en-IN')}
                                        </span>
                                      ) : null}
                                    </div>
                                  </td>

                                  {/* Status badge */}
                                  <td className="py-3.5 px-5">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase font-mono tracking-wider font-bold ${
                                      appt.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                      appt.status === 'approved' ? 'bg-indigo-400/10 text-indigo-400 border border-indigo-400/20' :
                                      appt.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                      'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                    }`}>
                                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: COLORS[appt.status] }}></span>
                                      {appt.status}
                                    </span>
                                  </td>

                                  {/* Click action shortcuts */}
                                  <td className="py-3.5 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex items-center justify-end gap-1.5">
                                      {appt.status === 'pending' && (
                                        <button
                                          onClick={() => handleApproveAppointment(appt.id)}
                                          className="p-1 px-2.5 bg-indigo-500/10 hover:bg-indigo-500 hover:text-white rounded border border-indigo-500/20 text-indigo-400 text-[10px] transition-colors cursor-pointer"
                                          title="Approve Slot"
                                        >
                                          Approve
                                        </button>
                                      )}

                                      {appt.status === 'approved' && (
                                        <button
                                          onClick={() => openCompleteModal(appt)}
                                          className="p-1 px-2.5 bg-emerald-500/10 hover:bg-emerald-500 hover:text-white rounded border border-emerald-500/20 text-emerald-400 text-[10px] transition-colors cursor-pointer"
                                          title="Mark Complete"
                                        >
                                          Mark Complete
                                        </button>
                                      )}

                                      <button
                                        onClick={() => openRescheduleModal(appt)}
                                        className="p-1 text-slate-400 hover:text-white bg-white/5 border border-white/5 hover:border-white/20 rounded cursor-pointer"
                                        title="Reschedule Slot"
                                      >
                                        <CalendarDays size={13} />
                                      </button>

                                      {(appt.status === 'pending' || appt.status === 'approved') && (
                                        <button
                                          onClick={() => handleCancelAppointment(appt.id)}
                                          className="p-1 text-rose-400 hover:text-navy bg-rose-500/10 hover:bg-rose-500 rounded border border-rose-500/15 transition-colors cursor-pointer"
                                          title="Cancel Slot"
                                        >
                                          <AlertOctagon size={13} />
                                        </button>
                                      )}

                                      <button
                                        onClick={() => handleDeleteAppointment(appt.id)}
                                        className="p-1 text-slate-500 hover:text-rose-500 hover:bg-rose-500/5 rounded cursor-pointer"
                                        title="Delete permanent record"
                                      >
                                        <Trash2 size={13} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {/* Patient detailed profiles side (Dynamic rendering) */}
                    <div className="xl:col-span-4">
                      {selectedAppt ? (
                        <div className="bg-[#061324] border border-teal/15 rounded-2xl p-6 text-left space-y-6 relative overflow-hidden animate-[fadeIn_0.25s_ease-out]">
                          
                          {/* Close indicator */}
                          <div className="flex items-center justify-between border-b border-white/5 pb-4">
                            <div>
                              <span className="text-[10px] font-mono tracking-widest text-teal uppercase">Client Record profile</span>
                              <h4 className="font-serif text-lg font-bold text-white mt-1">Patient Card Overview</h4>
                            </div>
                            <button
                              onClick={() => setSelectedAppt(null)}
                              className="bg-white/5 p-1.5 border border-white/5 hover:border-white/20 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                            >
                              <X size={14} />
                            </button>
                          </div>

                          {/* Profile core info card */}
                          <div className="space-y-4">
                            <div className="flex items-center gap-3.5 bg-navy-light/10 p-3 rounded-xl border border-white/5">
                              <div className="h-10 w-10 flex-shrink-0 rounded-full bg-teal/10 flex items-center justify-center font-serif text-teal font-black">
                                {selectedAppt.name.split(' ').map(n=>n[0]).join('').slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <h5 className="font-bold text-white text-base">{selectedAppt.name}</h5>
                                <span className="bg-white/5 font-mono text-[9px] px-2 py-0.5 rounded text-white/50">{selectedAppt.code}</span>
                              </div>
                            </div>

                            <div className="space-y-2.5 text-xs text-slate-300">
                              <div className="flex items-center gap-2.5">
                                <Phone size={14} className="text-teal" />
                                <span>{selectedAppt.phone}</span>
                              </div>
                              <div className="flex items-center gap-2.5">
                                <Mail size={14} className="text-teal" />
                                <span className="truncate">{selectedAppt.email}</span>
                              </div>
                              <div className="flex items-center gap-2.5">
                                <CalendarDays size={14} className="text-teal" />
                                <span>Logged: {new Date(selectedAppt.createdAt).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                            </div>
                          </div>

                          {/* Treatment requirements */}
                          <div className="space-y-1.5 pt-4 border-t border-white/5">
                            <span className="text-[9px] font-mono tracking-widest uppercase text-teal">clinical request</span>
                            <div className="flex items-center gap-2 font-semibold text-slate-200">
                              <span>Treatment:</span>
                              <span className="text-white bg-teal/5 border border-teal/15 px-2 py-0.5 rounded text-xs">
                                {TREATMENTS[selectedAppt.service]?.name || selectedAppt.service}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-300 pt-1">
                              <span>Slot Reserved: </span>
                              <strong className="text-slate-100">{selectedAppt.date} ({selectedAppt.timeSlot.toUpperCase()})</strong>
                            </div>
                          </div>

                          {/* Patient optional concerns & severity issues */}
                          <div className="space-y-2.5 bg-navy-light/15 p-4 rounded-xl border border-white/5">
                            <h6 className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400 flex items-center justify-between">
                              <span>Inlet Complaint & Logs</span>
                              {selectedAppt.message.includes('PAIN LEVEL: SEVERE') && (
                                <span className="bg-amber-500/10 text-amber-400 px-2 py-0.5 text-[8px] font-black rounded border border-amber-500/20">🔥 SEVERE PAIN</span>
                              )}
                            </h6>
                            <p className="text-xs text-slate-300 leading-relaxed italic bg-black/25 p-2 rounded">
                              "{selectedAppt.message}"
                            </p>
                          </div>

                          {/* Medical Practitioner clinical notes */}
                          <div className="space-y-2.5 pt-4 border-t border-white/5">
                            <span className="text-[10px] font-mono tracking-widest uppercase text-teal">Physician's Diagnosis & Notes</span>
                            {selectedAppt.status === 'completed' ? (
                              <div className="space-y-2.5">
                                <div className="text-xs text-slate-300 font-mono tracking-wide p-3 bg-black/45 rounded-xl border border-white/5 min-h-[60px] whitespace-pre-wrap">
                                  {selectedAppt.notes || "No notes logged."}
                                </div>
                                <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/15 flex items-center justify-between">
                                  <span className="text-slate-300 text-xs">Invoice Closed:</span>
                                  <strong className="text-emerald-400 text-sm font-mono">₹{selectedAppt.billingAmount?.toLocaleString('en-IN')}</strong>
                                </div>
                              </div>
                            ) : (
                              <div className="bg-white/5 p-4 rounded-xl text-center border-dashed border border-white/10">
                                <p className="text-[11px] text-slate-400">Diagnosis notes will be recorded once treatment starts and is marked as <strong>Completed</strong>.</p>
                                <button
                                  onClick={() => openCompleteModal(selectedAppt)}
                                  className="mt-3.5 bg-teal hover:bg-teal-light text-navy font-bold px-3.5 py-1.5 rounded-lg text-[10px] uppercase tracking-wider cursor-pointer transition-all"
                                >
                                  Complete Appointment Now
                                </button>
                              </div>
                            )}
                          </div>

                        </div>
                      ) : (
                        <div className="bg-[#061324] border border-white/5 rounded-2xl p-8 py-16 text-center text-slate-500 h-full flex flex-col justify-center items-center">
                          <FileText size={40} className="text-slate-600 mb-2" />
                          <p className="text-sm font-semibold">No Patient Record Selected</p>
                          <p className="text-xs text-slate-600 mt-1">Click on any appointment row from the ledger table to view comprehensive diagnostics, phone history, clinical notes and billing balances.</p>
                        </div>
                      )}
                    </div>

                  </div>

                </div>
              )}

              {/* TAB 3: WALK-IN BOOKING DESK */}
              {activeTab === 'walkin' && (
                <div className="max-w-3xl mx-auto animate-[fadeIn_0.3s_ease-out] space-y-6 text-left">
                  
                  {/* Title */}
                  <div>
                    <h3 className="font-serif text-2xl font-bold text-white">Manual Walk-in Registration Console</h3>
                    <p className="text-xs text-slate-400 mt-1">Book desk-recorded appointments on behalf of on-call or walk-in clinical patients directly.</p>
                  </div>

                  <form onSubmit={handleWalkinAdd} className="bg-[#061324] border border-teal/15 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-x-0 bottom-0 h-32 bg-teal/5 rounded-full blur-2xl pointer-events-none"></div>

                    {/* Section 1: Demographics */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-teal font-mono border-b border-white/5 pb-2">1. Patient Demographic details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-[11px] uppercase tracking-wider font-mono text-slate-400 mb-2 font-semibold">Full Patient Name *</label>
                          <input
                            type="text"
                            required
                            value={walkinForm.name}
                            onChange={(e) => setWalkinForm({ ...walkinForm, name: e.target.value })}
                            placeholder="Mr./Ms. First Last"
                            className="w-full bg-[#0B1F3A]/60 border border-white/5 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-teal transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] uppercase tracking-wider font-mono text-slate-400 mb-2 font-semibold">Phone Number *</label>
                          <input
                            type="tel"
                            required
                            value={walkinForm.phone}
                            onChange={(e) => setWalkinForm({ ...walkinForm, phone: e.target.value })}
                            placeholder="+91 XXXXX XXXXX"
                            className="w-full bg-[#0B1F3A]/60 border border-white/5 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-teal transition-all"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-[11px] uppercase tracking-wider font-mono text-slate-400 mb-2 font-semibold">Email Address (Optional)</label>
                          <input
                            type="email"
                            value={walkinForm.email}
                            onChange={(e) => setWalkinForm({ ...walkinForm, email: e.target.value })}
                            placeholder="patient@example.com"
                            className="w-full bg-[#0B1F3A]/60 border border-white/5 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-teal transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] uppercase tracking-wider font-mono text-slate-400 mb-2 font-semibold">Select Dental Service *</label>
                          <select
                            required
                            value={walkinForm.service}
                            onChange={(e) => setWalkinForm({ ...walkinForm, service: e.target.value })}
                            className="w-full bg-[#0B1F3A]/60 border border-white/5 focus:border-teal rounded-xl py-3 px-4 text-xs text-white focus:outline-none select-none"
                          >
                            {Object.entries(TREATMENTS).map(([key, details]) => (
                              <option key={key} value={key}>{details.name} (₹{details.price})</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Slot schedule */}
                    <div className="space-y-4 pt-4 border-t border-white/5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-teal font-mono border-b border-white/5 pb-2">2. Scheduling clinical block</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-[11px] uppercase tracking-wider font-mono text-slate-400 mb-2 font-semibold">Appointment Date *</label>
                          <input
                            type="date"
                            required
                            value={walkinForm.date}
                            onChange={(e) => setWalkinForm({ ...walkinForm, date: e.target.value })}
                            className="w-full bg-[#0B1F3A]/60 border border-white/5 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-teal"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] uppercase tracking-wider font-mono text-slate-400 mb-2 font-semibold">Preferred Time Slot *</label>
                          <select
                            required
                            value={walkinForm.timeSlot}
                            onChange={(e) => setWalkinForm({ ...walkinForm, timeSlot: e.target.value })}
                            className="w-full bg-[#0B1F3A]/60 border border-white/5 rounded-xl py-3 px-4 text-xs text-white focus:outline-none select-none"
                          >
                            <option value="morning">Morning Slot (09:30 AM - 12:30 PM)</option>
                            <option value="afternoon">Afternoon Slot (01:30 PM - 04:30 PM)</option>
                            <option value="evening">Evening Slot (05:00 PM - 08:30 PM)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Diagnostic triage */}
                    <div className="space-y-4 pt-4 border-t border-white/5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-teal font-mono border-b border-white/5 pb-2">3. Diagnostic Triage & Concerns</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-[11px] uppercase tracking-wider font-mono text-slate-400 mb-2 font-semibold">Active Pain Severity Level</label>
                          <div className="grid grid-cols-4 gap-2 text-xs">
                            {['none', 'mild', 'medium', 'severe'].map(level => (
                              <button
                                key={level}
                                type="button"
                                onClick={() => setWalkinForm({ ...walkinForm, painLevel: level })}
                                className={`py-2 px-2.5 rounded-lg border font-medium text-center uppercase tracking-wider transition-all cursor-pointer ${
                                  walkinForm.painLevel === level
                                    ? level === 'severe' ? 'bg-rose-500/20 border-rose-500 text-rose-400 font-extrabold' : 'bg-teal/20 border-teal text-teal font-bold'
                                    : 'bg-white/5 border-white/5 hover:border-white/10 text-slate-300'
                                }`}
                              >
                                {level}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-col justify-end">
                          <label className="flex items-center gap-3 bg-[#0B1F3A]/40 p-3 h-11 rounded-xl border border-white/5 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={walkinForm.hasPhobia}
                              onChange={(e) => setWalkinForm({ ...walkinForm, hasPhobia: e.target.checked })}
                              className="h-4 w-4 bg-slate-900 border-white/15 rounded text-teal"
                            />
                            <div className="text-xs text-slate-300">
                              <span className="font-semibold block text-slate-200">Patient Has Active Dental Phobia / Anxiety</span>
                              <span className="text-[10px] text-slate-500 block">Requires extra communication & soft anesthetic care</span>
                            </div>
                          </label>
                        </div>
                      </div>

                      <div className="pt-2">
                        <label className="block text-[11px] uppercase tracking-wider font-mono text-slate-400 mb-2 font-semibold">Trainee clinical comments or custom concern</label>
                        <textarea
                          rows={3}
                          value={walkinForm.message}
                          onChange={(e) => setWalkinForm({ ...walkinForm, message: e.target.value })}
                          placeholder="Note down structural complaints, special requests, patient physical conditions, orthodontic history logs..."
                          className="w-full bg-[#0B1F3A]/60 border border-white/5 rounded-xl p-4 text-xs text-white placeholder:text-slate-500 focus:outline-none transition-all resize-none"
                        ></textarea>
                      </div>
                    </div>

                    {/* Form actions */}
                    <div className="pt-4 border-t border-white/5 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setActiveTab('appointments')}
                        className="border border-white/10 hover:border-white/20 hover:bg-white/5 px-6 py-3 rounded-xl text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
                      >
                        Cancel registration
                      </button>
                      <button
                        type="submit"
                        className="bg-teal hover:bg-teal-light text-navy font-bold px-8 py-3 rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-teal/15 transition-all transform hover:-translate-y-0.5 cursor-pointer"
                      >
                        Register Patient Slot
                      </button>
                    </div>

                  </form>
                </div>
              )}

              {/* TAB 4: SYSTEM ADJUSTMENTS (SETTINGS) */}
              {activeTab === 'settings' && (
                <div className="max-w-2xl mx-auto animate-[fadeIn_0.3s_ease-out] space-y-8 text-left">
                  
                  {/* Title card settings */}
                  <div>
                    <h3 className="font-serif text-2xl font-bold text-white">Clinical adjustments & Systems</h3>
                    <p className="text-xs text-slate-400 mt-1">Direct configurations to fine-tune standard clinical parameters and database entries.</p>
                  </div>

                  {/* Section 1: Seed data and backups */}
                  <div className="bg-[#061324] border border-white/5 rounded-3xl p-6 md:p-8 space-y-6 relative overflow-hidden">
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-teal/5 rounded-full blur-2xl pointer-events-none"></div>

                    <div className="flex items-start gap-4">
                      <div className="bg-amber-500/10 p-3 rounded-2xl border border-amber-500/15 text-amber-500 flex-shrink-0">
                        <AlertTriangle size={24} />
                      </div>
                      <div>
                        <h4 className="font-serif text-base font-bold text-white">Database Restoration & Clinic Reset</h4>
                        <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                          Reset the clinical ledger back to pre-populated seed data files. Seeding injects patient registers matching several billing brackets to preview Recharts analytics instantly.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-3 border-t border-white/5 flex-wrap">
                      <button
                        onClick={handleRestoreBackup}
                        className="bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold py-3 px-5 border border-white/10 flex items-center gap-2 transition-all cursor-pointer"
                      >
                        <ListRestart size={15} className="text-teal" />
                        <span>Restore Dental Seed Backup</span>
                      </button>

                      <button
                        onClick={handleClearDatabase}
                        className="bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-navy rounded-xl text-xs font-bold py-3 px-5 border border-rose-500/15 flex items-center gap-2 transition-all cursor-pointer"
                      >
                        <Trash2 size={15} />
                        <span>Purge Clinic Registers</span>
                      </button>
                    </div>
                  </div>

                  {/* Section 2: Treatments pricing list */}
                  <div className="bg-[#061324] border border-white/5 rounded-3xl p-6 md:p-8 space-y-4">
                    <div className="text-left border-b border-white/5 pb-3">
                      <h4 className="font-serif text-base font-bold text-white">Clinical Treatment Catalog References</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Reference prices used during final billing completions of medical appointments.</p>
                    </div>

                    <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                      {Object.entries(TREATMENTS).map(([key, item]) => (
                        <div key={key} className="flex items-center justify-between border border-white/5 bg-navy-light/5 p-3.5 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-teal/10 border border-teal/20 text-teal rounded-lg font-bold">
                              {item.category[0]}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-white">{item.name}</p>
                              <p className="text-[10px] text-slate-500 tracking-wider uppercase font-mono mt-0.5">⏳ {item.duration} // {item.category}</p>
                            </div>
                          </div>
                          <div className="text-right font-mono text-emerald-400 text-sm font-bold">
                            ₹{item.price.toLocaleString('en-IN')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}
            </>
          )}

        </div>
      </main>

      {/* 1. RESCHEDULE DIALOG SLOT MODAL */}
      {apptToReschedule && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setApptToReschedule(null)}></div>
          <div className="bg-[#061324] border border-teal/15 rounded-3xl w-full max-w-md p-6 text-white shadow-2xl relative z-10 animate-[scaleUp_0.25s_ease-out] text-left">
            <button
              onClick={() => setApptToReschedule(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white bg-[#0B1F3A]/40 border border-white/5 p-1.5 rounded-lg cursor-pointer"
            >
              <X size={14} />
            </button>
            <div className="flex items-center gap-3 mb-5">
              <div className="bg-teal/10 p-2.5 rounded-xl border border-teal/20 text-teal">
                <CalendarDays size={20} />
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-widest font-mono text-teal block">scheduler desk</span>
                <h4 className="text-base font-serif font-bold text-white mt-0.5">Reschedule Clinical Slot</h4>
              </div>
            </div>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Moving appointment for <strong>{apptToReschedule.name}</strong> ({apptToReschedule.code}) to a direct approved timeline slot.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-300 mb-2">New Appointment Date</label>
                <input
                  type="date"
                  value={rescheduleDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full bg-[#0B1F3A]/60 border border-teal/15 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-teal"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-300 mb-2">Primary Time block select</label>
                <select
                  value={rescheduleSlot}
                  onChange={(e) => setRescheduleSlot(e.target.value)}
                  className="w-full bg-[#0B1F3A]/60 border border-teal/15 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none select-none"
                >
                  <option value="morning">Morning (09:30 AM - 12:30 PM)</option>
                  <option value="afternoon">Afternoon (01:30 PM - 04:30 PM)</option>
                  <option value="evening">Evening (05:00 PM - 08:30 PM)</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2 text-xs">
              <button
                onClick={() => setApptToReschedule(null)}
                className="bg-white/5 border border-white/5 hover:border-white/10 px-4 py-2.5 rounded-xl font-semibold text-slate-300 transition-colors cursor-pointer"
              >
                Go Back
              </button>
              <button
                onClick={submitReschedule}
                className="bg-teal hover:bg-teal-light text-navy font-bold px-5 py-2.5 rounded-xl uppercase tracking-wider cursor-pointer font-semibold"
              >
                Confirm rescheduling
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. REVISE COMPLETION & NOTES BILLING MODAL */}
      {apptToComplete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setApptToComplete(null)}></div>
          <div className="bg-[#061324] border border-teal/15 rounded-3xl w-full max-w-lg p-6 text-white shadow-2xl relative z-10 animate-[scaleUp_0.25s_ease-out] text-left">
            <button
              onClick={() => setApptToComplete(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white bg-[#0B1F3A]/40 border border-white/5 p-1.5 rounded-lg cursor-pointer"
            >
              <X size={14} />
            </button>
            <div className="flex items-center gap-3 mb-5">
              <div className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 text-emerald-400">
                <CheckCircle size={20} />
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-widest font-mono text-teal block">medical scribe desk</span>
                <h4 className="text-base font-serif font-bold text-white mt-0.5">Finalize Client Treatment</h4>
              </div>
            </div>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed bg-[#0B1F3A]/40 p-3 rounded-lg border border-white/5">
              Patient: <strong>{apptToComplete.name}</strong> ({apptToComplete.code}) <br />
              Requested: <span className="font-mono text-teal">{TREATMENTS[apptToComplete.service]?.name || apptToComplete.service}</span>
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-300 mb-2">Physician's clinical Remarks & Diagnosis Notes</label>
                <textarea
                  rows={4}
                  required
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="Note down tooth condition digits, procedures performed, scaling notes, medicine prescriptions and next revision appointments recommendations..."
                  className="w-full bg-[#0B1F3A]/60 border border-teal/15 rounded-xl p-3.5 text-xs text-white placeholder:text-slate-500 font-mono tracking-tight focus:outline-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-300 mb-2">Invoice closed Clinical Fee (INR)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-emerald-400 font-bold text-xs">
                    ₹
                  </span>
                  <input
                    type="number"
                    required
                    value={completionAmount}
                    onChange={(e) => setCompletionAmount(Number(e.target.value))}
                    className="w-full bg-[#0B1F3A]/60 border border-teal/15 rounded-xl pl-7 pr-3 py-2.5 text-xs font-mono text-emerald-400 focus:outline-none"
                  />
                </div>
                <p className="text-[9px] text-slate-500 font-mono mt-1 text-left">💡 Recommended default fee for this procedure is ₹{(TREATMENTS[apptToComplete.service]?.price || 1000).toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2 text-xs">
              <button
                onClick={() => setApptToComplete(null)}
                className="bg-white/5 border border-white/5 hover:border-white/10 px-4 py-2.5 rounded-xl font-semibold text-slate-300 transition-colors cursor-pointer"
              >
                Go Back
              </button>
              <button
                onClick={submitCompletion}
                className="bg-emerald-500 hover:bg-emerald-400 text-navy font-bold px-5 py-2.5 rounded-xl uppercase tracking-wider cursor-pointer font-semibold"
              >
                Finalize & Close invoice
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
