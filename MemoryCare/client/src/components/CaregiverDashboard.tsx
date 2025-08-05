import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Smile, Bed, Pill, Activity, Plus } from "lucide-react";
import { BehaviorLog, Medication, MedicationLog, User } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function CaregiverDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [behaviorFormData, setBehaviorFormData] = useState({
    mood: "",
    sleepHours: "",
    appetite: "",
    activityLevel: "",
    notes: ""
  });

  const { data: patients = [] } = useQuery<User[]>({
    queryKey: ["/api/caregiver/patients"],
  });

  const { data: recentBehaviorLogs = [] } = useQuery<BehaviorLog[]>({
    queryKey: ["/api/behavior-logs"],
    enabled: patients.length > 0,
  });

  const { data: medications = [] } = useQuery<Medication[]>({
    queryKey: ["/api/medications"],
    enabled: patients.length > 0,
  });

  const { data: medicationLogs = [] } = useQuery<MedicationLog[]>({
    queryKey: ["/api/medication-logs", { date: new Date().toISOString().split('T')[0] }],
    enabled: patients.length > 0,
  });

  const createBehaviorLogMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/behavior-logs", {
        ...data,
        date: new Date().toISOString(),
        userId: patients[0]?.id // Assuming single patient for now
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/behavior-logs"] });
      setBehaviorFormData({
        mood: "",
        sleepHours: "",
        appetite: "",
        activityLevel: "",
        notes: ""
      });
      toast({
        title: "Success",
        description: "Behavior log entry saved successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save behavior log entry",
        variant: "destructive"
      });
    }
  });

  const handleBehaviorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!behaviorFormData.mood) {
      toast({
        title: "Error",
        description: "Please select a mood",
        variant: "destructive"
      });
      return;
    }
    createBehaviorLogMutation.mutate(behaviorFormData);
  };

  // Calculate overview stats
  const latestLog = recentBehaviorLogs[0];
  const todayMedications = medicationLogs.filter(log => 
    new Date(log.scheduledTime).toDateString() === new Date().toDateString()
  );
  const takenMedications = todayMedications.filter(log => log.status === "taken").length;
  const totalMedications = todayMedications.length;

  if (patients.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Caregiver Dashboard
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          No patients assigned yet. Please contact an administrator to assign patients to your care.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Caregiver Dashboard
        </h2>
        <p className="text-2xl text-gray-600 dark:text-gray-300">
          Managing care for {patients.map(p => p.firstName).join(", ")}
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg text-gray-600 dark:text-gray-300">Mood Today</p>
                <p className="text-3xl font-bold text-green-600 capitalize">
                  {latestLog?.mood || "Not recorded"}
                </p>
              </div>
              <Smile className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg text-gray-600 dark:text-gray-300">Sleep Quality</p>
                <p className="text-3xl font-bold text-blue-600">
                  {latestLog?.sleepHours ? `${latestLog.sleepHours} hrs` : "Not recorded"}
                </p>
              </div>
              <Bed className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg text-gray-600 dark:text-gray-300">Medications</p>
                <p className="text-3xl font-bold text-purple-600">
                  {totalMedications > 0 ? `${takenMedications}/${totalMedications}` : "0/0"}
                </p>
              </div>
              <Pill className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg text-gray-600 dark:text-gray-300">Activity Level</p>
                <p className="text-3xl font-bold text-orange-600 capitalize">
                  {latestLog?.activityLevel || "Not recorded"}
                </p>
              </div>
              <Activity className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Behavior Log Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center justify-between">
              Behavior Log
              <Button 
                variant="outline" 
                size="sm"
                data-testid="button-view-all-logs"
              >
                View All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBehaviorSubmit} className="space-y-4">
              <div>
                <Label htmlFor="mood-select" className="text-lg font-medium">
                  Mood
                </Label>
                <Select
                  value={behaviorFormData.mood}
                  onValueChange={(value) => setBehaviorFormData({ ...behaviorFormData, mood: value })}
                >
                  <SelectTrigger className="min-h-[44px] text-lg" data-testid="select-mood">
                    <SelectValue placeholder="Select mood" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="happy">Happy</SelectItem>
                    <SelectItem value="calm">Calm</SelectItem>
                    <SelectItem value="confused">Confused</SelectItem>
                    <SelectItem value="agitated">Agitated</SelectItem>
                    <SelectItem value="sad">Sad</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="sleep-hours" className="text-lg font-medium">
                  Sleep Hours
                </Label>
                <Input
                  id="sleep-hours"
                  type="number"
                  min="0"
                  max="24"
                  step="0.5"
                  value={behaviorFormData.sleepHours}
                  onChange={(e) => setBehaviorFormData({ ...behaviorFormData, sleepHours: e.target.value })}
                  className="min-h-[44px] text-lg"
                  placeholder="Hours of sleep"
                  data-testid="input-sleep-hours"
                />
              </div>

              <div>
                <Label htmlFor="appetite" className="text-lg font-medium">
                  Appetite
                </Label>
                <Select
                  value={behaviorFormData.appetite}
                  onValueChange={(value) => setBehaviorFormData({ ...behaviorFormData, appetite: value })}
                >
                  <SelectTrigger className="min-h-[44px] text-lg" data-testid="select-appetite">
                    <SelectValue placeholder="Select appetite" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="activity-level" className="text-lg font-medium">
                  Activity Level
                </Label>
                <Select
                  value={behaviorFormData.activityLevel}
                  onValueChange={(value) => setBehaviorFormData({ ...behaviorFormData, activityLevel: value })}
                >
                  <SelectTrigger className="min-h-[44px] text-lg" data-testid="select-activity-level">
                    <SelectValue placeholder="Select activity level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes" className="text-lg font-medium">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  value={behaviorFormData.notes}
                  onChange={(e) => setBehaviorFormData({ ...behaviorFormData, notes: e.target.value })}
                  placeholder="Additional observations..."
                  className="min-h-[88px] text-lg"
                  data-testid="textarea-notes"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold text-lg py-3 min-h-[44px]"
                disabled={createBehaviorLogMutation.isPending}
                data-testid="button-save-behavior-log"
              >
                {createBehaviorLogMutation.isPending ? "Saving..." : "Save Entry"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Medication Manager */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center justify-between">
              Medication Schedule
              <Button 
                variant="outline" 
                size="sm"
                data-testid="button-add-medication"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Med
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {medications.length === 0 ? (
                <div className="text-center py-8">
                  <Pill className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
                    No medications scheduled
                  </p>
                  <Button variant="outline" data-testid="button-add-first-medication">
                    Add First Medication
                  </Button>
                </div>
              ) : (
                medications.slice(0, 3).map((medication) => {
                  const todayLog = todayMedications.find(log => log.medicationId === medication.id);
                  const status = todayLog?.status || "pending";
                  const statusColors = {
                    taken: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
                    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
                    missed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  };
                  const statusLabels = {
                    taken: "Taken",
                    pending: "Due Soon",
                    missed: "Missed"
                  };

                  return (
                    <div
                      key={medication.id}
                      className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {medication.name}
                          </h4>
                          <p className="text-lg text-gray-600 dark:text-gray-300">
                            {medication.dosage} - {medication.frequency}
                          </p>
                        </div>
                        <span className={`text-sm font-medium px-3 py-1 rounded-full ${statusColors[status as keyof typeof statusColors]}`}>
                          {statusLabels[status as keyof typeof statusLabels]}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300">
                        Next dose: {medication.times && medication.times.length > 0 
                          ? `Today ${medication.times[0]}` 
                          : "No time set"}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Charts Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Weekly Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Mood Trends
              </h4>
              <div className="h-32 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">Chart visualization coming soon</p>
              </div>
            </div>
            <div className="text-center">
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Sleep Pattern
              </h4>
              <div className="h-32 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">Chart visualization coming soon</p>
              </div>
            </div>
            <div className="text-center">
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Medication Adherence
              </h4>
              <div className="h-32 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">Chart visualization coming soon</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
