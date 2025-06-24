import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Lock, Unlock, RotateCcw } from "lucide-react";
import { DECA_EVENTS } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Form schemas
const profileSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email address").optional(),
});

const eventChangeSchema = z.object({
  selectedEvent: z.string().min(1, "Please select an event"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type EventChangeFormValues = z.infer<typeof eventChangeSchema>;

export default function SettingsNewPage() {
  const { toast } = useToast();
  const [showEventChangeDialog, setShowEventChangeDialog] = useState(false);

  // Get current user data
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["/api/user"],
    queryFn: async () => {
      const res = await fetch("/api/user", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load user data");
      return res.json();
    },
  });

  // Find user's current event
  const userEvent = user?.selectedEvent ? DECA_EVENTS.find(event => event.code === user.selectedEvent) : null;
  const canChangeEvent = !user?.hasChangedEvent;

  // Profile form setup
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username || "",
      email: user?.email || "",
    },
  });

  // Event change form setup
  const eventForm = useForm<EventChangeFormValues>({
    resolver: zodResolver(eventChangeSchema),
    defaultValues: {
      selectedEvent: user?.selectedEvent || "",
    },
  });

  // Update profile mutation
  const updateProfile = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      return apiRequest(`/api/user/profile`, {
        method: "PUT",
        body: data,
      });
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  // Change event mutation
  const changeEvent = useMutation({
    mutationFn: async (data: EventChangeFormValues) => {
      return apiRequest(`/api/user/change-event`, {
        method: "PUT",
        body: data,
      });
    },
    onSuccess: () => {
      toast({
        title: "Event Changed",
        description: "Your DECA event has been updated. This was your one-time change.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setShowEventChangeDialog(false);
    },
    onError: (error: any) => {
      toast({
        title: "Change Failed",
        description: error.message || "Failed to change event",
        variant: "destructive",
      });
    },
  });

  const onProfileSubmit = (data: ProfileFormValues) => {
    updateProfile.mutate(data);
  };

  const onEventSubmit = (data: EventChangeFormValues) => {
    changeEvent.mutate(data);
  };

  if (userLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader
        title="Settings"
        subtitle="Manage your account preferences and settings"
      />
      
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          {/* Profile Settings */}
          <Card className="bg-background/60 backdrop-blur-sm border-muted">
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="username" className="text-foreground/80">Username</Label>
                  <Input
                    id="username"
                    {...profileForm.register("username")}
                    className="bg-background/80 mt-2"
                  />
                  {profileForm.formState.errors.username && (
                    <p className="text-destructive text-sm mt-1">
                      {profileForm.formState.errors.username.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email" className="text-foreground/80">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...profileForm.register("email")}
                    className="bg-background/80 mt-2"
                    placeholder="Your email address"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    This email will be used for notifications and account recovery.
                  </p>
                  {profileForm.formState.errors.email && (
                    <p className="text-destructive text-sm mt-1">
                      {profileForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  disabled={updateProfile.isPending}
                  className="w-full"
                >
                  {updateProfile.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* DECA Event */}
          <Card className="bg-background/60 backdrop-blur-sm border-muted">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {userEvent ? <Unlock className="w-5 h-5 text-green-600" /> : <Lock className="w-5 h-5 text-muted-foreground" />}
                DECA Event
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userEvent ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-lg font-medium text-foreground">{userEvent.name}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary">{userEvent.type}</Badge>
                      <Badge variant="outline">{userEvent.cluster}</Badge>
                    </div>
                  </div>
                  
                  {canChangeEvent ? (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-medium text-yellow-800 dark:text-yellow-200">One-Time Change Available</h4>
                          <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                            You can change your DECA event once. After changing, this option will be permanently locked.
                          </p>
                          <Dialog open={showEventChangeDialog} onOpenChange={setShowEventChangeDialog}>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="mt-3">
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Change Event
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                                  Change DECA Event
                                </DialogTitle>
                                <DialogDescription>
                                  This is your one-time opportunity to change your DECA event. Once changed, you cannot modify it again.
                                </DialogDescription>
                              </DialogHeader>
                              <form onSubmit={eventForm.handleSubmit(onEventSubmit)} className="space-y-4">
                                <div>
                                  <Label className="text-foreground/80">Select New Event</Label>
                                  <Select 
                                    value={eventForm.watch("selectedEvent")}
                                    onValueChange={(value) => eventForm.setValue("selectedEvent", value)}
                                  >
                                    <SelectTrigger className="w-full bg-background/80 mt-2">
                                      <SelectValue placeholder="Choose your new DECA event" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {DECA_EVENTS.map((event) => (
                                        <SelectItem key={event.code} value={event.code}>
                                          {event.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="flex gap-2">
                                  <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={() => setShowEventChangeDialog(false)}
                                    className="flex-1"
                                  >
                                    Cancel
                                  </Button>
                                  <Button 
                                    type="submit" 
                                    disabled={changeEvent.isPending}
                                    className="flex-1"
                                  >
                                    {changeEvent.isPending ? "Changing..." : "Confirm Change"}
                                  </Button>
                                </div>
                              </form>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Lock className="w-5 h-5 text-gray-500 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-gray-700 dark:text-gray-300">Event Locked</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            You have already used your one-time event change. Your event is now permanently set.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-medium text-foreground mb-2">No Event Selected</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    You need to complete the onboarding process to select your DECA event.
                  </p>
                  <Button onClick={() => window.location.href = "/"}>
                    Complete Setup
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="bg-background/60 backdrop-blur-sm border-muted">
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Notification settings coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card className="bg-background/60 backdrop-blur-sm border-muted">
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Appearance settings coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}