import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Navigation } from "@/components/Navigation";
import { EmergencyButton } from "@/components/EmergencyButton";
import { Settings, Moon, Sun, Contrast, Type, Volume2, Bell, Shield, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  // Mock user for demo
  const user = { firstName: "Sarah", role: "patient" };
  const { theme, contrast, toggleTheme, toggleContrast } = useTheme();
  const { toast } = useToast();
  
  const [fontSize, setFontSize] = useState(() => {
    return localStorage.getItem("fontSize") || "normal";
  });
  
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem("soundEnabled") !== "false";
  });
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    return localStorage.getItem("notificationsEnabled") !== "false";
  });

  const handleFontSizeChange = (size: string) => {
    setFontSize(size);
    localStorage.setItem("fontSize", size);
    
    const root = document.documentElement;
    switch (size) {
      case "small":
        root.style.fontSize = "14px";
        break;
      case "large":
        root.style.fontSize = "18px";
        break;
      case "extra-large":
        root.style.fontSize = "22px";
        break;
      default:
        root.style.fontSize = "16px";
    }
    
    toast({
      title: "Font size updated",
      description: `Font size changed to ${size}`,
    });
  };

  const handleSoundToggle = (enabled: boolean) => {
    setSoundEnabled(enabled);
    localStorage.setItem("soundEnabled", enabled.toString());
    toast({
      title: enabled ? "Sounds enabled" : "Sounds disabled",
      description: enabled ? "App sounds are now on" : "App sounds are now off",
    });
  };

  const handleNotificationsToggle = (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    localStorage.setItem("notificationsEnabled", enabled.toString());
    toast({
      title: enabled ? "Notifications enabled" : "Notifications disabled",
      description: enabled ? "You will receive app notifications" : "App notifications are disabled",
    });
  };

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        toast({
          title: "Notifications enabled",
          description: "You will now receive browser notifications",
        });
      } else {
        toast({
          title: "Notifications denied",
          description: "Please enable notifications in your browser settings",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      <EmergencyButton />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center space-x-4 mb-8">
          <Settings className="w-10 h-10 text-gray-500" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
        </div>

        <div className="space-y-8">
          {/* User Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <User className="w-6 h-6 mr-3" />
                User Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-lg font-medium">Name</Label>
                  <p className="text-xl text-gray-900 dark:text-white mt-1">
                    {user?.firstName} {user?.lastName}
                  </p>
                </div>
                <div>
                  <Label className="text-lg font-medium">Role</Label>
                  <p className="text-xl text-gray-900 dark:text-white mt-1 capitalize">
                    {user?.role}
                  </p>
                </div>
              </div>
              <div>
                <Label className="text-lg font-medium">Username</Label>
                <p className="text-xl text-gray-900 dark:text-white mt-1">
                  {user?.username}
                </p>
              </div>
              <div>
                <Label className="text-lg font-medium">Email</Label>
                <p className="text-xl text-gray-900 dark:text-white mt-1">
                  {user?.email}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Appearance Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <Moon className="w-6 h-6 mr-3" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-lg font-medium">Theme</Label>
                  <p className="text-gray-600 dark:text-gray-300">
                    Choose between light and dark mode
                  </p>
                </div>
                <Button
                  onClick={toggleTheme}
                  variant="outline"
                  className="min-h-[44px] min-w-[120px]"
                  data-testid="button-toggle-theme"
                >
                  {theme === "dark" ? (
                    <>
                      <Sun className="w-5 h-5 mr-2" />
                      Light
                    </>
                  ) : (
                    <>
                      <Moon className="w-5 h-5 mr-2" />
                      Dark
                    </>
                  )}
                </Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-lg font-medium">High Contrast</Label>
                  <p className="text-gray-600 dark:text-gray-300">
                    Increase contrast for better visibility
                  </p>
                </div>
                <Button
                  onClick={toggleContrast}
                  variant="outline"
                  className="min-h-[44px] min-w-[120px]"
                  data-testid="button-toggle-contrast"
                >
                  <Contrast className="w-5 h-5 mr-2" />
                  {contrast === "high" ? "Normal" : "High"}
                </Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-lg font-medium">Font Size</Label>
                  <p className="text-gray-600 dark:text-gray-300">
                    Adjust text size for better readability
                  </p>
                </div>
                <Select value={fontSize} onValueChange={handleFontSizeChange}>
                  <SelectTrigger className="w-[200px] min-h-[44px]" data-testid="select-font-size">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                    <SelectItem value="extra-large">Extra Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Sound & Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <Bell className="w-6 h-6 mr-3" />
                Sound & Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-lg font-medium">App Sounds</Label>
                  <p className="text-gray-600 dark:text-gray-300">
                    Play sounds for app interactions
                  </p>
                </div>
                <Switch
                  checked={soundEnabled}
                  onCheckedChange={handleSoundToggle}
                  data-testid="switch-sounds"
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-lg font-medium">App Notifications</Label>
                  <p className="text-gray-600 dark:text-gray-300">
                    Show notifications within the app
                  </p>
                </div>
                <Switch
                  checked={notificationsEnabled}
                  onCheckedChange={handleNotificationsToggle}
                  data-testid="switch-notifications"
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-lg font-medium">Browser Notifications</Label>
                  <p className="text-gray-600 dark:text-gray-300">
                    Allow browser notifications for reminders
                  </p>
                </div>
                <Button
                  onClick={requestNotificationPermission}
                  variant="outline"
                  className="min-h-[44px]"
                  data-testid="button-enable-browser-notifications"
                >
                  <Bell className="w-5 h-5 mr-2" />
                  Enable
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <Shield className="w-6 h-6 mr-3" />
                Privacy & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-lg font-medium mb-2 block">Data Privacy</Label>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Your personal information and memories are stored securely and privately. 
                  We never share your data with third parties without your explicit consent.
                </p>
              </div>

              <Separator />

              <div>
                <Label className="text-lg font-medium mb-2 block">Emergency Access</Label>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Emergency contacts can access basic information during emergencies. 
                  Detailed memories and personal notes remain private.
                </p>
              </div>

              <Separator />

              <div>
                <Label className="text-lg font-medium mb-2 block">Photo Storage</Label>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Photos are stored securely in encrypted cloud storage. 
                  Only you and designated caregivers can access them.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Help & Support */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Help & Support</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Quick Tips</h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li>• Use the red HELP button for emergencies</li>
                  <li>• Add photos to make memories more vivid</li>
                  <li>• Set up your daily routine for structure</li>
                  <li>• Keep emergency contacts up to date</li>
                  <li>• Adjust font size and contrast for comfort</li>
                </ul>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-2">Need Help?</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  If you need assistance using MemoryCare, please contact your caregiver 
                  or a family member. They can help you navigate the app and set up features.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
