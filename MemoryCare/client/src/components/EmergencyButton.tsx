import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle, Phone, MessageSquare } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Contact } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function EmergencyButton() {
  const [showEmergencyDialog, setShowEmergencyDialog] = useState(false);
  const { toast } = useToast();

  const { data: emergencyContacts = [] } = useQuery<Contact[]>({
    queryKey: ["/api/contacts", { emergency: true }],
  });

  const handleEmergencyCall = (contact: Contact) => {
    if (contact.phoneNumber) {
      window.location.href = `tel:${contact.phoneNumber}`;
    } else {
      toast({
        title: "No phone number",
        description: `No phone number available for ${contact.name}`,
        variant: "destructive"
      });
    }
  };

  const handleEmergencyText = (contact: Contact) => {
    if (contact.phoneNumber) {
      window.location.href = `sms:${contact.phoneNumber}?body=This is an emergency. I need help.`;
    } else {
      toast({
        title: "No phone number",
        description: `No phone number available for ${contact.name}`,
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <Button
        onClick={() => setShowEmergencyDialog(true)}
        className="fixed top-4 right-4 z-50 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg animate-pulse shadow-lg min-h-[44px] min-w-[44px] text-left ml-[1228px] mr-[1228px] mt-[59px] mb-[59px]"
        data-testid="button-emergency"
      >
        <AlertTriangle className="w-6 h-6 mr-2" />
        HELP
      </Button>

      <Dialog open={showEmergencyDialog} onOpenChange={setShowEmergencyDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold text-red-600 flex items-center justify-center gap-2">
              <AlertTriangle className="w-8 h-8" />
              Emergency Help
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {emergencyContacts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
                  No emergency contacts available
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Please add emergency contacts in your settings
                </p>
              </div>
            ) : (
              <>
                <p className="text-center text-lg font-medium text-gray-900 dark:text-white mb-6">
                  Choose who to contact for help:
                </p>
                
                <div className="space-y-3">
                  {emergencyContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="border border-gray-200 dark:border-gray-600 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          {contact.photoUrl ? (
                            <img
                              src={contact.photoUrl}
                              alt={contact.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                              <span className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                                {contact.name.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {contact.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {contact.relationship}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleEmergencyCall(contact)}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white min-h-[44px]"
                          data-testid={`button-call-${contact.name}`}
                        >
                          <Phone className="w-5 h-5 mr-2" />
                          Call
                        </Button>
                        <Button
                          onClick={() => handleEmergencyText(contact)}
                          variant="outline"
                          className="flex-1 border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 min-h-[44px]"
                          data-testid={`button-text-${contact.name}`}
                        >
                          <MessageSquare className="w-5 h-5 mr-2" />
                          Text
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
              <Button
                onClick={() => window.location.href = "tel:911"}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-lg py-4 min-h-[56px]"
                data-testid="button-call-911"
              >
                <Phone className="w-6 h-6 mr-2" />
                Call 911 (Emergency Services)
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
