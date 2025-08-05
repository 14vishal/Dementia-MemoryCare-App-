import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
// import { useAuth } from "@/hooks/use-auth";
import { Heart, Menu, BookOpen, Type, User, Settings, LogOut, Home, Book, Users, Calendar, Pill, Phone } from "lucide-react";

export function Navigation() {
  const [location] = useLocation();
  // Mock user for demo
  const user = { role: "patient", firstName: "Sarah" };
  const [readingMode, setReadingMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const patientNavItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/memory-journal", icon: Book, label: "Memory Journal" },
    { path: "/familiar-faces", icon: Users, label: "Familiar Faces" },
    { path: "/contacts", icon: Phone, label: "Contacts" },
  ];

  const caregiverNavItems = [
    { path: "/", icon: Home, label: "Dashboard" },
    { path: "/patients", icon: Users, label: "Patients" },
    { path: "/medications", icon: Pill, label: "Medications" },
    { path: "/behavior-logs", icon: Book, label: "Behavior Logs" },
    { path: "/contacts", icon: Phone, label: "Contacts" },
  ];

  const navItems = user?.role === "caregiver" ? caregiverNavItems : patientNavItems;

  const handleLogout = () => {
    // For demo - just close menu
    setMobileMenuOpen(false);
  };

  const NavLink = ({ path, icon: Icon, label, mobile = false }: { 
    path: string; 
    icon: any; 
    label: string; 
    mobile?: boolean;
  }) => (
    <Link href={path}>
      <Button
        variant={location === path ? "default" : "ghost"}
        className={`${mobile ? 'w-full justify-start text-lg py-3' : ''} min-h-[44px] ${
          location === path ? 'bg-primary-500 text-white' : ''
        }`}
        onClick={() => setMobileMenuOpen(false)}
        data-testid={`nav-${label.toLowerCase().replace(' ', '-')}`}
      >
        <Icon className="w-5 h-5 mr-2" />
        {label}
      </Button>
    </Link>
  );

  return (
    <header className="bg-white shadow-sm border-b border-amber-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center cursor-pointer" data-testid="logo">
              <Heart className="w-8 h-8 text-primary" />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => (
              <NavLink key={item.path} {...item} />
            ))}
          </nav>

          {/* Desktop Controls */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Reading Mode Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReadingMode(!readingMode)}
              className="min-h-[44px] min-w-[44px]"
              aria-label="Toggle reading mode"
              data-testid="button-reading-toggle"
            >
              {readingMode ? <Type className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
            </Button>

            {/* Settings */}
            <Link href="/settings">
              <Button
                variant="ghost"
                size="sm"
                className="min-h-[44px] min-w-[44px]"
                data-testid="button-settings"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </Link>

            {/* User Info and Logout */}
            <div className="flex items-center space-x-3 ml-2">
              <div className="text-right">
                <p className="text-sm font-medium text-amber-900">
                  {user?.firstName}
                </p>
                <p className="text-xs text-amber-700 capitalize">
                  {user?.role}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="min-h-[44px] px-3"
                data-testid="button-logout"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden min-h-[44px] min-w-[44px]" data-testid="button-mobile-menu">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col h-full">
                {/* User Info */}
                <div className="flex items-center space-x-3 mb-8">
                  <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {user?.firstName}
                    </p>
                    <p className="text-sm text-gray-500 capitalize">
                      {user?.role}
                    </p>
                  </div>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 space-y-2">
                  {navItems.map((item) => (
                    <NavLink key={item.path} {...item} mobile />
                  ))}
                </nav>

                {/* Controls */}
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Reading Mode</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setReadingMode(!readingMode)}
                      className="min-h-[44px]"
                    >
                      {readingMode ? <Type className="w-4 h-4 mr-2" /> : <BookOpen className="w-4 h-4 mr-2" />}
                      {readingMode ? "Normal" : "Reading"}
                    </Button>
                  </div>

                  <Link href="/settings">
                    <Button variant="outline" className="w-full justify-start min-h-[44px]" onClick={() => setMobileMenuOpen(false)}>
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Button>
                  </Link>

                  <Button
                    variant="destructive"
                    onClick={handleLogout}
                    className="w-full justify-start min-h-[44px]"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
