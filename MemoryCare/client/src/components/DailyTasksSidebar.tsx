import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, Calendar } from "lucide-react";
import { DailyTask } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function DailyTasksSidebar() {
  const { toast } = useToast();
  
  const { data: tasks = [] } = useQuery<DailyTask[]>({
    queryKey: ["/api/daily-tasks", { date: new Date() }],
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

  const activeTasks = tasks
    .filter(task => task.isActive && !task.isCompleted)
    .slice(0, 4);

  if (activeTasks.length === 0) {
    return (
      <Card className="border border-gray-200 bg-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center text-gray-900">
            <Calendar className="w-5 h-5 mr-2 text-primary" />
            Daily Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-gray-500">
            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">All tasks completed!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-gray-200 bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center text-gray-900">
          <Calendar className="w-5 h-5 mr-2 text-primary" />
          Daily Tasks
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
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
      </CardContent>
    </Card>
  );
}