'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Service = {
  id: string;
  name: string;
  price: number;
  duration: string;
};

export type Appointment = {
  id: string;
  clientName: string;
  phone: string;
  serviceId: string;
  serviceName: string;
  date: string;
  time: string;
  price: number; // Added price field
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'noshow';
  viewed: boolean;
};

export type CustomRevenue = {
  id: string;
  description: string;
  value: number;
  date: string;
};

interface AppContextType {
  services: Service[];
  appointments: Appointment[];
  customRevenues: CustomRevenue[]; // Added custom revenues
  totalRevenue: number; // Added derived total revenue
  addAppointment: (appt: Omit<Appointment, 'id' | 'status' | 'viewed'>) => boolean;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => void;
  updateAppointment: (id: string, data: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;
  markAsViewed: () => void;
  addService: (service: Omit<Service, 'id'>) => void;
  updateService: (id: string, service:  Omit<Service, 'id'>) => void;
  deleteService: (id: string) => void;
  addCustomRevenue: (revenue: Omit<CustomRevenue, 'id'>) => void; // Function to add revenue
  deleteCustomRevenue: (id: string) => void;
  isSlotAvailable: (date: string, time: string) => boolean;
  unreadNotifications: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_SERVICES: Service[] = [];

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [services, setServices] = useState<Service[]>(INITIAL_SERVICES);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [customRevenues, setCustomRevenues] = useState<CustomRevenue[]>([]);

  // Carregar dados locais (simulação de persistência)
  useEffect(() => {
    const storedSvcs = localStorage.getItem('mauro_services');
    const storedAppts = localStorage.getItem('mauro_appointments');
    const storedRevenues = localStorage.getItem('mauro_revenues');
    
    if (storedSvcs) setServices(JSON.parse(storedSvcs));
    if (storedAppts) setAppointments(JSON.parse(storedAppts));
    if (storedRevenues) setCustomRevenues(JSON.parse(storedRevenues));
  }, []);

  // Sync across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'mauro_services') {
        setServices(e.newValue ? JSON.parse(e.newValue) : INITIAL_SERVICES);
      }
      if (e.key === 'mauro_appointments') {
        setAppointments(e.newValue ? JSON.parse(e.newValue) : []);
      }
      if (e.key === 'mauro_revenues') {
        setCustomRevenues(e.newValue ? JSON.parse(e.newValue) : []);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    localStorage.setItem('mauro_services', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem('mauro_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('mauro_revenues', JSON.stringify(customRevenues));
  }, [customRevenues]);

  const isSlotAvailable = (date: string, time: string) => {
    return !appointments.some(a => 
        a.date === date && 
        a.time === time && 
        (a.status === 'pending' || a.status === 'confirmed')
    );
  };

  const addAppointment = (appt: Omit<Appointment, 'id' | 'status' | 'viewed'>): boolean => {
    if (!isSlotAvailable(appt.date, appt.time)) {
        return false;
    }

    const newAppt: Appointment = {
      ...appt,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending',
      viewed: false
    };
    setAppointments(prev => [newAppt, ...prev]);
    return true;
  };

  const updateAppointmentStatus = (id: string, status: Appointment['status']) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  };

  const updateAppointment = (id: string, data: Partial<Appointment>) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, ...data } : a));
  };

  const deleteAppointment = (id: string) => {
    setAppointments(prev => prev.filter(a => a.id !== id));
  };  

  const markAsViewed = () => {
    setAppointments(prev => prev.map(a => ({ ...a, viewed: true })));
  };

  const addService = (service: Omit<Service, 'id'>) => {
    const newSvc = { ...service, id: Math.random().toString(36).substr(2, 9) };
    setServices(prev => [...prev, newSvc]);
  };

  const updateService = (id: string, updated: Omit<Service, 'id'>) => {
     setServices(prev => prev.map(s => s.id === id ? { ...updated, id } : s));
  };

  const deleteService = (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
  };

  const addCustomRevenue = (revenue: Omit<CustomRevenue, 'id'>) => {
    const newRev = { ...revenue, id: Math.random().toString(36).substr(2, 9) };
    setCustomRevenues(prev => [...prev, newRev]);
  };

  const deleteCustomRevenue = (id: string) => {
    setCustomRevenues(prev => prev.filter(r => r.id !== id));
  };

  const unreadNotifications = appointments.filter(a => !a.viewed && a.status === 'pending').length;

  const totalRevenue = 
    appointments
        .filter(a => a.status === 'completed')
        .reduce((acc, curr) => acc + (curr.price || 0), 0) + 
    customRevenues.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <AppContext.Provider value={{ 
      services, 
      appointments, 
      customRevenues,
      totalRevenue,
      addAppointment, 
      isSlotAvailable,
      updateAppointmentStatus, 
      updateAppointment,
      deleteAppointment,
      markAsViewed,
      addService, 
      updateService, 
      deleteService,
      addCustomRevenue,
      deleteCustomRevenue,
      unreadNotifications 
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
