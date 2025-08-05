import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Clock, Calendar, Plus } from "lucide-react";
import { DailyTask } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function DailyRoutineSidebar() {
  const { toast } = useToast();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    scheduledTime: ""
  });
  
  const { data: tasks = [] } = useQuery<DailyTask[]>({
    queryKey: ["/api/daily-tasks", { date: new Date() }],
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/daily-tasks", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/daily-tasks"] });
      setShowAddDialog(false);
      setFormData({
        title: "",
        description: "",
        category: "",
        scheduledTime: ""
      });
      toast({
        title: "Success",
        description: "Task added successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add task",
        variant: "destructive"
      });
    }
  });

  const markAsComplete = async (taskId: string) => {
    try {
      await apiRequest("PATCH", `/api/daily-tasks/${taskId}`, {
        isCompleted: true,
        completedAt: new Date()
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/daily-tasks"] });
      
      toast({
        title: "Task completed",
        description: "Great job completing this task!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark task as complete",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a task title",
        variant: "destructive"
      });
      return;
    }

    createTaskMutation.mutate({
      title: formData.title,
      description: formData.description,
      category: formData.category || "other",
      scheduledTime: formData.scheduledTime || null,
      isCompleted: false
    });
  };

  const activeTasks = tasks
    .filter(task => !task.isCompleted)
    .slice(0, 5);

  const completedTasks = tasks
    .filter(task => task.isCompleted)
    .slice(0, 3);

  return (
    <Card className="border border-gray-200 bg-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center text-gray-900">
            <Calendar className="w-5 h-5 mr-2 text-primary" />
            Daily Routine
          </CardTitle>
          <Button
            size="sm"
            onClick={() => setShowAddDialog(true)}
            className="bg-apricot hover:bg-apricot-400 text-amber-900 font-semibold transition-all duration-300 min-h-[40px] px-3"
            data-testid="button-add-task"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Active Tasks */}
        {activeTasks.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700 flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              Today's Tasks
            </h4>
            {activeTasks.map((task, index) => (
              <div 
                key={task.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Clock className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{task.title}</p>
                    {task.scheduledTime && (
                      <p className="text-xs text-gray-500 flex items-center mt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        {task.scheduledTime}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => markAsComplete(task.id)}
                  className="bg-primary hover:bg-primary/90 text-white min-h-[32px] text-xs px-3 rounded-full"
                  data-testid={`button-complete-task-${index}`}
                >
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Done
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-1 text-green-600" />
              Completed
            </h4>
            {completedTasks.map((task) => (
              <div 
                key={task.id}
                className="flex items-center p-2 bg-green-50 rounded-lg border border-green-100"
              >
                <CheckCircle2 className="w-4 h-4 text-green-600 mr-2" />
                <p className="text-sm text-gray-700 line-through">{task.title}</p>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {activeTasks.length === 0 && completedTasks.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No tasks scheduled</p>
            <p className="text-xs text-gray-400 mt-1">Add tasks to get started</p>
          </div>
        )}
      </CardContent>

      {/* Add Task Dialog */}
      <Dialog open={showAddDialog} onOpenChange={(open) => {
        if (!open) {
          setShowAddDialog(false);
          setFormData({
            title: "",
            description: "",
            category: "",
            scheduledTime: ""
          });
        }
      }}>
        <DialogContent className="sm:max-w-md bg-white border-amber-200">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-amber-900">
              Add Daily Task
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="task-title" className="text-lg font-medium text-amber-900">
                Task Title *
              </Label>
              <Input
                id="task-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="What needs to be done?"
                className="text-lg h-12 mt-2"
                data-testid="input-task-title"
              />
            </div>

            <div>
              <Label htmlFor="task-category" className="text-lg font-medium text-amber-900">
                Category
              </Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger id="task-category" className="text-lg h-12 mt-2" data-testid="select-task-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-white border-amber-200">
                  <SelectItem value="morning">Morning Routine</SelectItem>
                  <SelectItem value="medication">Medication</SelectItem>
                  <SelectItem value="meals">Meals</SelectItem>
                  <SelectItem value="exercise">Exercise</SelectItem>
                  <SelectItem value="evening">Evening Routine</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="task-time" className="text-lg font-medium text-amber-900">
                Time (Optional)
              </Label>
              <Input
                id="task-time"
                type="time"
                value={formData.scheduledTime}
                onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                className="text-lg h-12 mt-2"
                data-testid="input-task-time"
              />
            </div>

            <div>
              <Label htmlFor="task-description" className="text-lg font-medium text-amber-900">
                Description (Optional)
              </Label>
              <Input
                id="task-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Additional details"
                className="text-lg h-12 mt-2"
                data-testid="input-task-description"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddDialog(false)}
                className="min-h-[44px] text-lg px-6"
                data-testid="button-cancel-task"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-apricot hover:bg-apricot-400 text-amber-900 min-h-[44px] text-lg px-6 transition-all duration-300"
                disabled={createTaskMutation.isPending}
                data-testid="button-save-task"
              >
                {createTaskMutation.isPending ? "Adding..." : "Add Task"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}