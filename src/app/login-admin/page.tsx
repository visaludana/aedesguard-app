'use client';

import { useState, useEffect } from 'react';
import { useFirebase, useUser } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { AedesGuardLogo } from '@/components/icons';

const ADMIN_EMAIL = 'admin@aedesguard.com';

export default function AdminLoginPage() {
  const { auth } = useFirebase();
  const { user, isUserLoading } = useUser();

  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect a logged in user to the console.
  useEffect(() => {
    if (!isUserLoading && user) {
      window.location.href = '/admin-console';
    }
  }, [user, isUserLoading]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!auth) {
        setError("Authentication service is not available.");
        setIsLoading(false);
        return;
    }

    try {
      await signInWithEmailAndPassword(auth, ADMIN_EMAIL, password);
      window.location.href = '/admin-console';
    } catch (err: any) {
      switch (err.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          setError('Invalid administrator credentials.');
          break;
        default:
          setError('An unexpected error occurred. Please try again later.');
          break;
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isUserLoading || user) {
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
        <form onSubmit={handleLogin}>
          <CardHeader>
            <CardTitle>Admin Console Login</CardTitle>
            <CardDescription>Enter your administrator password.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
            
            {error && (
              <Alert variant="destructive">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Login Failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
             <p className="text-center text-sm text-muted-foreground">
                Not an administrator?{' '}
                <Link href="/login" className="font-semibold text-primary hover:underline">
                    Go to user login
                </Link>
             </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
