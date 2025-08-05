import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageLayout } from "@/components/PageLayout";
import { ObjectUploader } from "@/components/ObjectUploader";
import { Users, Plus, Edit, Trash2, Camera, User } from "lucide-react";
import { FamiliarFace } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { UploadResult } from "@uppy/core";

export default function FamiliarFacesPage() {
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingFace, setEditingFace] = useState<FamiliarFace | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    relationship: "",
    description: ""
  });

  const { data: familiarFaces = [], isLoading } = useQuery<FamiliarFace[]>({
    queryKey: ["/api/familiar-faces"],
  });

  const createFaceMutation = useMutation({
    mutationFn: async (data: { name: string; relationship: string; description?: string; photoUrl: string }) => {
      const res = await apiRequest("POST", "/api/familiar-faces", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/familiar-faces"] });
      setShowCreateDialog(false);
      setFormData({ name: "", relationship: "", description: "" });
      toast({
        title: "Success",
        description: "Familiar face added successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add familiar face",
        variant: "destructive"
      });
    }
  });

  const updateFaceMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<FamiliarFace> }) => {
      const res = await apiRequest("PUT", `/api/familiar-faces/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/familiar-faces"] });
      setEditingFace(null);
      setFormData({ name: "", relationship: "", description: "" });
      toast({
        title: "Success",
        description: "Familiar face updated successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update familiar face",
        variant: "destructive"
      });
    }
  });

  const deleteFaceMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/familiar-faces/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/familiar-faces"] });
      toast({
        title: "Success",
        description: "Familiar face removed successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove familiar face",
        variant: "destructive"
      });
    }
  });

  const updatePhotoMutation = useMutation({
    mutationFn: async ({ id, photoURL }: { id: string; photoURL: string }) => {
      const res = await apiRequest("PUT", `/api/familiar-faces/${id}/photo`, { photoURL });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/familiar-faces"] });
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

    if (editingFace) {
      updateFaceMutation.mutate({
        id: editingFace.id,
        data: formData
      });
    } else {
      // For new faces, we need a photo URL - will be set via upload
      toast({
        title: "Note",
        description: "Please add a photo after creating the entry",
        variant: "default"
      });
      createFaceMutation.mutate({
        ...formData,
        photoUrl: "/placeholder-avatar.jpg" // Placeholder until photo is uploaded
      });
    }
  };

  const handleEdit = (face: FamiliarFace) => {
    setEditingFace(face);
    setFormData({
      name: face.name,
      relationship: face.relationship,
      description: face.description || ""
    });
  };

  const handleGetUploadParameters = async () => {
    const res = await apiRequest("POST", "/api/objects/upload");
    const { uploadURL } = await res.json();
    return {
      method: "PUT" as const,
      url: uploadURL,
    };
  };

  const handlePhotoUploadComplete = (faceId: string) => (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful && result.successful.length > 0) {
      const uploadURL = result.successful[0].uploadURL;
      if (uploadURL) {
        updatePhotoMutation.mutate({ id: faceId, photoURL: uploadURL });
      }
    }
  };

  return (
    <PageLayout>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <Users className="w-10 h-10 text-apricot-300" />
            <h1 className="text-4xl font-bold text-amber-900">
              Familiar Faces
            </h1>
          </div>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="bg-apricot hover:bg-apricot-400 text-amber-900 font-semibold text-lg py-3 px-6 min-h-[44px] transition-all duration-300"
            data-testid="button-add-face"
          >
            <Plus className="w-6 h-6 mr-2" />
            Add Person
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-3 gap-0">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse bg-gradient-to-br from-apricot-200 to-apricot-300 h-[500px] border-0 rounded-none">
                <CardContent className="p-6 h-full flex flex-col justify-between">
                  <div className="w-8 h-8 bg-white/50 rounded-full ml-auto" />
                  <div className="text-center space-y-3">
                    <div className="h-6 bg-white/50 rounded w-3/4 mx-auto" />
                    <div className="h-4 bg-white/40 rounded w-1/2 mx-auto" />
                    <div className="flex justify-center space-x-2">
                      <div className="w-10 h-10 bg-white/50 rounded" />
                      <div className="w-10 h-10 bg-white/50 rounded" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : familiarFaces.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-24 h-24 mx-auto mb-6 text-apricot-400" />
            <h2 className="text-3xl font-semibold text-amber-900 mb-4">
              Your Familiar Faces Gallery
            </h2>
            <p className="text-xl text-mountbatten_pink mb-8 max-w-2xl mx-auto">
              Add photos and information about the important people in your life. 
              Having their faces and names easily accessible can be very helpful.
            </p>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-apricot hover:bg-apricot-400 text-amber-900 font-semibold text-lg py-4 px-8 min-h-[44px] transition-all duration-300"
              data-testid="button-first-face"
            >
              <Plus className="w-6 h-6 mr-2" />
              Add Your First Person
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-0">
            {familiarFaces.map((face) => (
              <Card 
                key={face.id} 
                className="relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 h-[500px] border-0 rounded-none"
                style={{
                  backgroundImage: face.photoUrl && face.photoUrl !== "/placeholder-avatar.jpg" 
                    ? `linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%), url(${face.photoUrl})`
                    : 'linear-gradient(135deg, #ffc9b5 0%, #f7b1ab 50%, #d8aa96 100%)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <CardContent className="relative p-6 h-full flex flex-col justify-between">
                  {/* Upload button positioned at top right */}
                  <div className="absolute top-6 right-6">
                    <ObjectUploader
                      maxNumberOfFiles={1}
                      maxFileSize={10485760}
                      onGetUploadParameters={handleGetUploadParameters}
                      onComplete={handlePhotoUploadComplete(face.id)}
                      buttonClassName="w-14 h-14 rounded-full bg-white/90 hover:bg-white text-amber-900 p-0 min-w-[56px] transition-all duration-300 shadow-lg"
                    >
                      <Camera className="w-7 h-7" />
                    </ObjectUploader>
                  </div>

                  {/* Default user icon for cards without photos */}
                  {(!face.photoUrl || face.photoUrl === "/placeholder-avatar.jpg") && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <User className="w-52 h-52 text-white/40" />
                    </div>
                  )}
                  
                  {/* Content at bottom */}
                  <div className="mt-auto text-center px-2">
                    <h3 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">
                      {face.name}
                    </h3>
                    
                    <p className="text-2xl text-white/90 font-medium mb-5 drop-shadow-md">
                      {face.relationship}
                    </p>
                    
                    {face.description && (
                      <p className="text-white/80 mb-6 text-lg drop-shadow-md">
                        {face.description}
                      </p>
                    )}
                    
                    <div className="flex justify-center space-x-4">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => handleEdit(face)}
                        className="min-h-[52px] min-w-[52px] bg-white/90 hover:bg-white text-amber-900 border-white/50 hover:border-white transition-all duration-300"
                        data-testid={`button-edit-${face.id}`}
                      >
                        <Edit className="w-6 h-6" />
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => deleteFaceMutation.mutate(face.id)}
                        className="min-h-[52px] min-w-[52px] bg-red-500/90 hover:bg-red-600 text-white border-red-500/50 hover:border-red-600 transition-all duration-300"
                        data-testid={`button-delete-${face.id}`}
                      >
                        <Trash2 className="w-6 h-6" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={showCreateDialog || !!editingFace} onOpenChange={(open) => {
          if (!open) {
            setShowCreateDialog(false);
            setEditingFace(null);
            setFormData({ name: "", relationship: "", description: "" });
          }
        }}>
          <DialogContent className="sm:max-w-md bg-white border-amber-200">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                {editingFace ? "Edit Person" : "Add New Person"}
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
                  data-testid="input-face-name"
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
                  placeholder="e.g., Daughter, Son, Friend, Doctor"
                  className="text-lg h-12 mt-2"
                  data-testid="input-face-relationship"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-lg font-medium">
                  Notes (Optional)
                </Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Any helpful details to remember"
                  className="text-lg h-12 mt-2"
                  data-testid="input-face-description"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateDialog(false);
                    setEditingFace(null);
                    setFormData({ name: "", relationship: "", description: "" });
                  }}
                  className="min-h-[44px] text-lg px-6"
                  data-testid="button-cancel-face"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-apricot hover:bg-apricot-400 text-amber-900 min-h-[44px] text-lg px-6 transition-all duration-300"
                  disabled={createFaceMutation.isPending || updateFaceMutation.isPending}
                  data-testid="button-save-face"
                >
                  {createFaceMutation.isPending || updateFaceMutation.isPending
                    ? "Saving..." 
                    : editingFace ? "Update Person" : "Add Person"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </PageLayout>
  );
}
