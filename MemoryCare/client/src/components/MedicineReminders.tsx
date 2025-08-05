import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pill, Clock, CheckCircle2, AlertCircle, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[] | null;
  notes: string | null;
  isActive: boolean | null;
}

interface MedicationLog {
  id: string;
  medicationId: string;
  scheduledTime: Date;
  status: string;
  takenAt: Date | null;
}

export function MedicineReminders() {
  const { toast } = useToast();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    dosage: "",
    frequency: "daily",
    times: [""],
    notes: ""
  });

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const { data: medications = [] } = useQuery<Medication[]>({
    queryKey: ["/api/medications"],
  });

  const { data: todayLogs = [] } = useQuery<MedicationLog[]>({
    queryKey: ["/api/medication-logs", { date: new Date().toISOString().split('T')[0] }],
  });

  const createMedicationMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/medications", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medications"] });
      setShowAddDialog(false);
      setFormData({
        name: "",
        dosage: "",
        frequency: "daily",
        times: [""],
        notes: ""
      });
      toast({
        title: "Success",
        description: "Medicine reminder added successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add medicine reminder",
        variant: "destructive"
      });
    }
  });

  const markAsTaken = async (medicationId: string, scheduledTime: string) => {
    try {
      await apiRequest("POST", "/api/medication-logs", {
        medicationId,
        scheduledTime: new Date(`${new Date().toDateString()} ${scheduledTime}`),
        status: "taken",
        takenAt: new Date()
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/medication-logs"] });
      
      toast({
        title: "Medicine taken",
        description: "Marked as taken successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark medicine as taken",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.dosage.trim()) {
      toast({
        title: "Error",
        description: "Please enter medicine name and dosage",
        variant: "destructive"
      });
      return;
    }

    const filteredTimes = formData.times.filter(time => time.trim() !== "");
    if (filteredTimes.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one reminder time",
        variant: "destructive"
      });
      return;
    }

    createMedicationMutation.mutate({
      name: formData.name,
      dosage: formData.dosage,
      frequency: formData.frequency,
      times: filteredTimes,
      notes: formData.notes,
      isActive: true
    });
  };

  const addTimeSlot = () => {
    setFormData(prev => ({
      ...prev,
      times: [...prev.times, ""]
    }));
  };

  const removeTimeSlot = (index: number) => {
    setFormData(prev => ({
      ...prev,
      times: prev.times.filter((_, i) => i !== index)
    }));
  };

  const updateTimeSlot = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      times: prev.times.map((time, i) => i === index ? value : time)
    }));
  };

  const getUpcomingMeds = () => {
    const upcoming: Array<{
      medication: Medication;
      time: string;
      status: 'due' | 'upcoming' | 'taken' | 'missed';
      scheduleTime: Date;
    }> = [];

    medications.forEach(med => {
      if (!med.isActive || !med.times) return;
      
      med.times.forEach(time => {
        const scheduleTime = new Date(`${new Date().toDateString()} ${time}`);
        const log = todayLogs.find(l => 
          l.medicationId === med.id && 
          new Date(l.scheduledTime).getTime() === scheduleTime.getTime()
        );
        
        let status: 'due' | 'upcoming' | 'taken' | 'missed' = 'upcoming';
        
        if (log) {
          status = log.status === 'taken' ? 'taken' : 'due';
        } else {
          const timeDiff = scheduleTime.getTime() - currentTime.getTime();
          if (timeDiff <= 0) {
            status = timeDiff > -3600000 ? 'due' : 'missed'; // 1 hour window
          }
        }
        
        upcoming.push({
          medication: med,
          time,
          status,
          scheduleTime
        });
      });
    });

    return upcoming.sort((a, b) => a.scheduleTime.getTime() - b.scheduleTime.getTime());
  };

  const upcomingMeds = getUpcomingMeds();
  const dueMeds = upcomingMeds.filter(m => m.status === 'due');
  const nextMeds = upcomingMeds.filter(m => m.status === 'upcoming').slice(0, 3);

  return (
    <div className="space-y-4">
      {/* Due Now */}
      {dueMeds.length > 0 && (
        <Card className="border border-red-200 bg-red-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center text-red-700">
              <AlertCircle className="w-5 h-5 mr-2" />
              Due Now
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dueMeds.map((med, index) => (
              <div key={`${med.medication.id}-${med.time}`} className="flex items-center justify-between p-4 bg-white rounded-xl border border-red-100">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-100 rounded-full">
                    <Pill className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{med.medication.name}</p>
                    <p className="text-sm text-gray-600">{med.medication.dosage}</p>
                    <p className="text-xs text-red-600 flex items-center mt-1">
                      <Clock className="w-3 h-3 mr-1" />
                      {med.time}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => markAsTaken(med.medication.id, med.time)}
                  className="bg-primary hover:bg-primary/90 text-white min-h-[40px] px-4 rounded-full"
                  data-testid={`button-take-medicine-${med.medication.id}-${index}`}
                >
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Take
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Upcoming */}
      <Card className="border border-amber-200 bg-white">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center text-gray-900">
              <Pill className="w-5 h-5 mr-2 text-primary" />
              Medicine Reminders
            </CardTitle>
            <Button
              size="sm"
              onClick={() => setShowAddDialog(true)}
              className="bg-apricot hover:bg-apricot-400 text-amber-900 font-semibold transition-all duration-300 min-h-[40px] px-3"
              data-testid="button-add-medicine"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {nextMeds.length === 0 ? (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
              <Pill className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No upcoming medicines</p>
            </div>
          ) : (
            nextMeds.map((med, index) => (
              <div key={`${med.medication.id}-${med.time}`} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Pill className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{med.medication.name}</p>
                    <p className="text-sm text-gray-600">{med.medication.dosage}</p>
                    <p className="text-xs text-gray-500 flex items-center mt-1">
                      <Clock className="w-3 h-3 mr-1" />
                      {med.time}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5">
                  {med.scheduleTime > currentTime ? 'Upcoming' : 'Due'}
                </Badge>
              </div>
            ))
          )}
          
          {medications.filter(m => m.isActive).length === 0 && (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
              <Pill className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No active medicines</p>
              <p className="text-xs mt-1">Add medicines in your profile</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600">
                {todayLogs.filter(l => l.status === 'taken').length}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Taken Today</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {medications.filter(m => m.isActive).length}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Active Meds</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Medicine Dialog */}
      <Dialog open={showAddDialog} onOpenChange={(open) => {
        if (!open) {
          setShowAddDialog(false);
          setFormData({
            name: "",
            dosage: "",
            frequency: "daily", 
            times: [""],
            notes: ""
          });
        }
      }}>
        <DialogContent className="sm:max-w-md bg-white border-amber-200">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-amber-900">
              Add Medicine Reminder
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="medicine-name" className="text-lg font-medium text-amber-900">
                Medicine Name *
              </Label>
              <Input
                id="medicine-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter medicine name"
                className="text-lg h-12 mt-2"
                data-testid="input-medicine-name"
              />
            </div>

            <div>
              <Label htmlFor="medicine-dosage" className="text-lg font-medium text-amber-900">
                Dosage *
              </Label>
              <Input
                id="medicine-dosage"
                value={formData.dosage}
                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                placeholder="e.g., 1 tablet, 5mg, 2 pills"
                className="text-lg h-12 mt-2"
                data-testid="input-medicine-dosage"
              />
            </div>

            <div>
              <Label htmlFor="medicine-frequency" className="text-lg font-medium text-amber-900">
                Frequency
              </Label>
              <Select value={formData.frequency} onValueChange={(value) => setFormData({ ...formData, frequency: value })}>
                <SelectTrigger id="medicine-frequency" className="text-lg h-12 mt-2" data-testid="select-medicine-frequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-amber-200">
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="twice-daily">Twice Daily</SelectItem>
                  <SelectItem value="three-times-daily">Three Times Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="as-needed">As Needed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-lg font-medium text-amber-900">
                Reminder Times *
              </Label>
              <div className="space-y-2 mt-2">
                {formData.times.map((time, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      type="time"
                      value={time}
                      onChange={(e) => updateTimeSlot(index, e.target.value)}
                      className="text-lg h-12 flex-1"
                      data-testid={`input-medicine-time-${index}`}
                    />
                    {formData.times.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeTimeSlot(index)}
                        className="min-h-[48px] min-w-[48px] p-0"
                        data-testid={`button-remove-time-${index}`}
                      >
                        ×
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addTimeSlot}
                  className="w-full min-h-[44px] text-lg border-dashed"
                  data-testid="button-add-time"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Another Time
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="medicine-notes" className="text-lg font-medium text-amber-900">
                Notes (Optional)
              </Label>
              <Input
                id="medicine-notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any special instructions"
                className="text-lg h-12 mt-2"
                data-testid="input-medicine-notes"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddDialog(false)}
                className="min-h-[44px] text-lg px-6"
                data-testid="button-cancel-medicine"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-apricot hover:bg-apricot-400 text-amber-900 min-h-[44px] text-lg px-6 transition-all duration-300"
                disabled={createMedicationMutation.isPending}
                data-testid="button-save-medicine"
              >
                {createMedicationMutation.isPending ? "Adding..." : "Add Medicine"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}