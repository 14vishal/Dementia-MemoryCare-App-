import { type User, type InsertUser, type Memory, type InsertMemory, type FamiliarFace, type InsertFamiliarFace, type DailyTask, type InsertDailyTask, type Medication, type InsertMedication, type MedicationLog, type InsertMedicationLog, type BehaviorLog, type InsertBehaviorLog, type Contact, type InsertContact, type CaregiverPatient, type InsertCaregiverPatient } from "@shared/schema";
import { randomUUID } from "crypto";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;

  // Memory methods
  getMemories(userId: string): Promise<Memory[]>;
  getMemory(id: string): Promise<Memory | undefined>;
  createMemory(memory: InsertMemory): Promise<Memory>;
  updateMemory(id: string, updates: Partial<Memory>): Promise<Memory>;
  deleteMemory(id: string): Promise<void>;

  // Familiar faces methods
  getFamiliarFaces(userId: string): Promise<FamiliarFace[]>;
  getFamiliarFace(id: string): Promise<FamiliarFace | undefined>;
  createFamiliarFace(face: InsertFamiliarFace): Promise<FamiliarFace>;
  updateFamiliarFace(id: string, updates: Partial<FamiliarFace>): Promise<FamiliarFace>;
  deleteFamiliarFace(id: string): Promise<void>;

  // Daily tasks methods
  getDailyTasks(userId: string): Promise<DailyTask[]>;
  getTodayTasks(userId: string): Promise<DailyTask[]>;
  getDailyTask(id: string): Promise<DailyTask | undefined>;
  createDailyTask(task: InsertDailyTask): Promise<DailyTask>;
  updateDailyTask(id: string, updates: Partial<DailyTask>): Promise<DailyTask>;
  deleteDailyTask(id: string): Promise<void>;

  // Medication methods
  getMedications(userId: string): Promise<Medication[]>;
  getMedication(id: string): Promise<Medication | undefined>;
  createMedication(medication: InsertMedication): Promise<Medication>;
  updateMedication(id: string, updates: Partial<Medication>): Promise<Medication>;
  deleteMedication(id: string): Promise<void>;

  // Medication log methods
  getMedicationLogs(userId: string, date?: Date): Promise<MedicationLog[]>;
  getMedicationLog(id: string): Promise<MedicationLog | undefined>;
  createMedicationLog(log: InsertMedicationLog): Promise<MedicationLog>;
  updateMedicationLog(id: string, updates: Partial<MedicationLog>): Promise<MedicationLog>;

  // Behavior log methods
  getBehaviorLogs(userId: string, startDate?: Date, endDate?: Date): Promise<BehaviorLog[]>;
  getBehaviorLog(id: string): Promise<BehaviorLog | undefined>;
  createBehaviorLog(log: InsertBehaviorLog): Promise<BehaviorLog>;
  updateBehaviorLog(id: string, updates: Partial<BehaviorLog>): Promise<BehaviorLog>;

  // Contact methods
  getContacts(userId: string): Promise<Contact[]>;
  getEmergencyContacts(userId: string): Promise<Contact[]>;
  getContact(id: string): Promise<Contact | undefined>;
  createContact(contact: InsertContact): Promise<Contact>;
  updateContact(id: string, updates: Partial<Contact>): Promise<Contact>;
  deleteContact(id: string): Promise<void>;

  // Caregiver-patient relationship methods
  getCaregiverPatients(caregiverId: string): Promise<User[]>;
  getPatientCaregivers(patientId: string): Promise<User[]>;
  addCaregiverPatient(relationship: InsertCaregiverPatient): Promise<CaregiverPatient>;
  removeCaregiverPatient(caregiverId: string, patientId: string): Promise<void>;

  sessionStore: any;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private memories: Map<string, Memory>;
  private familiarFaces: Map<string, FamiliarFace>;
  private dailyTasks: Map<string, DailyTask>;
  private medications: Map<string, Medication>;
  private medicationLogs: Map<string, MedicationLog>;
  private behaviorLogs: Map<string, BehaviorLog>;
  private contacts: Map<string, Contact>;
  private caregiverPatients: Map<string, CaregiverPatient>;
  public sessionStore: any;

  constructor() {
    this.users = new Map();
    this.memories = new Map();
    this.familiarFaces = new Map();
    this.dailyTasks = new Map();
    this.medications = new Map();
    this.medicationLogs = new Map();
    this.behaviorLogs = new Map();
    this.contacts = new Map();
    this.caregiverPatients = new Map();
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  private async initializeSampleData() {
    // Create patient user
    const patientId = "patient-1";
    const patientUser: User = {
      id: patientId,
      username: "patient",
      password: "8fde3990ba480268f864bdad9707ce02c0632015607a33875dbf1d35bef96a17ce9a5d1b3c3cf9c889804ec4a819036c2a1087030ef5cb819a607686bba47421.ceaf0a3701d3261587a1fc5289b132e5", // password: demo
      email: "patient@demo.com",
      firstName: "Sarah",
      lastName: "Johnson",
      role: "patient",
      createdAt: new Date()
    };
    this.users.set(patientId, patientUser);

    // Create caregiver user
    const caregiverId = "caregiver-1";
    const caregiverUser: User = {
      id: caregiverId,
      username: "caregiver",
      password: "8fde3990ba480268f864bdad9707ce02c0632015607a33875dbf1d35bef96a17ce9a5d1b3c3cf9c889804ec4a819036c2a1087030ef5cb819a607686bba47421.ceaf0a3701d3261587a1fc5289b132e5", // password: demo
      email: "caregiver@demo.com",
      firstName: "Michael",
      lastName: "Smith",
      role: "caregiver",
      createdAt: new Date()
    };
    this.users.set(caregiverId, caregiverUser);

    // Add sample medications for patient
    const med1: Medication = {
      id: "med-1",
      userId: patientId,
      name: "Vitamin D",
      dosage: "1000 IU",
      frequency: "daily",
      times: ["09:00", "18:00"],
      notes: "Take with food",
      isActive: true,
      createdAt: new Date()
    };
    
    const med2: Medication = {
      id: "med-2",
      userId: patientId,
      name: "Blood Pressure",
      dosage: "10mg",
      frequency: "daily",
      times: ["08:00"],
      notes: "Take in the morning",
      isActive: true,
      createdAt: new Date()
    };

    this.medications.set("med-1", med1);
    this.medications.set("med-2", med2);

    // Add sample daily tasks
    const task1: DailyTask = {
      id: "task-1",
      userId: patientId,
      title: "Morning Exercise",
      description: "10 minute walk around the block",
      category: "exercise",
      scheduledTime: "07:00",
      isCompleted: false,
      createdAt: new Date()
    };

    const task2: DailyTask = {
      id: "task-2",
      userId: patientId,
      title: "Call Family",
      description: "Check in with daughter",
      category: "social",
      scheduledTime: "14:00",
      isCompleted: true,
      completedAt: new Date(),
      createdAt: new Date()
    };

    this.dailyTasks.set("task-1", task1);
    this.dailyTasks.set("task-2", task2);

    // Add emergency contacts
    const contact1: Contact = {
      id: "contact-1",
      userId: patientId,
      name: "Emily Johnson",
      relationship: "Daughter",
      phoneNumber: "(555) 123-4567",
      isEmergency: true,
      createdAt: new Date()
    };

    const contact2: Contact = {
      id: "contact-2",
      userId: patientId,
      name: "Dr. Williams",
      relationship: "Doctor",
      phoneNumber: "(555) 987-6543",
      isEmergency: true,
      createdAt: new Date()
    };

    this.contacts.set("contact-1", contact1);
    this.contacts.set("contact-2", contact2);

    // Add sample memory
    const memory1: Memory = {
      id: "memory-1",
      userId: patientId,
      title: "Beautiful Day at the Park",
      content: "Had a wonderful walk in the park today. The flowers were blooming and I saw some ducks by the pond.",
      photoUrls: null,
      audioUrl: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.memories.set("memory-1", memory1);
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    const updated = { ...user, ...updates };
    this.users.set(id, updated);
    return updated;
  }

  // Memory methods
  async getMemories(userId: string): Promise<Memory[]> {
    return Array.from(this.memories.values())
      .filter(memory => memory.userId === userId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getMemory(id: string): Promise<Memory | undefined> {
    return this.memories.get(id);
  }

  async createMemory(insertMemory: InsertMemory): Promise<Memory> {
    const id = randomUUID();
    const memory: Memory = {
      ...insertMemory,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      audioUrl: insertMemory.audioUrl || null,
      photoUrls: insertMemory.photoUrls || null,
      content: insertMemory.content || null
    };
    this.memories.set(id, memory);
    return memory;
  }

  async updateMemory(id: string, updates: Partial<Memory>): Promise<Memory> {
    const memory = this.memories.get(id);
    if (!memory) throw new Error("Memory not found");
    const updated = { ...memory, ...updates, updatedAt: new Date() };
    this.memories.set(id, updated);
    return updated;
  }

  async deleteMemory(id: string): Promise<void> {
    this.memories.delete(id);
  }

  // Familiar faces methods
  async getFamiliarFaces(userId: string): Promise<FamiliarFace[]> {
    return Array.from(this.familiarFaces.values())
      .filter(face => face.userId === userId)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async getFamiliarFace(id: string): Promise<FamiliarFace | undefined> {
    return this.familiarFaces.get(id);
  }

  async createFamiliarFace(insertFace: InsertFamiliarFace): Promise<FamiliarFace> {
    const id = randomUUID();
    const face: FamiliarFace = {
      ...insertFace,
      id,
      createdAt: new Date()
    };
    this.familiarFaces.set(id, face);
    return face;
  }

  async updateFamiliarFace(id: string, updates: Partial<FamiliarFace>): Promise<FamiliarFace> {
    const face = this.familiarFaces.get(id);
    if (!face) throw new Error("Familiar face not found");
    const updated = { ...face, ...updates };
    this.familiarFaces.set(id, updated);
    return updated;
  }

  async deleteFamiliarFace(id: string): Promise<void> {
    this.familiarFaces.delete(id);
  }

  // Daily tasks methods
  async getDailyTasks(userId: string): Promise<DailyTask[]> {
    return Array.from(this.dailyTasks.values())
      .filter(task => task.userId === userId)
      .sort((a, b) => (a.scheduledTime || "").localeCompare(b.scheduledTime || ""));
  }

  async getTodayTasks(userId: string): Promise<DailyTask[]> {
    const today = new Date().toDateString();
    return Array.from(this.dailyTasks.values())
      .filter(task => 
        task.userId === userId && 
        (!task.completedAt || new Date(task.completedAt).toDateString() === today)
      )
      .sort((a, b) => (a.scheduledTime || "").localeCompare(b.scheduledTime || ""));
  }

  async getDailyTask(id: string): Promise<DailyTask | undefined> {
    return this.dailyTasks.get(id);
  }

  async createDailyTask(insertTask: InsertDailyTask): Promise<DailyTask> {
    const id = randomUUID();
    const task: DailyTask = {
      ...insertTask,
      id,
      createdAt: new Date()
    };
    this.dailyTasks.set(id, task);
    return task;
  }

  async updateDailyTask(id: string, updates: Partial<DailyTask>): Promise<DailyTask> {
    const task = this.dailyTasks.get(id);
    if (!task) throw new Error("Daily task not found");
    const updated = { ...task, ...updates };
    this.dailyTasks.set(id, updated);
    return updated;
  }

  async deleteDailyTask(id: string): Promise<void> {
    this.dailyTasks.delete(id);
  }

  // Medication methods
  async getMedications(userId: string): Promise<Medication[]> {
    return Array.from(this.medications.values())
      .filter(med => med.userId === userId && med.isActive)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async getMedication(id: string): Promise<Medication | undefined> {
    return this.medications.get(id);
  }

  async createMedication(insertMedication: InsertMedication): Promise<Medication> {
    const id = randomUUID();
    const medication: Medication = {
      ...insertMedication,
      id,
      createdAt: new Date()
    };
    this.medications.set(id, medication);
    return medication;
  }

  async updateMedication(id: string, updates: Partial<Medication>): Promise<Medication> {
    const medication = this.medications.get(id);
    if (!medication) throw new Error("Medication not found");
    const updated = { ...medication, ...updates };
    this.medications.set(id, updated);
    return updated;
  }

  async deleteMedication(id: string): Promise<void> {
    const medication = this.medications.get(id);
    if (medication) {
      const updated = { ...medication, isActive: false };
      this.medications.set(id, updated);
    }
  }

  // Medication log methods
  async getMedicationLogs(userId: string, date?: Date): Promise<MedicationLog[]> {
    let logs = Array.from(this.medicationLogs.values())
      .filter(log => log.userId === userId);
    
    if (date) {
      const targetDate = date.toDateString();
      logs = logs.filter(log => 
        new Date(log.scheduledTime).toDateString() === targetDate
      );
    }
    
    return logs.sort((a, b) => 
      new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()
    );
  }

  async getMedicationLog(id: string): Promise<MedicationLog | undefined> {
    return this.medicationLogs.get(id);
  }

  async createMedicationLog(insertLog: InsertMedicationLog): Promise<MedicationLog> {
    const id = randomUUID();
    const log: MedicationLog = {
      ...insertLog,
      id,
      createdAt: new Date()
    };
    this.medicationLogs.set(id, log);
    return log;
  }

  async updateMedicationLog(id: string, updates: Partial<MedicationLog>): Promise<MedicationLog> {
    const log = this.medicationLogs.get(id);
    if (!log) throw new Error("Medication log not found");
    const updated = { ...log, ...updates };
    this.medicationLogs.set(id, updated);
    return updated;
  }

  // Behavior log methods
  async getBehaviorLogs(userId: string, startDate?: Date, endDate?: Date): Promise<BehaviorLog[]> {
    let logs = Array.from(this.behaviorLogs.values())
      .filter(log => log.userId === userId);
    
    if (startDate && endDate) {
      logs = logs.filter(log => {
        const logDate = new Date(log.date);
        return logDate >= startDate && logDate <= endDate;
      });
    }
    
    return logs.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  async getBehaviorLog(id: string): Promise<BehaviorLog | undefined> {
    return this.behaviorLogs.get(id);
  }

  async createBehaviorLog(insertLog: InsertBehaviorLog): Promise<BehaviorLog> {
    const id = randomUUID();
    const log: BehaviorLog = {
      ...insertLog,
      id,
      createdAt: new Date()
    };
    this.behaviorLogs.set(id, log);
    return log;
  }

  async updateBehaviorLog(id: string, updates: Partial<BehaviorLog>): Promise<BehaviorLog> {
    const log = this.behaviorLogs.get(id);
    if (!log) throw new Error("Behavior log not found");
    const updated = { ...log, ...updates };
    this.behaviorLogs.set(id, updated);
    return updated;
  }

  // Contact methods
  async getContacts(userId: string): Promise<Contact[]> {
    return Array.from(this.contacts.values())
      .filter(contact => contact.userId === userId)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async getEmergencyContacts(userId: string): Promise<Contact[]> {
    return Array.from(this.contacts.values())
      .filter(contact => contact.userId === userId && contact.isEmergency)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async getContact(id: string): Promise<Contact | undefined> {
    return this.contacts.get(id);
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const id = randomUUID();
    const contact: Contact = {
      ...insertContact,
      id,
      createdAt: new Date()
    };
    this.contacts.set(id, contact);
    return contact;
  }

  async updateContact(id: string, updates: Partial<Contact>): Promise<Contact> {
    const contact = this.contacts.get(id);
    if (!contact) throw new Error("Contact not found");
    const updated = { ...contact, ...updates };
    this.contacts.set(id, updated);
    return updated;
  }

  async deleteContact(id: string): Promise<void> {
    this.contacts.delete(id);
  }

  // Caregiver-patient relationship methods
  async getCaregiverPatients(caregiverId: string): Promise<User[]> {
    const relationships = Array.from(this.caregiverPatients.values())
      .filter(rel => rel.caregiverId === caregiverId);
    
    const patients: User[] = [];
    for (const rel of relationships) {
      const patient = await this.getUser(rel.patientId);
      if (patient) patients.push(patient);
    }
    return patients;
  }

  async getPatientCaregivers(patientId: string): Promise<User[]> {
    const relationships = Array.from(this.caregiverPatients.values())
      .filter(rel => rel.patientId === patientId);
    
    const caregivers: User[] = [];
    for (const rel of relationships) {
      const caregiver = await this.getUser(rel.caregiverId);
      if (caregiver) caregivers.push(caregiver);
    }
    return caregivers;
  }

  async addCaregiverPatient(insertRelationship: InsertCaregiverPatient): Promise<CaregiverPatient> {
    const id = randomUUID();
    const relationship: CaregiverPatient = {
      ...insertRelationship,
      id,
      createdAt: new Date()
    };
    this.caregiverPatients.set(id, relationship);
    return relationship;
  }

  async removeCaregiverPatient(caregiverId: string, patientId: string): Promise<void> {
    for (const [id, rel] of this.caregiverPatients) {
      if (rel.caregiverId === caregiverId && rel.patientId === patientId) {
        this.caregiverPatients.delete(id);
        break;
      }
    }
  }
}

export const storage = new MemStorage();
