import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export function MapPlaceholder() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Live Heatmap</CardTitle>
      </CardHeader>
      <CardContent className="flex h-[400px] flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed bg-muted/50 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <AlertCircle className="h-8 w-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">Map Unavailable</h3>
          <p className="text-sm text-muted-foreground">
            Please provide a Google Maps API key in your environment variables to enable the live map.
          </p>
          <p className="font-code text-xs text-muted-foreground">
            NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
