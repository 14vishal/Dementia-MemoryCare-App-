import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { insertMemorySchema, insertFamiliarFaceSchema, insertDailyTaskSchema, insertMedicationSchema, insertMedicationLogSchema, insertBehaviorLogSchema, insertContactSchema, insertCaregiverPatientSchema } from "@shared/schema";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { ObjectPermission } from "./objectAcl";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Object storage endpoints
  app.get("/objects/:objectPath(*)", isAuthenticated, async (req, res) => {
    const userId = req.user?.id;
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      const canAccess = await objectStorageService.canAccessObjectEntity({
        objectFile,
        userId: userId,
        requestedPermission: ObjectPermission.READ,
      });
      if (!canAccess) {
        return res.sendStatus(401);
      }
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error checking object access:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  app.post("/api/objects/upload", isAuthenticated, async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    const uploadURL = await objectStorageService.getObjectEntityUploadURL();
    res.json({ uploadURL });
  });

  // Memory routes
  app.get("/api/memories", isAuthenticated, async (req, res) => {
    try {
      const memories = await storage.getMemories(req.user!.id);
      res.json(memories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch memories" });
    }
  });

  app.post("/api/memories", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertMemorySchema.parse({ ...req.body, userId: req.user!.id });
      const memory = await storage.createMemory(validatedData);
      res.status(201).json(memory);
    } catch (error) {
      res.status(400).json({ error: "Invalid memory data" });
    }
  });

  app.put("/api/memories/:id", isAuthenticated, async (req, res) => {
    try {
      const memory = await storage.getMemory(req.params.id);
      if (!memory || memory.userId !== req.user!.id) {
        return res.status(404).json({ error: "Memory not found" });
      }
      const updated = await storage.updateMemory(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update memory" });
    }
  });

  app.delete("/api/memories/:id", isAuthenticated, async (req, res) => {
    try {
      const memory = await storage.getMemory(req.params.id);
      if (!memory || memory.userId !== req.user!.id) {
        return res.status(404).json({ error: "Memory not found" });
      }
      await storage.deleteMemory(req.params.id);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ error: "Failed to delete memory" });
    }
  });

  // Photo upload for memories
  app.put("/api/memories/:id/photos", isAuthenticated, async (req, res) => {
    if (!req.body.photoURL) {
      return res.status(400).json({ error: "photoURL is required" });
    }

    try {
      const memory = await storage.getMemory(req.params.id);
      if (!memory || memory.userId !== req.user!.id) {
        return res.status(404).json({ error: "Memory not found" });
      }

      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        req.body.photoURL,
        {
          owner: req.user!.id,
          visibility: "private",
        }
      );

      const currentPhotos = memory.photoUrls || [];
      const updatedMemory = await storage.updateMemory(req.params.id, {
        photoUrls: [...currentPhotos, objectPath]
      });

      res.json(updatedMemory);
    } catch (error) {
      console.error("Error adding photo to memory:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Familiar faces routes
  app.get("/api/familiar-faces", isAuthenticated, async (req, res) => {
    try {
      const faces = await storage.getFamiliarFaces(req.user!.id);
      res.json(faces);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch familiar faces" });
    }
  });

  app.post("/api/familiar-faces", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertFamiliarFaceSchema.parse({ ...req.body, userId: req.user!.id });
      const face = await storage.createFamiliarFace(validatedData);
      res.status(201).json(face);
    } catch (error) {
      res.status(400).json({ error: "Invalid familiar face data" });
    }
  });

  app.put("/api/familiar-faces/:id", isAuthenticated, async (req, res) => {
    try {
      const face = await storage.getFamiliarFace(req.params.id);
      if (!face || face.userId !== req.user!.id) {
        return res.status(404).json({ error: "Familiar face not found" });
      }
      const updated = await storage.updateFamiliarFace(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update familiar face" });
    }
  });

  app.delete("/api/familiar-faces/:id", isAuthenticated, async (req, res) => {
    try {
      const face = await storage.getFamiliarFace(req.params.id);
      if (!face || face.userId !== req.user!.id) {
        return res.status(404).json({ error: "Familiar face not found" });
      }
      await storage.deleteFamiliarFace(req.params.id);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ error: "Failed to delete familiar face" });
    }
  });

  // Photo upload for familiar faces
  app.put("/api/familiar-faces/:id/photo", isAuthenticated, async (req, res) => {
    if (!req.body.photoURL) {
      return res.status(400).json({ error: "photoURL is required" });
    }

    try {
      const face = await storage.getFamiliarFace(req.params.id);
      if (!face || face.userId !== req.user!.id) {
        return res.status(404).json({ error: "Familiar face not found" });
      }

      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        req.body.photoURL,
        {
          owner: req.user!.id,
          visibility: "private",
        }
      );

      const updated = await storage.updateFamiliarFace(req.params.id, {
        photoUrl: objectPath
      });

      res.json(updated);
    } catch (error) {
      console.error("Error setting familiar face photo:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Daily tasks routes
  app.get("/api/daily-tasks", isAuthenticated, async (req, res) => {
    try {
      const tasks = req.query.today === 'true' 
        ? await storage.getTodayTasks(req.user!.id)
        : await storage.getDailyTasks(req.user!.id);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch daily tasks" });
    }
  });

  app.post("/api/daily-tasks", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertDailyTaskSchema.parse({ ...req.body, userId: req.user!.id });
      const task = await storage.createDailyTask(validatedData);
      res.status(201).json(task);
    } catch (error) {
      res.status(400).json({ error: "Invalid daily task data" });
    }
  });

  app.put("/api/daily-tasks/:id", isAuthenticated, async (req, res) => {
    try {
      const task = await storage.getDailyTask(req.params.id);
      if (!task || task.userId !== req.user!.id) {
        return res.status(404).json({ error: "Daily task not found" });
      }
      const updated = await storage.updateDailyTask(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update daily task" });
    }
  });

  app.delete("/api/daily-tasks/:id", isAuthenticated, async (req, res) => {
    try {
      const task = await storage.getDailyTask(req.params.id);
      if (!task || task.userId !== req.user!.id) {
        return res.status(404).json({ error: "Daily task not found" });
      }
      await storage.deleteDailyTask(req.params.id);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ error: "Failed to delete daily task" });
    }
  });

  // Medication routes
  app.get("/api/medications", isAuthenticated, async (req, res) => {
    try {
      const medications = await storage.getMedications(req.user!.id);
      res.json(medications);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch medications" });
    }
  });

  app.post("/api/medications", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertMedicationSchema.parse({ ...req.body, userId: req.user!.id });
      const medication = await storage.createMedication(validatedData);
      res.status(201).json(medication);
    } catch (error) {
      res.status(400).json({ error: "Invalid medication data" });
    }
  });

  app.put("/api/medications/:id", isAuthenticated, async (req, res) => {
    try {
      const medication = await storage.getMedication(req.params.id);
      if (!medication || medication.userId !== req.user!.id) {
        return res.status(404).json({ error: "Medication not found" });
      }
      const updated = await storage.updateMedication(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update medication" });
    }
  });

  app.delete("/api/medications/:id", isAuthenticated, async (req, res) => {
    try {
      const medication = await storage.getMedication(req.params.id);
      if (!medication || medication.userId !== req.user!.id) {
        return res.status(404).json({ error: "Medication not found" });
      }
      await storage.deleteMedication(req.params.id);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ error: "Failed to delete medication" });
    }
  });

  // Medication logs routes
  app.get("/api/medication-logs", isAuthenticated, async (req, res) => {
    try {
      const date = req.query.date ? new Date(req.query.date as string) : undefined;
      const logs = await storage.getMedicationLogs(req.user!.id, date);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch medication logs" });
    }
  });

  app.post("/api/medication-logs", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertMedicationLogSchema.parse({ ...req.body, userId: req.user!.id });
      const log = await storage.createMedicationLog(validatedData);
      res.status(201).json(log);
    } catch (error) {
      res.status(400).json({ error: "Invalid medication log data" });
    }
  });

  app.put("/api/medication-logs/:id", isAuthenticated, async (req, res) => {
    try {
      const log = await storage.getMedicationLog(req.params.id);
      if (!log || log.userId !== req.user!.id) {
        return res.status(404).json({ error: "Medication log not found" });
      }
      const updated = await storage.updateMedicationLog(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update medication log" });
    }
  });

  // Behavior logs routes
  app.get("/api/behavior-logs", isAuthenticated, async (req, res) => {
    try {
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      const logs = await storage.getBehaviorLogs(req.user!.id, startDate, endDate);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch behavior logs" });
    }
  });

  app.post("/api/behavior-logs", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertBehaviorLogSchema.parse({ 
        ...req.body, 
        userId: req.user!.id,
        caregiverId: req.user!.role === 'caregiver' ? req.user!.id : undefined
      });
      const log = await storage.createBehaviorLog(validatedData);
      res.status(201).json(log);
    } catch (error) {
      res.status(400).json({ error: "Invalid behavior log data" });
    }
  });

  app.put("/api/behavior-logs/:id", isAuthenticated, async (req, res) => {
    try {
      const log = await storage.getBehaviorLog(req.params.id);
      if (!log || (log.userId !== req.user!.id && log.caregiverId !== req.user!.id)) {
        return res.status(404).json({ error: "Behavior log not found" });
      }
      const updated = await storage.updateBehaviorLog(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update behavior log" });
    }
  });

  // Contact routes
  app.get("/api/contacts", isAuthenticated, async (req, res) => {
    try {
      const contacts = req.query.emergency === 'true'
        ? await storage.getEmergencyContacts(req.user!.id)
        : await storage.getContacts(req.user!.id);
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch contacts" });
    }
  });

  app.post("/api/contacts", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertContactSchema.parse({ ...req.body, userId: req.user!.id });
      const contact = await storage.createContact(validatedData);
      res.status(201).json(contact);
    } catch (error) {
      res.status(400).json({ error: "Invalid contact data" });
    }
  });

  app.put("/api/contacts/:id", isAuthenticated, async (req, res) => {
    try {
      const contact = await storage.getContact(req.params.id);
      if (!contact || contact.userId !== req.user!.id) {
        return res.status(404).json({ error: "Contact not found" });
      }
      const updated = await storage.updateContact(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update contact" });
    }
  });

  app.delete("/api/contacts/:id", isAuthenticated, async (req, res) => {
    try {
      const contact = await storage.getContact(req.params.id);
      if (!contact || contact.userId !== req.user!.id) {
        return res.status(404).json({ error: "Contact not found" });
      }
      await storage.deleteContact(req.params.id);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ error: "Failed to delete contact" });
    }
  });

  // Photo upload for contacts
  app.put("/api/contacts/:id/photo", isAuthenticated, async (req, res) => {
    if (!req.body.photoURL) {
      return res.status(400).json({ error: "photoURL is required" });
    }

    try {
      const contact = await storage.getContact(req.params.id);
      if (!contact || contact.userId !== req.user!.id) {
        return res.status(404).json({ error: "Contact not found" });
      }

      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        req.body.photoURL,
        {
          owner: req.user!.id,
          visibility: "private",
        }
      );

      const updated = await storage.updateContact(req.params.id, {
        photoUrl: objectPath
      });

      res.json(updated);
    } catch (error) {
      console.error("Error setting contact photo:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Caregiver-patient relationship routes
  app.get("/api/caregiver/patients", isAuthenticated, async (req, res) => {
    try {
      if (req.user!.role !== 'caregiver') {
        return res.status(403).json({ error: "Access denied" });
      }
      const patients = await storage.getCaregiverPatients(req.user!.id);
      res.json(patients);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch patients" });
    }
  });

  app.get("/api/patient/caregivers", isAuthenticated, async (req, res) => {
    try {
      const caregivers = await storage.getPatientCaregivers(req.user!.id);
      res.json(caregivers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch caregivers" });
    }
  });

  app.post("/api/caregiver/patients", isAuthenticated, async (req, res) => {
    try {
      if (req.user!.role !== 'caregiver') {
        return res.status(403).json({ error: "Access denied" });
      }
      const validatedData = insertCaregiverPatientSchema.parse({ 
        ...req.body, 
        caregiverId: req.user!.id 
      });
      const relationship = await storage.addCaregiverPatient(validatedData);
      res.status(201).json(relationship);
    } catch (error) {
      res.status(400).json({ error: "Invalid relationship data" });
    }
  });

  app.delete("/api/caregiver/patients/:patientId", isAuthenticated, async (req, res) => {
    try {
      if (req.user!.role !== 'caregiver') {
        return res.status(403).json({ error: "Access denied" });
      }
      await storage.removeCaregiverPatient(req.user!.id, req.params.patientId);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ error: "Failed to remove patient relationship" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
