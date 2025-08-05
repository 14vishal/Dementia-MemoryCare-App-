import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Navigation } from "@/components/Navigation";
import { EmergencyButton } from "@/components/EmergencyButton";
import { Calendar, Trash2, Check, Clock, CheckCircle2 } from "lucide-react";
import { DailyTask } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function DailyRoutinePage() {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<"today" | "all">("today");

  const { data: tasks = [], isLoading } = useQuery<DailyTask[]>({
    queryKey: ["/api/daily-tasks", { today: viewMode === "today" }],
  });



  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/daily-tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/daily-tasks"] });
      toast({
        title: "Success",
        description: "Task deleted successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive"
      });
    }
  });

  const toggleTaskMutation = useMutation({
    mutationFn: async ({ id, isCompleted }: { id: string; isCompleted: boolean }) => {
      const res = await apiRequest("PUT", `/api/daily-tasks/${id}`, {
        isCompleted,
        completedAt: isCompleted ? new Date().toISOString() : null
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/daily-tasks"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive"
      });
    }
  });



  const getTaskStatus = (task: DailyTask) => {
    if (task.isCompleted) return "completed";
    
    if (!task.scheduledTime) return "pending";
    
    const [hours, minutes] = task.scheduledTime.split(":").map(Number);
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);
    const currentTime = new Date();
    
    return currentTime >= scheduledTime ? "due" : "upcoming";
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      morning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      medication: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      evening: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      exercise: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      meals: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      other: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  const groupedTasks = tasks.reduce((acc, task) => {
    if (!acc[task.category]) {
      acc[task.category] = [];
    }
    acc[task.category].push(task);
    return acc;
  }, {} as Record<string, DailyTask[]>);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      <EmergencyButton />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <Calendar className="w-10 h-10 text-purple-500" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Daily Routine
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={viewMode} onValueChange={(value: "today" | "all") => setViewMode(value)}>
              <SelectTrigger className="w-40 min-h-[44px]" data-testid="select-view-mode">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today's Tasks</SelectItem>
                <SelectItem value="all">All Tasks</SelectItem>
              </SelectContent>
            </Select>

          </div>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[...Array(3)].map((_, j) => (
                      <div key={j} className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="w-24 h-24 mx-auto mb-6 text-gray-400" />
            <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-4">
              Create Your Daily Routine
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Having a structured routine can provide comfort and stability. 
              Add tasks for different parts of your day to stay organized.
            </p>
            <p className="text-lg text-gray-500 mt-4">
              Use the "Add" button in the Daily Routine sidebar to create your first task.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedTasks).map(([category, categoryTasks]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white capitalize flex items-center">
                    {category}
                    <span className={`ml-3 px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(category)}`}>
                      {categoryTasks.length} tasks
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categoryTasks
                      .sort((a, b) => (a.scheduledTime || "").localeCompare(b.scheduledTime || ""))
                      .map((task) => {
                        const status = getTaskStatus(task);
                        const statusColors = {
                          completed: "border-green-500 bg-green-50 dark:bg-green-900/20",
                          due: "border-red-500 bg-red-50 dark:bg-red-900/20",
                          upcoming: "border-gray-300 dark:border-gray-600",
                          pending: "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20"
                        };

                        return (
                          <div
                            key={task.id}
                            className={`flex items-center p-4 border-2 rounded-lg ${statusColors[status]}`}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleTaskMutation.mutate({
                                id: task.id,
                                isCompleted: !task.isCompleted
                              })}
                              className="mr-4 min-h-[44px] min-w-[44px]"
                              data-testid={`button-toggle-${task.id}`}
                            >
                              {task.isCompleted ? (
                                <CheckCircle2 className="w-8 h-8 text-green-500" />
                              ) : (
                                <div className="w-8 h-8 border-2 border-gray-300 dark:border-gray-600 rounded-full" />
                              )}
                            </Button>
                            
                            <div className="flex-1">
                              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                {task.title}
                              </h3>
                              {task.description && (
                                <p className="text-gray-600 dark:text-gray-300 mt-1">
                                  {task.description}
                                </p>
                              )}
                              <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
                                {task.scheduledTime && (
                                  <>
                                    <Clock className="w-4 h-4 mr-1" />
                                    <span>{task.scheduledTime}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteTaskMutation.mutate(task.id)}
                                className="min-h-[44px] min-w-[44px] text-red-500 hover:text-red-700"
                                data-testid={`button-delete-${task.id}`}
                              >
                                <Trash2 className="w-5 h-5" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
