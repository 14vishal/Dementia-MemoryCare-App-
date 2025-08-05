import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Book, Users, Calendar, Check, Clock, Phone, Heart, Sparkles } from "lucide-react";
import { DailyTask, Contact } from "@shared/schema";
// import { useAuth } from "@/hooks/use-auth";
import { MedicineReminders } from "@/components/MedicineReminders";

export function PatientDashboard() {
  // Mock user for demo purposes
  const user = { firstName: "Sarah" };

  const { data: todayTasks = [] } = useQuery<DailyTask[]>({
    queryKey: ["/api/daily-tasks", { today: true }],
  });

  const { data: emergencyContacts = [] } = useQuery<Contact[]>({
    queryKey: ["/api/contacts", { emergency: true }],
  });

  const currentTime = new Date();
  const currentHour = currentTime.getHours();
  const greeting = currentHour < 12 ? "Good Morning" : currentHour < 18 ? "Good Afternoon" : "Good Evening";
  const today = currentTime.toLocaleDateString("en-US", { 
    weekday: "long", 
    month: "long", 
    day: "numeric" 
  });

  const getTaskStatus = (task: DailyTask) => {
    if (task.isCompleted) return "completed";
    
    if (!task.scheduledTime) return "pending";
    
    const [hours, minutes] = task.scheduledTime.split(":").map(Number);
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);
    
    return currentTime >= scheduledTime ? "due" : "upcoming";
  };

  const handleCallContact = (contact: Contact) => {
    if (contact.phoneNumber) {
      window.location.href = `tel:${contact.phoneNumber}`;
    }
  };

  const activeTasks = todayTasks.filter(task => !task.isCompleted);
  const completedTasks = todayTasks.filter(task => task.isCompleted);

  return (
    <div className="space-y-8 transition-all duration-300 ease-in-out">
      {/* Welcome Header */}
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-full mb-6">
          <Heart className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {greeting}, {user?.firstName}!
        </h1>
        <p className="text-xl text-gray-600 font-light">
          {today}
        </p>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 gap-4 mb-12 max-w-md mx-auto">
        <Link href="/memory-journal">
                <Card className="group cursor-pointer transition-all duration-300 ease-in-out hover:shadow-md hover:scale-105 border border-amber-200 bg-white aspect-square">
                  <CardContent className="flex flex-col items-center justify-center text-center p-6 h-full">
                    <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                      <Book className="w-8 h-8 text-amber-700" />
                    </div>
                    <h3 className="text-xl font-bold text-amber-900 mb-1">Journal</h3>
                    <div className="text-lg font-bold text-amber-700">8</div>
                  </CardContent>
                </Card>
        </Link>

        <Link href="/familiar-faces">
                <Card className="group cursor-pointer transition-all duration-300 ease-in-out hover:shadow-md hover:scale-105 border border-amber-200 bg-white aspect-square">
                  <CardContent className="flex flex-col items-center justify-center text-center p-6 h-full">
                    <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                      <Users className="w-8 h-8 text-yellow-700" />
                    </div>
                    <h3 className="text-xl font-bold text-amber-900 mb-1">Faces</h3>
                    <div className="text-lg font-bold text-yellow-700">12</div>
                  </CardContent>
                </Card>
        </Link>

        <Link href="/daily-routine">
                <Card className="group cursor-pointer transition-all duration-300 ease-in-out hover:shadow-md hover:scale-105 border border-amber-200 bg-white aspect-square">
                  <CardContent className="flex flex-col items-center justify-center text-center p-6 h-full">
                    <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                      <Calendar className="w-8 h-8 text-orange-700" />
                    </div>
                    <h3 className="text-xl font-bold text-amber-900 mb-1">Routine</h3>
                    <div className="text-lg font-bold text-orange-700">5</div>
                  </CardContent>
                </Card>
        </Link>

        <Link href="/contacts">
                <Card className="group cursor-pointer transition-all duration-300 ease-in-out hover:shadow-md hover:scale-105 border border-amber-200 bg-white aspect-square">
                  <CardContent className="flex flex-col items-center justify-center text-center p-6 h-full">
                    <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                      <Phone className="w-8 h-8 text-yellow-800" />
                    </div>
                    <h3 className="text-xl font-bold text-amber-900 mb-1">Contacts</h3>
                    <div className="text-lg font-bold text-yellow-800">6</div>
                  </CardContent>
                </Card>
        </Link>
      </div>

      {/* People in Your Life Section - Full Width */}
      <div className="w-full">
        <Card className="border border-amber-200 shadow-sm bg-white w-full">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-amber-900 flex items-center">
                <Users className="w-6 h-6 mr-3 text-primary" />
                People in Your Life
              </h2>
              <Link href="/familiar-faces">
                <Button variant="outline" size="lg" className="text-primary border-primary hover:bg-primary/5">
                  View All
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-0">
              {[
                { id: "1", name: "Sarah", relationship: "Daughter", image: "https://images.unsplash.com/photo-1494790108755-2616c26c2dae?w=400&h=400&fit=crop&crop=face" },
                { id: "2", name: "Michael", relationship: "Son", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face" },
                { id: "3", name: "Emma", relationship: "Granddaughter", image: "https://images.unsplash.com/photo-1544348817-5f2cf14b88c8?w=400&h=400&fit=crop&crop=face" },
                { id: "4", name: "Dr. Johnson", relationship: "Doctor", image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face" },
                { id: "5", name: "Mary", relationship: "Friend", image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face" },
                { id: "6", name: "Robert", relationship: "Husband", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face" },
              ].map((person) => (
                <div 
                  key={person.id} 
                  className="cursor-pointer group"
                  onClick={() => window.open(`/familiar-faces?person=${person.id}`, '_self')}
                >
                  <div 
                    className="w-full h-80 border-0 rounded-none overflow-hidden group-hover:shadow-xl group-hover:scale-105 transition-all duration-300 ease-in-out bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%), url(${person.image})` }}
                  >
                    <div className="w-full h-full flex items-end p-6">
                      <div className="text-white text-center w-full">
                        <p className="text-3xl font-bold drop-shadow-lg mb-2">{person.name}</p>
                        <p className="text-xl drop-shadow-lg">{person.relationship}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Tasks Overview */}
      {activeTasks.length > 0 && (
        <Card className="border border-amber-200 shadow-sm bg-white mt-6">
          <CardContent className="p-8">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center mr-4">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-amber-900">Today's Tasks</h2>
            </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeTasks.slice(0, 4).map((task) => {
                      const status = getTaskStatus(task);
                      return (
                        <div key={task.id} className="flex items-center p-4 bg-amber-50 rounded-xl">
                          <div className={`w-3 h-3 rounded-full mr-4 ${
                            status === 'due' ? 'bg-red-400' : status === 'upcoming' ? 'bg-amber-400' : 'bg-amber-300'
                          }`} />
                          <div className="flex-1">
                            <p className="font-medium text-amber-900">{task.title}</p>
                            {task.scheduledTime && (
                              <p className="text-sm text-amber-700">{task.scheduledTime}</p>
                            )}
                          </div>
                          {status === 'due' && (
                            <div className="text-red-500 text-sm font-medium">Due now</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  {activeTasks.length > 4 && (
                    <div className="mt-4 text-center">
                      <Link href="/daily-routine">
                        <Button variant="outline" className="text-amber-700 border-amber-300 hover:bg-amber-50">
                          View all {activeTasks.length} tasks
                        </Button>
                      </Link>
                    </div>
                  )}
          </CardContent>
        </Card>
      )}

      {/* Emergency Contacts */}
      {emergencyContacts.length > 0 && (
        <Card className="border-0 shadow-lg bg-gradient-to-r from-red-50 to-pink-50">
          <CardContent className="p-8">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-red-400 to-red-500 rounded-xl flex items-center justify-center mr-4">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-amber-900">Emergency Contacts</h2>
            </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {emergencyContacts.slice(0, 4).map((contact) => (
                      <Button
                        key={contact.id}
                        onClick={() => handleCallContact(contact)}
                        className="h-auto p-4 bg-white hover:bg-gray-50 border border-red-200 text-left justify-start"
                        variant="outline"
                        data-testid={`button-call-${contact.id}`}
                      >
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-4">
                          <Phone className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium text-amber-900">{contact.name}</p>
                          <p className="text-sm text-amber-700">{contact.relationship}</p>
                        </div>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

      {/* Progress Section */}
      {completedTasks.length > 0 && (
        <Card className="border-0 shadow-lg bg-gradient-to-r from-amber-50 to-yellow-50">
          <CardContent className="p-8">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-amber-500 rounded-xl flex items-center justify-center mr-4">
                <Check className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-amber-900">Great Work Today!</h2>
            </div>
            
            <div className="flex items-center">
              <div className="text-4xl font-bold text-amber-600 mr-4">{completedTasks.length}</div>
              <div>
                <p className="text-lg font-medium text-amber-800">
                  {completedTasks.length === 1 ? 'task completed' : 'tasks completed'}
                </p>
                <p className="text-amber-700">Keep up the excellent work!</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}