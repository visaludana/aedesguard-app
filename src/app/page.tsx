import { AedesGuardLogo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Check, Map, Shield } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b">
        <Link href="#" className="flex items-center justify-center gap-2">
          <AedesGuardLogo className="h-6 w-6 text-primary" />
          <span className="font-semibold text-lg">AedesGuard AI</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Button asChild variant="ghost">
            <Link href="/login">Sign In</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Get Started</Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-card">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-primary">
                    Proactive Dengue Prevention with AI
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    AedesGuard AI is an advanced entomological surveillance system empowering communities and health
                    officials to report, verify, and analyze mosquito breeding sites in real-time.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                   <Button asChild size="lg">
                    <Link href="/signup">Get Started Free</Link>
                  </Button>
                   <Button asChild size="lg" variant="outline">
                    <Link href="/public-dashboard">View Public Dashboard</Link>
                  </Button>
                </div>
              </div>
              <img
                src="https://picsum.photos/seed/map/600/400"
                width="600"
                height="400"
                alt="Hero Map"
                data-ai-hint="map satellite"
                className="mx-auto aspect-[3/2] overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
              />
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Key Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">A Healthier Tomorrow, Today</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Empowering communities and health officials with cutting-edge technology to combat mosquito-borne diseases.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-4 mt-12">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Shield className="h-5 w-5 text-primary" /> AI Reporting
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Instantly report potential breeding sites with photo uploads. Our AI classifies larvae and assesses risk in real-time.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Map className="h-5 w-5 text-primary" /> Live Map
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Visualize reported hotspots on an interactive map. Track active and neutralized sites across all districts.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Check className="h-5 w-5 text-primary" /> Verification
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Close the loop by verifying site neutralization with follow-up photos, powered by our visual comparison AI.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BarChart className="h-5 w-5 text-primary" /> Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Health officials get a dedicated console to analyze trends, track cases, and manage public health responses.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 AedesGuard AI. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
