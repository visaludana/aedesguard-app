'use client';

import { useState, useEffect } from 'react';
import { useFirebase, useDoc, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import type { UserProfile } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, ShieldAlert } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function SettingsPage() {
  const { auth, firestore, user, isUserLoading } = useFirebase();
  const { toast } = useToast();
  
  const userProfileRef = useMemoFirebase(() => (firestore && user ? doc(firestore, 'users', user.uid) : null), [firestore, user]);
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setPhotoURL(user.photoURL || '');
    }
    if (userProfile) {
      setIdNumber(userProfile.idNumber || '');
      setMobileNumber(userProfile.mobileNumber || '');
      // If display name or photoURL in firestore is more up-to-date, you could use it here.
      if (userProfile.displayName) setDisplayName(userProfile.displayName);
      if (userProfile.photoURL) setPhotoURL(userProfile.photoURL);
    }
  }, [user, userProfile]);

  const handleSave = async () => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to save settings.' });
      return;
    }

    setIsSaving(true);
    try {
      const updatedAuthProfile: { displayName?: string; photoURL?: string } = {};
      if (displayName !== user.displayName) updatedAuthProfile.displayName = displayName;
      if (photoURL !== user.photoURL) updatedAuthProfile.photoURL = photoURL;

      if (Object.keys(updatedAuthProfile).length > 0) {
        await updateProfile(user, updatedAuthProfile);
      }

      const userDocRef = doc(firestore, 'users', user.uid);
      const updatedFirestoreProfile: Partial<UserProfile> = {
        displayName,
        photoURL,
        idNumber,
        mobileNumber,
        lastActivityAt: new Date().toISOString(),
      };

      await updateDoc(userDocRef, updatedFirestoreProfile).catch(err => {
        const contextualError = new FirestorePermissionError({
            operation: 'update',
            path: userDocRef.path,
            requestResourceData: updatedFirestoreProfile,
        });
        errorEmitter.emit('permission-error', contextualError);
        throw new Error("You do not have permission to update this profile.");
      });

      toast({ title: 'Success', description: 'Your profile has been updated.' });

    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({ variant: 'destructive', title: 'Update Failed', description: error.message || 'Could not save your changes.' });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isUserLoading || isProfileLoading) {
    return <SettingsSkeleton />;
  }

  if (!user) {
      return (
          <Alert variant="destructive" className="max-w-2xl mx-auto">
              <ShieldAlert className="h-4 w-4" />
              <AlertTitle>Access Denied</AlertTitle>
              <AlertDescription>
                  You must be logged in to view your settings.
              </AlertDescription>
          </Alert>
      );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>Manage your public profile and personal information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={photoURL} alt={displayName} />
              <AvatarFallback>
                <User className="h-10 w-10" />
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2 flex-1">
              <Label htmlFor="photoURL">Profile Picture URL</Label>
              <Input
                id="photoURL"
                placeholder="https://example.com/image.png"
                value={photoURL}
                onChange={(e) => setPhotoURL(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" value={user.email || ''} readOnly disabled />
            <p className="text-xs text-muted-foreground">Email addresses cannot be changed.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="idNumber">ID Number (Optional)</Label>
              <Input
                id="idNumber"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                placeholder="e.g., 901234567V"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobileNumber">Mobile Number (Optional)</Label>
              <Input
                id="mobileNumber"
                type="tel"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="e.g., 0771234567"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

const SettingsSkeleton = () => (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
             <Skeleton className="h-20 w-20 rounded-full" />
             <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
             </div>
          </div>
           <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
           </div>
           <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                 <Skeleton className="h-4 w-32" />
                 <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                 <Skeleton className="h-4 w-32" />
                 <Skeleton className="h-10 w-full" />
              </div>
            </div>
        </CardContent>
        <CardFooter>
            <Skeleton className="h-10 w-32" />
        </CardFooter>
      </Card>
    </div>
);
