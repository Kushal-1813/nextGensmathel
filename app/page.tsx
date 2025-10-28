import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Compass, User } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-full p-4 text-center bg-background">
      <div className="space-y-4 max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-foreground/80">
          Welcome to Next Gen Connect
        </h1>
        <p className="text-xl text-muted-foreground md:text-2xl">
          Your smart helmet's best friend. Seamless navigation, real-time instructions, and a smarter ride.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="text-lg">
            <Link href="/dashboard">Get Started <ArrowRight className="ml-2" /></Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="text-lg">
            <Link href="/about">Learn More</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-20 max-w-5xl w-full">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Compass/> Smart Navigation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Get real-time, turn-by-turn directions sent directly to your helmet's display.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><User/> Personalized</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Create an account to save routes and customize your experience (coming soon!).</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
