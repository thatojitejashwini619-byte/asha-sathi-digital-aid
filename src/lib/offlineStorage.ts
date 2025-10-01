// Offline-first storage utilities using localStorage

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  address: string;
  createdAt: string;
  synced: boolean;
  latitude?: number;
  longitude?: number;
}

export interface Visit {
  id: string;
  patientId: string;
  date: string;
  notes: string;
  vitals?: {
    weight?: number;
    temperature?: number;
    bloodPressure?: string;
  };
  synced: boolean;
  latitude?: number;
  longitude?: number;
}

const STORAGE_KEYS = {
  PATIENTS: 'ashasathi_patients',
  VISITS: 'ashasathi_visits',
  USER: 'ashasathi_user',
};

export const offlineStorage = {
  // Patient operations
  getPatients: (): Patient[] => {
    const data = localStorage.getItem(STORAGE_KEYS.PATIENTS);
    return data ? JSON.parse(data) : [];
  },

  savePatient: (patient: Patient) => {
    const patients = offlineStorage.getPatients();
    const existing = patients.findIndex(p => p.id === patient.id);
    if (existing >= 0) {
      patients[existing] = patient;
    } else {
      patients.push(patient);
    }
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
  },

  // Visit operations
  getVisits: (): Visit[] => {
    const data = localStorage.getItem(STORAGE_KEYS.VISITS);
    return data ? JSON.parse(data) : [];
  },

  saveVisit: (visit: Visit) => {
    const visits = offlineStorage.getVisits();
    visits.push(visit);
    localStorage.setItem(STORAGE_KEYS.VISITS, JSON.stringify(visits));
  },

  // Get unsynced data
  getUnsyncedPatients: (): Patient[] => {
    return offlineStorage.getPatients().filter(p => !p.synced);
  },

  getUnsyncedVisits: (): Visit[] => {
    return offlineStorage.getVisits().filter(v => !v.synced);
  },

  // Mark as synced
  markPatientSynced: (id: string) => {
    const patients = offlineStorage.getPatients();
    const patient = patients.find(p => p.id === id);
    if (patient) {
      patient.synced = true;
      localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
    }
  },

  markVisitSynced: (id: string) => {
    const visits = offlineStorage.getVisits();
    const visit = visits.find(v => v.id === id);
    if (visit) {
      visit.synced = true;
      localStorage.setItem(STORAGE_KEYS.VISITS, JSON.stringify(visits));
    }
  },

  // Clear all data
  clearAll: () => {
    localStorage.removeItem(STORAGE_KEYS.PATIENTS);
    localStorage.removeItem(STORAGE_KEYS.VISITS);
  },
};
