import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageLayout } from "@/components/PageLayout";
import { ObjectUploader } from "@/components/ObjectUploader";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { Book, Plus, Edit, Trash2, Camera, Calendar, Mic, Volume2 } from "lucide-react";
import { Memory } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { UploadResult } from "@uppy/core";

export default function MemoryJournalPage() {
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: ""
  });
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);

  const { data: memories = [], isLoading } = useQuery<Memory[]>({
    queryKey: ["/api/memories"],
  });

  const createMemoryMutation = useMutation({
    mutationFn: async (data: { title: string; content?: string; audioUrl?: string }) => {
      const res = await apiRequest("POST", "/api/memories", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/memories"] });
      setShowCreateDialog(false);
      setFormData({ title: "", content: "" });
      setRecordedAudioBlob(null);
      toast({
        title: "Success",
        description: "Memory saved successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save memory",
        variant: "destructive"
      });
    }
  });

  const updateMemoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Memory> }) => {
      const res = await apiRequest("PUT", `/api/memories/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/memories"] });
      setEditingMemory(null);
      setFormData({ title: "", content: "" });
      setRecordedAudioBlob(null);
      toast({
        title: "Success",
        description: "Memory updated successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update memory",
        variant: "destructive"
      });
    }
  });

  const deleteMemoryMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/memories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/memories"] });
      toast({
        title: "Success",
        description: "Memory deleted successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete memory",
        variant: "destructive"
      });
    }
  });

  const addPhotoMutation = useMutation({
    mutationFn: async ({ id, photoURL }: { id: string; photoURL: string }) => {
      const res = await apiRequest("PUT", `/api/memories/${id}/photos`, { photoURL });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/memories"] });
      toast({
        title: "Success",
        description: "Photo added to memory"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add photo",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title for your memory",
        variant: "destructive"
      });
      return;
    }

    let audioUrl = undefined;

    // Upload audio if we have a new recording
    if (recordedAudioBlob) {
      try {
        const uploadParams = await handleGetUploadParameters();
        const audioUploadResponse = await fetch(uploadParams.url, {
          method: uploadParams.method,
          body: recordedAudioBlob,
          headers: {
            'Content-Type': recordedAudioBlob.type
          }
        });

        if (audioUploadResponse.ok) {
          audioUrl = uploadParams.url.split('?')[0]; // Remove query parameters to get the clean URL
        }
      } catch (error) {
        console.error('Error uploading audio:', error);
        toast({
          title: "Warning",
          description: "Voice recording could not be saved, but your memory will be saved without it",
          variant: "destructive"
        });
      }
    }

    if (editingMemory) {
      updateMemoryMutation.mutate({
        id: editingMemory.id,
        data: { ...formData, ...(audioUrl && { audioUrl }) }
      });
    } else {
      createMemoryMutation.mutate({ ...formData, ...(audioUrl && { audioUrl }) });
    }
  };

  const handleEdit = (memory: Memory) => {
    setEditingMemory(memory);
    setFormData({
      title: memory.title,
      content: memory.content || ""
    });
    setRecordedAudioBlob(null); // Clear any new recording when editing
  };

  const handleGetUploadParameters = async () => {
    const res = await apiRequest("POST", "/api/objects/upload");
    const { uploadURL } = await res.json();
    return {
      method: "PUT" as const,
      url: uploadURL,
    };
  };

  const handlePhotoUploadComplete = (memoryId: string) => (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful && result.successful.length > 0) {
      const uploadURL = result.successful[0].uploadURL;
      if (uploadURL) {
        addPhotoMutation.mutate({ id: memoryId, photoURL: uploadURL });
      }
    }
  };

  return (
    <PageLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mr-4">
              <Book className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Memory Journal</h1>
              <p className="text-gray-600 mt-1">Capture and preserve your special moments</p>
            </div>
          </div>
          <Button
            onClick={() => {
              setEditingMemory(null);
              setFormData({ title: "", content: "" });
              setRecordedAudioBlob(null);
              setShowCreateDialog(true);
            }}
            className="bg-primary hover:bg-primary/90 text-white min-h-[44px]"
            data-testid="button-create-memory"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Memory
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : memories.length === 0 ? (
          <div className="text-center py-16">
            <Book className="w-24 h-24 mx-auto mb-6 text-gray-400" />
            <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-4">
              Start Your Memory Journal
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Capture precious moments, thoughts, and experiences. Your memories are important - 
              let's preserve them together.
            </p>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold text-lg py-4 px-8 min-h-[44px]"
              data-testid="button-first-memory"
            >
              <Plus className="w-6 h-6 mr-2" />
              Create Your First Memory
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {memories.map((memory) => (
              <Card key={memory.id} className="card-hover">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {memory.title}
                      </CardTitle>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(memory.createdAt!).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(memory)}
                        className="min-h-[44px] min-w-[44px]"
                        data-testid={`button-edit-${memory.id}`}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMemoryMutation.mutate(memory.id)}
                        className="min-h-[44px] min-w-[44px] text-red-500 hover:text-red-700"
                        data-testid={`button-delete-${memory.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {memory.content && (
                    <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
                      {memory.content}
                    </p>
                  )}
                  
                  {memory.photoUrls && memory.photoUrls.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {memory.photoUrls.slice(0, 4).map((photoUrl, index) => (
                        <img
                          key={index}
                          src={photoUrl}
                          alt={`Memory photo ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                      ))}
                      {memory.photoUrls.length > 4 && (
                        <div className="w-full h-24 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          <span className="text-gray-600 dark:text-gray-400 font-medium">
                            +{memory.photoUrls.length - 4} more
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {memory.audioUrl && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Volume2 className="w-5 h-5 text-blue-600" />
                          <span className="text-blue-900 font-medium">Voice Recording</span>
                        </div>
                        <audio 
                          controls 
                          src={memory.audioUrl}
                          className="h-8"
                          data-testid={`audio-${memory.id}`}
                        >
                          Your browser does not support audio playback.
                        </audio>
                      </div>
                    </div>
                  )}

                  <ObjectUploader
                    maxNumberOfFiles={5}
                    maxFileSize={10485760}
                    onGetUploadParameters={handleGetUploadParameters}
                    onComplete={handlePhotoUploadComplete(memory.id)}
                    buttonClassName="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 min-h-[44px]"
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    Add Photos
                  </ObjectUploader>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={showCreateDialog || !!editingMemory} onOpenChange={(open) => {
          if (!open) {
            setShowCreateDialog(false);
            setEditingMemory(null);
            setFormData({ title: "", content: "" });
            setRecordedAudioBlob(null);
          }
        }}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                {editingMemory ? "Edit Memory" : "Create New Memory"}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title" className="text-lg font-medium">
                  Title
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="What would you like to remember?"
                  className="text-lg h-12 mt-2"
                  data-testid="input-memory-title"
                  required
                />
              </div>

              <div>
                <Label htmlFor="content" className="text-lg font-medium">
                  Memory Details
                </Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Tell the story of this memory..."
                  className="text-lg mt-2 min-h-[120px]"
                  data-testid="textarea-memory-content"
                  rows={6}
                />
              </div>

              <div>
                <Label className="text-lg font-medium flex items-center">
                  <Mic className="w-5 h-5 mr-2 text-amber-600" />
                  Voice Recording
                </Label>
                <p className="text-sm text-gray-600 mb-3">
                  Record a voice note to go with your memory - perfect for capturing emotions and details
                </p>
                <VoiceRecorder
                  onRecordingComplete={setRecordedAudioBlob}
                  onRecordingClear={() => setRecordedAudioBlob(null)}
                  existingAudioUrl={editingMemory?.audioUrl}
                  disabled={createMemoryMutation.isPending || updateMemoryMutation.isPending}
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateDialog(false);
                    setEditingMemory(null);
                    setFormData({ title: "", content: "" });
                    setRecordedAudioBlob(null);
                  }}
                  className="min-h-[44px] text-lg px-6"
                  data-testid="button-cancel-memory"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white min-h-[44px] text-lg px-6"
                  disabled={createMemoryMutation.isPending || updateMemoryMutation.isPending}
                  data-testid="button-save-memory"
                >
                  {createMemoryMutation.isPending || updateMemoryMutation.isPending
                    ? "Saving..." 
                    : editingMemory ? "Update Memory" : "Save Memory"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  );
}
