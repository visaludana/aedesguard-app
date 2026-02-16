'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebase, useUser, errorEmitter } from '@/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { AedesGuardLogo } from '@/components/icons';
import type { UserProfile } from '@/lib/types';
import { FirestorePermissionError } from '@/firebase/errors';

export default function SignupPage() {
  const { auth, firestore } = useFirebase();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!auth || !firestore) {
      setError("Authentication service is not available.");
      setIsLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;
      
      // Also update the user's profile in Firebase Auth
      await updateProfile(newUser, { displayName });

      // Create user profile document in Firestore
      const userProfile: UserProfile = {
        id: newUser.uid,
        displayName,
        email: newUser.email!,
        points: 0,
        lastActivityAt: new Date().toISOString(),
      };

      const userDocRef = doc(firestore, 'users', newUser.uid);
      
      // Use setDoc with a .catch for permission errors, then await it
      await setDoc(userDocRef, userProfile)
        .catch(err => {
            const contextualError = new FirestorePermissionError({
                operation: 'create',
                path: userDocRef.path,
                requestResourceData: userProfile,
            });
            errorEmitter.emit('permission-error', contextualError);
            // This re-throws the error to be caught by the outer try-catch block
            throw new Error("Could not create user profile. You may not have permissions.");
        });

      // The useEffect will handle the redirect
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('This email address is already in use by another account.');
      } else {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isUserLoading || (!isUserLoading && user)) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <Loader2 className="h-12 w-12 animate-spin" />
        </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 flex items-center gap-2">
        <AedesGuardLogo className="h-8 w-8 text-primary" />
        <span className="text-2xl font-semibold">AedesGuard AI</span>
      </div>
      <Card className="w-full max-w-sm">
        <form onSubmit={handleSignup}>
          <CardHeader>
            <CardTitle>Create an Account</CardTitle>
            <CardDescription>Join the community to help fight dengue.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="Nimal Perera"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nimal@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign Up
            </Button>
            {error && (
              <Alert variant="destructive">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Signup Failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
             <p className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/login" className="font-semibold text-primary hover:underline">
                    Sign In
                </Link>
             </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
