import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Shield, Users, Calendar, Brain, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "patient" as "patient" | "caregiver"
  });

  if (user) {
    return <Redirect to="/" />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginData.username || !loginData.password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }
    loginMutation.mutate(loginData);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerData.username || !registerData.email || !registerData.password || !registerData.firstName || !registerData.lastName) {
      toast({
        title: "Error", 
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }
    registerMutation.mutate(registerData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="grid lg:grid-cols-2 min-h-screen">
        {/* Hero Section */}
        <div className="hidden lg:flex flex-col justify-center items-center p-12 bg-gradient-to-br from-primary-500 to-purple-600 text-white">
          <div className="text-center max-w-md">
            <Heart className="w-20 h-20 mx-auto mb-8 text-white" />
            <h1 className="text-5xl font-bold mb-6">MemoryCare</h1>
            <p className="text-xl mb-8 opacity-90">
              A digital companion designed to support dementia patients and their caregivers with love, care, and technology.
            </p>
            
            <div className="grid grid-cols-2 gap-6 text-left">
              <div className="flex items-start space-x-3">
                <Shield className="w-6 h-6 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Safe & Secure</h3>
                  <p className="text-sm opacity-80">Your data is protected with industry-standard security</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Users className="w-6 h-6 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Family Connection</h3>
                  <p className="text-sm opacity-80">Keep loved ones connected and informed</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Calendar className="w-6 h-6 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Daily Support</h3>
                  <p className="text-sm opacity-80">Medication reminders and routine management</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Brain className="w-6 h-6 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Memory Care</h3>
                  <p className="text-sm opacity-80">Tools to preserve and share precious memories</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Auth Form Section */}
        <div className="flex flex-col justify-center p-6 lg:p-12">
          <div className="mx-auto w-full max-w-md">
            <div className="text-center mb-8 lg:hidden">
              <Heart className="w-16 h-16 mx-auto mb-4 text-primary-500" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">MemoryCare</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">Digital companion for memory care</p>
            </div>

            <Card className="border-0 shadow-2xl">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  Welcome to MemoryCare
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="login" className="text-lg py-3" data-testid="tab-login">
                      Sign In
                    </TabsTrigger>
                    <TabsTrigger value="register" className="text-lg py-3" data-testid="tab-register">
                      Sign Up
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="login">
                    <form onSubmit={handleLogin} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="login-username" className="text-lg font-medium">
                          Username
                        </Label>
                        <Input
                          id="login-username"
                          type="text"
                          value={loginData.username}
                          onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                          className="h-12 text-lg"
                          placeholder="Enter your username"
                          data-testid="input-username"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="login-password" className="text-lg font-medium">
                          Password
                        </Label>
                        <div className="relative">
                          <Input
                            id="login-password"
                            type={showPassword ? "text" : "password"}
                            value={loginData.password}
                            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                            className="h-12 text-lg pr-12"
                            placeholder="Enter your password"
                            data-testid="input-password"
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                            onClick={() => setShowPassword(!showPassword)}
                            data-testid="button-toggle-password"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-14 text-lg font-semibold"
                        disabled={loginMutation.isPending}
                        data-testid="button-login"
                      >
                        {loginMutation.isPending ? "Signing In..." : "Sign In"}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="register">
                    <form onSubmit={handleRegister} className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="register-firstName" className="text-lg font-medium">
                            First Name
                          </Label>
                          <Input
                            id="register-firstName"
                            type="text"
                            value={registerData.firstName}
                            onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                            className="h-12 text-lg"
                            placeholder="First name"
                            data-testid="input-firstName"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="register-lastName" className="text-lg font-medium">
                            Last Name
                          </Label>
                          <Input
                            id="register-lastName"
                            type="text"
                            value={registerData.lastName}
                            onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                            className="h-12 text-lg"
                            placeholder="Last name"
                            data-testid="input-lastName"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="register-username" className="text-lg font-medium">
                          Username
                        </Label>
                        <Input
                          id="register-username"
                          type="text"
                          value={registerData.username}
                          onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                          className="h-12 text-lg"
                          placeholder="Choose a username"
                          data-testid="input-register-username"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="register-email" className="text-lg font-medium">
                          Email
                        </Label>
                        <Input
                          id="register-email"
                          type="email"
                          value={registerData.email}
                          onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                          className="h-12 text-lg"
                          placeholder="Enter your email"
                          data-testid="input-email"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="register-password" className="text-lg font-medium">
                          Password
                        </Label>
                        <div className="relative">
                          <Input
                            id="register-password"
                            type={showPassword ? "text" : "password"}
                            value={registerData.password}
                            onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                            className="h-12 text-lg pr-12"
                            placeholder="Create a password"
                            data-testid="input-register-password"
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                            onClick={() => setShowPassword(!showPassword)}
                            data-testid="button-toggle-register-password"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="register-role" className="text-lg font-medium">
                          I am a...
                        </Label>
                        <Select
                          value={registerData.role}
                          onValueChange={(value: "patient" | "caregiver") => 
                            setRegisterData({ ...registerData, role: value })
                          }
                        >
                          <SelectTrigger className="h-12 text-lg" data-testid="select-role">
                            <SelectValue placeholder="Select your role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="patient">Patient</SelectItem>
                            <SelectItem value="caregiver">Caregiver</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-14 text-lg font-semibold"
                        disabled={registerMutation.isPending}
                        data-testid="button-register"
                      >
                        {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
