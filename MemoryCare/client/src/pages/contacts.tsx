import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageLayout } from "@/components/PageLayout";
import { ObjectUploader } from "@/components/ObjectUploader";
import { Phone, Plus, Edit, Trash2, Camera, User, Mail, AlertTriangle } from "lucide-react";
import { Contact } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { UploadResult } from "@uppy/core";

export default function ContactsPage() {
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [formData, setFormData] = useState({
    name: "",
    relationship: "",
    phoneNumber: "",
    email: "",
    category: "family" as "family" | "medical" | "emergency",
    isEmergency: false
  });

  const { data: contacts = [], isLoading } = useQuery<Contact[]>({
    queryKey: ["/api/contacts"],
  });

  const createContactMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/contacts", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      setShowCreateDialog(false);
      setFormData({
        name: "",
        relationship: "",
        phoneNumber: "",
        email: "",
        category: "family",
        isEmergency: false
      });
      toast({
        title: "Success",
        description: "Contact added successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add contact",
        variant: "destructive"
      });
    }
  });

  const updateContactMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Contact> }) => {
      const res = await apiRequest("PUT", `/api/contacts/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      setEditingContact(null);
      setFormData({
        name: "",
        relationship: "",
        phoneNumber: "",
        email: "",
        category: "family",
        isEmergency: false
      });
      toast({
        title: "Success",
        description: "Contact updated successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update contact",
        variant: "destructive"
      });
    }
  });

  const deleteContactMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/contacts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      toast({
        title: "Success",
        description: "Contact deleted successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete contact",
        variant: "destructive"
      });
    }
  });

  const updatePhotoMutation = useMutation({
    mutationFn: async ({ id, photoURL }: { id: string; photoURL: string }) => {
      const res = await apiRequest("PUT", `/api/contacts/${id}/photo`, { photoURL });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      toast({
        title: "Success",
        description: "Photo updated successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update photo",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.relationship.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name and relationship",
        variant: "destructive"
      });
      return;
    }

    if (editingContact) {
      updateContactMutation.mutate({
        id: editingContact.id,
        data: formData
      });
    } else {
      createContactMutation.mutate(formData);
    }
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      relationship: contact.relationship,
      phoneNumber: contact.phoneNumber || "",
      email: contact.email || "",
      category: contact.category as "family" | "medical" | "emergency",
      isEmergency: contact.isEmergency || false
    });
  };

  const handleCall = (contact: Contact) => {
    if (contact.phoneNumber) {
      window.location.href = `tel:${contact.phoneNumber}`;
    } else {
      toast({
        title: "No phone number",
        description: "This contact doesn't have a phone number",
        variant: "destructive"
      });
    }
  };

  const handleEmail = (contact: Contact) => {
    if (contact.email) {
      window.location.href = `mailto:${contact.email}`;
    } else {
      toast({
        title: "No email address",
        description: "This contact doesn't have an email address",
        variant: "destructive"
      });
    }
  };

  const handleGetUploadParameters = async () => {
    const res = await apiRequest("POST", "/api/objects/upload");
    const { uploadURL } = await res.json();
    return {
      method: "PUT" as const,
      url: uploadURL,
    };
  };

  const handlePhotoUploadComplete = (contactId: string) => (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful && result.successful.length > 0) {
      const uploadURL = result.successful[0].uploadURL;
      if (uploadURL) {
        updatePhotoMutation.mutate({ id: contactId, photoURL: uploadURL });
      }
    }
  };

  const filteredContacts = contacts.filter(contact => {
    if (filterCategory === "all") return true;
    if (filterCategory === "emergency") return contact.isEmergency;
    return contact.category === filterCategory;
  });

  const getCategoryIcon = (category: string) => {
    const icons = {
      family: "👨‍👩‍👧‍👦",
      medical: "🏥",
      emergency: "🚨"
    };
    return icons[category as keyof typeof icons] || "👤";
  };

  return (
    <PageLayout>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <Phone className="w-10 h-10 text-apricot-300" />
            <h1 className="text-4xl font-bold text-amber-900">
              Contacts
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48 min-h-[44px] bg-white border-amber-200" data-testid="select-filter-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-amber-200">
                <SelectItem value="all">All Contacts</SelectItem>
                <SelectItem value="family">Family</SelectItem>
                <SelectItem value="medical">Medical</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-apricot hover:bg-apricot-400 text-amber-900 font-semibold text-lg py-3 px-6 min-h-[44px] transition-all duration-300"
              data-testid="button-add-contact"
            >
              <Plus className="w-6 h-6 mr-2" />
              Add Contact
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse bg-white border-amber-200">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-apricot-200 rounded-full" />
                    <div className="flex-1">
                      <div className="h-6 bg-apricot-200 rounded w-3/4 mb-2" />
                      <div className="h-4 bg-apricot-200 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-10 bg-apricot-200 rounded" />
                    <div className="h-10 bg-apricot-200 rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="text-center py-16">
            <Phone className="w-24 h-24 mx-auto mb-6 text-apricot-400" />
            <h2 className="text-3xl font-semibold text-amber-900 mb-4">
              {filterCategory === "all" ? "Add Your Contacts" : `No ${filterCategory} contacts`}
            </h2>
            <p className="text-xl text-mountbatten_pink mb-8 max-w-2xl mx-auto">
              {filterCategory === "all" 
                ? "Keep important contact information easily accessible. Add family, friends, doctors, and emergency contacts."
                : `You don't have any ${filterCategory} contacts yet.`
              }
            </p>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-apricot hover:bg-apricot-400 text-amber-900 font-semibold text-lg py-4 px-8 min-h-[44px] transition-all duration-300"
              data-testid="button-first-contact"
            >
              <Plus className="w-6 h-6 mr-2" />
              Add Your First Contact
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContacts.map((contact) => (
              <Card key={contact.id} className="card-hover bg-white border-amber-200 transition-all duration-300 hover:shadow-lg hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="relative">
                        {contact.photoUrl ? (
                          <img
                            src={contact.photoUrl}
                            alt={contact.name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                            <User className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                          </div>
                        )}
                        <ObjectUploader
                          maxNumberOfFiles={1}
                          maxFileSize={10485760}
                          onGetUploadParameters={handleGetUploadParameters}
                          onComplete={handlePhotoUploadComplete(contact.id)}
                          buttonClassName="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-apricot hover:bg-apricot-400 text-amber-900 p-0 min-w-[32px] min-h-[32px] transition-all duration-300"
                        >
                          <Camera className="w-4 h-4" />
                        </ObjectUploader>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-amber-900 truncate">
                          {contact.name}
                        </h3>
                        <p className="text-lg text-apricot-300 font-medium">
                          {contact.relationship}
                        </p>
                        <div className="flex items-center mt-1">
                          <span className="text-sm mr-2">{getCategoryIcon(contact.category)}</span>
                          <span className="text-sm text-mountbatten_pink capitalize">
                            {contact.category}
                          </span>
                          {contact.isEmergency && (
                            <AlertTriangle className="w-4 h-4 ml-2 text-red-500" />
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(contact)}
                        className="min-h-[44px] min-w-[44px]"
                        data-testid={`button-edit-${contact.id}`}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteContactMutation.mutate(contact.id)}
                        className="min-h-[44px] min-w-[44px] text-red-500 hover:text-red-700"
                        data-testid={`button-delete-${contact.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {contact.phoneNumber && (
                      <Button
                        onClick={() => handleCall(contact)}
                        className="w-full bg-apricot hover:bg-apricot-400 text-amber-900 font-medium min-h-[44px] transition-all duration-300"
                        data-testid={`button-call-${contact.id}`}
                      >
                        <Phone className="w-5 h-5 mr-2" />
                        Call {contact.phoneNumber}
                      </Button>
                    )}
                    
                    {contact.email && (
                      <Button
                        onClick={() => handleEmail(contact)}
                        variant="outline"
                        className="w-full font-medium min-h-[44px] border-amber-200 text-amber-900 hover:bg-apricot-100 transition-all duration-300"
                        data-testid={`button-email-${contact.id}`}
                      >
                        <Mail className="w-5 h-5 mr-2" />
                        Email
                      </Button>
                    )}

                    {!contact.phoneNumber && !contact.email && (
                      <p className="text-center text-mountbatten_pink py-4">
                        No contact information available
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={showCreateDialog || !!editingContact} onOpenChange={(open) => {
          if (!open) {
            setShowCreateDialog(false);
            setEditingContact(null);
            setFormData({
              name: "",
              relationship: "",
              phoneNumber: "",
              email: "",
              category: "family",
              isEmergency: false
            });
          }
        }}>
          <DialogContent className="sm:max-w-md bg-white border-amber-200">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                {editingContact ? "Edit Contact" : "Add New Contact"}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name" className="text-lg font-medium">
                  Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter their name"
                  className="text-lg h-12 mt-2"
                  data-testid="input-contact-name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="relationship" className="text-lg font-medium">
                  Relationship
                </Label>
                <Input
                  id="relationship"
                  value={formData.relationship}
                  onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                  placeholder="e.g., Daughter, Doctor, Friend"
                  className="text-lg h-12 mt-2"
                  data-testid="input-contact-relationship"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phoneNumber" className="text-lg font-medium">
                  Phone Number
                </Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="(555) 123-4567"
                  className="text-lg h-12 mt-2"
                  data-testid="input-contact-phone"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-lg font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                  className="text-lg h-12 mt-2"
                  data-testid="input-contact-email"
                />
              </div>

              <div>
                <Label htmlFor="category" className="text-lg font-medium">
                  Category
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: "family" | "medical" | "emergency") => 
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger className="min-h-[44px] text-lg mt-2" data-testid="select-contact-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="family">Family</SelectItem>
                    <SelectItem value="medical">Medical</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-3">
                <Switch
                  id="isEmergency"
                  checked={formData.isEmergency}
                  onCheckedChange={(checked) => setFormData({ ...formData, isEmergency: checked })}
                  data-testid="switch-emergency-contact"
                />
                <Label htmlFor="isEmergency" className="text-lg font-medium">
                  Emergency Contact
                </Label>
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateDialog(false);
                    setEditingContact(null);
                    setFormData({
                      name: "",
                      relationship: "",
                      phoneNumber: "",
                      email: "",
                      category: "family",
                      isEmergency: false
                    });
                  }}
                  className="min-h-[44px] text-lg px-6"
                  data-testid="button-cancel-contact"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-apricot hover:bg-apricot-400 text-amber-900 min-h-[44px] text-lg px-6 transition-all duration-300"
                  disabled={createContactMutation.isPending || updateContactMutation.isPending}
                  data-testid="button-save-contact"
                >
                  {createContactMutation.isPending || updateContactMutation.isPending
                    ? "Saving..." 
                    : editingContact ? "Update Contact" : "Add Contact"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </PageLayout>
  );
}
