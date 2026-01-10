'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

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
  addAppointment: (appt: Omit<Appointment, 'id' | 'status' | 'viewed'>) => Promise<boolean>;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => void;
  updateAppointment: (id: string, data: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;
  markAsViewed: () => void;
  addService: (service: Omit<Service, 'id'>) => Promise<boolean>;
  updateService: (id: string, service:  Omit<Service, 'id'>) => Promise<boolean>;
  deleteService: (id: string) => Promise<boolean>;
  addCustomRevenue: (revenue: Omit<CustomRevenue, 'id'>) => Promise<boolean>; // Function to add revenue
  deleteCustomRevenue: (id: string) => Promise<boolean>;
  isSlotAvailable: (date: string, time: string) => boolean;
  unreadNotifications: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);



export function AppProvider({ children }: { children: React.ReactNode }) {
  const [services, setServices] = useState<Service[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [customRevenues, setCustomRevenues] = useState<CustomRevenue[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Services Listener
  useEffect(() => {
    const q = query(collection(db, "services"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const svcs: Service[] = [];
      snapshot.forEach((doc) => {
        svcs.push({ id: doc.id, ...doc.data() } as Service);
      });
      setServices(svcs);
    });
    return () => unsubscribe();
  }, []);

  // Appointments Listener
  useEffect(() => {
    const q = query(collection(db, "appointments"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const appts: Appointment[] = [];
      snapshot.forEach((doc) => {
        appts.push({ id: doc.id, ...doc.data() } as Appointment);
      });
      setAppointments(appts);
    });
    return () => unsubscribe();
  }, []);

  // Custom Revenues Listener
  useEffect(() => {
    const q = query(collection(db, "customRevenues"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const revs: CustomRevenue[] = [];
        snapshot.forEach((doc) => {
            revs.push({ id: doc.id, ...doc.data() } as CustomRevenue);
        });
        setCustomRevenues(revs);
    });
    return () => unsubscribe();
  }, []);


  const isSlotAvailable = (date: string, time: string) => {
    return !appointments.some(a => 
        a.date === date && 
        a.time === time && 
        (a.status === 'pending' || a.status === 'confirmed')
    );
  };

  const addAppointment = async (appt: Omit<Appointment, 'id' | 'status' | 'viewed'>): Promise<boolean> => {
    if (!isSlotAvailable(appt.date, appt.time)) {
        return false;
    }

    try {
        await addDoc(collection(db, "appointments"), {
            ...appt,
            status: 'pending',
            viewed: false
        });
        return true;
    } catch (e) {
        console.error("Error adding appointment: ", e);
        return false;
    }
  };

  const updateAppointmentStatus = async (id: string, status: Appointment['status']) => {
    const apptRef = doc(db, "appointments", id);
    await updateDoc(apptRef, { status });
  };

  const updateAppointment = async (id: string, data: Partial<Appointment>) => {
    const apptRef = doc(db, "appointments", id);
    await updateDoc(apptRef, data);
  };

  const deleteAppointment = async (id: string) => {
    await deleteDoc(doc(db, "appointments", id));
  };  

  const markAsViewed = async () => {
    // Only mark pending appointments as viewed
    const pendingUnviewed = appointments.filter(a => !a.viewed && a.status === 'pending');
    pendingUnviewed.forEach(async (a) => {
        const apptRef = doc(db, "appointments", a.id);
        await updateDoc(apptRef, { viewed: true });
    });
  };

  const addService = async (service: Omit<Service, 'id'>): Promise<boolean> => {
    try {
        await addDoc(collection(db, "services"), service);
        return true;
    } catch (error) {
        console.error("Error adding service:", error);
        return false;
    }
  };

  const updateService = async (id: string, updated: Omit<Service, 'id'>): Promise<boolean> => {
    try {
        const svcRef = doc(db, "services", id);
        await updateDoc(svcRef, updated);
        return true;
    } catch (error) {
        console.error("Error updating service:", error);
        return false;
    }
  };

  const deleteService = async (id: string): Promise<boolean> => {
    try {
        await deleteDoc(doc(db, "services", id));
        return true;
    } catch (error) {
        console.error("Error deleting service:", error);
        return false;
    }
  };

  const addCustomRevenue = async (revenue: Omit<CustomRevenue, 'id'>): Promise<boolean> => {
    try {
        await addDoc(collection(db, "customRevenues"), revenue);
        return true;
    } catch (error) {
        console.error("Error adding revenue:", error);
        return false;
    }
  };

  const deleteCustomRevenue = async (id: string): Promise<boolean> => {
    try {
        await deleteDoc(doc(db, "customRevenues", id));
        return true;
    } catch (error) {
        console.error("Error deleting revenue:", error);
        return false;
    }
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
