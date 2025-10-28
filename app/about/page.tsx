import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-4xl p-4 py-8">
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            About Next Gen Connect
          </h1>
          <p className="mt-4 text-xl text-muted-foreground">
            The future of motorcycle navigation is here.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Our Mission</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Next Gen Connect was born from a passion for both technology and the open road. Our mission is to enhance the motorcycle riding experience by providing a safer, more intuitive way to navigate. We believe that by integrating smart technology directly into your helmet, you can keep your eyes on the road and your hands on the handlebars, without sacrificing clarity in your directions.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Our system is a powerful yet simple combination of your smartphone, our web application, and a custom-built ESP32-powered device in your helmet.
            </p>
            <ol className="list-decimal list-inside space-y-2">
              <li><strong>Plan Your Route:</strong> Use our app to find your destination. We use Google Maps for up-to-date, reliable routing.</li>
              <li><strong>Connect Your Helmet:</strong> Pair your helmet via Bluetooth LE with a single click. Our Web Bluetooth integration makes it seamless.</li>
              <li><strong>Start Your Trip:</strong> The app tracks your location in real-time. As you approach each turn, it sends a simplified instruction to your helmet.</li>
              <li><strong>See the Way:</strong> Our AI backend processes the instruction into a simple, clear visual (like an arrow and distance) for your helmet's OLED display.</li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Key Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary mt-1 shrink-0" />
                <div>
                  <h3 className="font-semibold">Real-Time GPS Navigation</h3>
                  <p className="text-muted-foreground text-sm">Live tracking ensures you get the right instruction at the right time.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary mt-1 shrink-0" />
                <div>
                  <h3 className="font-semibold">Bluetooth LE Connectivity</h3>
                  <p className="text-muted-foreground text-sm">Low-energy and reliable connection to your custom ESP32 device.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary mt-1 shrink-0" />
                <div>
                  <h3 className="font-semibold">AI-Powered Instruction Simplification</h3>
                  <p className="text-muted-foreground text-sm">Verbose directions are converted into easy-to-read visual cues.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary mt-1 shrink-0" />
                <div>
                  <h3 className="font-semibold">Mobile-Friendly Interface</h3>
                  <p className="text-muted-foreground text-sm">Plan and manage your trips easily from your smartphone.</p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
