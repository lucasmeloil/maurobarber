'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, auth, firebaseConfig } from '@/lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged, getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { initializeApp, deleteApp } from "firebase/app";

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
  barberId?: string;
  barberName?: string;
  date: string;
  time: string;
  price: number;
  products?: { id: string; name: string; price: number; quantity: number }[];
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'noshow';
  viewed: boolean;
};

export type CustomRevenue = {
  id: string;
  description: string;
  value: number;
  date: string;
};

export type Expense = {
  id: string;
  description: string;
  value: number;
  date: string;
  category: string;
};

export type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
};

export type TeamMember = {
  id: string;
  name: string;
  role: 'barber' | 'admin' | 'client' | 'receptionist';
  phone?: string;
  email?: string;
  avatar?: string;
  uid?: string;
  commissionRate?: number;
};

interface AppContextType {
  services: Service[];
  appointments: Appointment[];
  products: Product[];
  customRevenues: CustomRevenue[]; 
  expenses: Expense[];
  team: TeamMember[];
  totalRevenue: number; 
  addTeamMember: (member: Omit<TeamMember, 'id'>, password?: string) => Promise<boolean>;
  updateTeamMember: (id: string, member: Omit<TeamMember, 'id'>) => Promise<boolean>;
  deleteTeamMember: (id: string) => Promise<boolean>;
  addAppointment: (appt: Omit<Appointment, 'id' | 'status' | 'viewed'>) => Promise<boolean>;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => void;
  updateAppointment: (id: string, data: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;
  markAsViewed: () => void;
  addService: (service: Omit<Service, 'id'>) => Promise<boolean>;
  updateService: (id: string, service:  Omit<Service, 'id'>) => Promise<boolean>;
  deleteService: (id: string) => Promise<boolean>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<boolean>;
  updateProduct: (id: string, product: Omit<Product, 'id'>) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
  addCustomRevenue: (revenue: Omit<CustomRevenue, 'id'>) => Promise<boolean>; 
  deleteCustomRevenue: (id: string) => Promise<boolean>;
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<boolean>;
  deleteExpense: (id: string) => Promise<boolean>;
  isSlotAvailable: (date: string, time: string, serviceId: string, barberId?: string, excludeAppointmentId?: string) => boolean;
  loadingAuth: boolean;
  currentUser: any;
  logout: () => Promise<void>;
  unreadNotifications: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);



export function AppProvider({ children }: { children: React.ReactNode }) {
  const [services, setServices] = useState<Service[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [customRevenues, setCustomRevenues] = useState<CustomRevenue[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await auth.signOut();
    localStorage.removeItem('isAdmin');
    setCurrentUser(null);
  };

  // Services Listener
  useEffect(() => {
    const q = query(collection(db, "services"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const svcs: Service[] = [];
      snapshot.forEach((doc) => {
        svcs.push({ id: doc.id, ...doc.data() } as Service);
      });
      console.log("Serviços carregados:", svcs.length);
      setServices(svcs);
    }, (error: any) => {
      console.error("Erro ao carregar serviços:", error);
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
      console.log("Agendamentos carregados:", appts.length);
      setAppointments(appts);
    }, (error: any) => {
      console.error("Erro ao carregar agendamentos:", error);
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

  // Expenses Listener
  useEffect(() => {
    const q = query(collection(db, "expenses"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const exps: Expense[] = [];
        snapshot.forEach((doc) => {
            exps.push({ id: doc.id, ...doc.data() } as Expense);
        });
        setExpenses(exps);
    });
    return () => unsubscribe();
  }, []);

  // Products Listener
  useEffect(() => {
    const q = query(collection(db, "products"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const prods: Product[] = [];
        snapshot.forEach((doc) => {
            prods.push({ id: doc.id, ...doc.data() } as Product);
        });
        setProducts(prods);
    });
    return () => unsubscribe();
  }, []);

  // Team Listener
  useEffect(() => {
    const q = query(collection(db, "team"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const members: TeamMember[] = [];
        snapshot.forEach((doc) => {
            members.push({ id: doc.id, ...doc.data() } as TeamMember);
        });
        console.log("Equipe carregada do Firebase:", members.length, members);
        setTeam(members);
    }, (error: any) => {
        console.error("Erro CRÍTICO ao carregar equipe:", error);
    });
    return () => unsubscribe();
  }, []);


  // Helpers
  const parseDuration = (durationStr: string): number => {
    if(!durationStr) return 30;
    const clean = durationStr.toLowerCase().replace(/\s/g, '');
    if(clean.includes('h') && !clean.includes('min')) {
         const h = parseInt(clean);
         return isNaN(h) ? 30 : h * 60;
    }
    const mins = parseInt(clean.replace(/\D/g, ''));
    return isNaN(mins) ? 30 : mins;
  };

  const timeToMinutes = (time: string): number => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };

  const getTotalDuration = (serviceIdsStr: string): number => {
      const ids = serviceIdsStr.split(',');
      let total = 0;
      ids.forEach(id => {
          const s = services.find(svc => svc.id === id.trim());
          total += s ? parseDuration(s.duration) : 30;
      });
      return total;
  };

  const isSlotAvailable = (date: string, time: string, serviceId: string, barberId?: string, excludeAppointmentId?: string) => {
    const newStart = timeToMinutes(time);
    const newDuration = getTotalDuration(serviceId);
    const newEnd = newStart + newDuration;

    return !appointments.some(a => {
        if (excludeAppointmentId && a.id === excludeAppointmentId) return false;
        if (a.date !== date) return false;
        if (a.status !== 'pending' && a.status !== 'confirmed') return false;
        
        // If checking for a specific barber, only consider appointments for that barber
        // If appointment has no barberId, assume it's a general appointment (affects everyone or specific logic)
        // For now, if we are checking for Barber X, we only care if Barber X is busy.
        if (barberId && a.barberId && a.barberId !== barberId) return false;

        const apptDuration = getTotalDuration(a.serviceId);
        const existingStart = timeToMinutes(a.time);
        const existingEnd = existingStart + apptDuration;

        // Check for overlap: StartA < EndB && EndA > StartB
        return (newStart < existingEnd && newEnd > existingStart);
    });
  };

  const addAppointment = async (appt: Omit<Appointment, 'id' | 'status' | 'viewed'>): Promise<boolean> => {
    // Note: We now pass serviceId to check collisions based on duration
    if (isSlotAvailable && !isSlotAvailable(appt.date, appt.time, appt.serviceId, appt.barberId)) {
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

  const addExpense = async (expense: Omit<Expense, 'id'>): Promise<boolean> => {
    try {
        await addDoc(collection(db, "expenses"), expense);
        return true;
    } catch (error) {
        console.error("Error adding expense:", error);
        return false;
    }
  };

  const deleteExpense = async (id: string): Promise<boolean> => {
    try {
        await deleteDoc(doc(db, "expenses", id));
        return true;
    } catch (error) {
        console.error("Error deleting expense:", error);
        return false;
    }
  };

  const addProduct = async (product: Omit<Product, 'id'>): Promise<boolean> => {
    try {
        await addDoc(collection(db, "products"), product);
        return true;
    } catch (error) {
        console.error("Error adding product:", error);
        return false;
    }
  };

  const updateProduct = async (id: string, updated: Omit<Product, 'id'>): Promise<boolean> => {
    try {
        const prodRef = doc(db, "products", id);
        await updateDoc(prodRef, updated);
        return true;
    } catch (error) {
        console.error("Error updating product:", error);
        return false;
    }
  };

  const deleteProduct = async (id: string): Promise<boolean> => {
    try {
        await deleteDoc(doc(db, "products", id));
        return true;
    } catch (error) {
        console.error("Error deleting product:", error);
        return false;
    }
  };

  const addTeamMember = async (member: Omit<TeamMember, 'id'>, password?: string): Promise<boolean> => {
    console.log("Iniciando cadastro de membro:", member.name, "Função:", member.role);
    try {
        let authUid = '';

        // If password is provided and it's a staff member, try to create an Auth User
        if (password && member.email && (member.role === 'admin' || member.role === 'barber')) {
            console.log("Tentando criar usuário no Firebase Auth...");
            // Initialize a secondary app to create user without logging out the admin
            const tempApp = initializeApp(firebaseConfig, "tempAppForCreation_" + Date.now());
            const tempAuth = getAuth(tempApp);
            
            try {
                const userCredential = await createUserWithEmailAndPassword(tempAuth, member.email, password);
                authUid = userCredential.user.uid;
                
                await updateProfile(userCredential.user, {
                   displayName: member.name
                });
                
                console.log("Usuário Auth criado com sucesso. UID:", authUid);
            } catch (authError: any) {
                console.error("Erro ao criar usuário no Auth:", authError);
                // Continue saving to firestore even if auth fails, or we can handle it
                // and return false if desired. Let's return false to be safe if auth was requested.
                await deleteApp(tempApp);
                return false; 
            }
            
            await deleteApp(tempApp);
        }

        console.log("Salvando membro no Firestore...");
        const docRef = await addDoc(collection(db, "team"), {
            ...member,
            uid: authUid,
            createdAt: new Date().toISOString()
        });
        console.log("Membro salvo no Firestore com ID:", docRef.id);
        return true;
    } catch (error) {
        console.error("Erro fatal ao adicionar membro da equipe:", error);
        return false;
    }
  };

  const updateTeamMember = async (id: string, member: Omit<TeamMember, 'id'>): Promise<boolean> => {
    try {
        const docRef = doc(db, "team", id);
        await updateDoc(docRef, member);
        return true;
    } catch (error) {
        console.error("Error updating team member:", error);
        return false;
    }
  };

  const deleteTeamMember = async (id: string): Promise<boolean> => {
    try {
        await deleteDoc(doc(db, "team", id));
        return true;
    } catch (error) {
        console.error("Error deleting team member:", error);
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
      expenses,
      team,
      totalRevenue,
      addTeamMember,
      updateTeamMember,
      deleteTeamMember,
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
      addExpense,
      deleteExpense,
      products,
      addProduct,
      updateProduct,
      deleteProduct,
      unreadNotifications,
      loadingAuth,
      currentUser,
      logout
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
