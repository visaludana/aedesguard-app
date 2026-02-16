import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, ClipboardPlus } from 'lucide-react';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function OfficerDashboardPage() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Health Officer Tools</CardTitle>
          <CardDescription>
            Report daily health statistics and view analytics for all districts.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/health-report"
            className={cn(
              buttonVariants({ variant: 'default' }),
              'h-20 text-base py-2 flex items-center justify-start text-left w-full'
            )}
          >
            <ClipboardPlus className="mr-4 h-8 w-8" />
            <div>
              <p className="font-semibold text-lg">Report Cases & Deaths</p>
              <p className="font-normal text-sm text-primary-foreground/80">
                Submit daily statistics for your district.
              </p>
            </div>
          </Link>
          <Link
            href="/admin-console"
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'h-20 text-base py-2 flex items-center justify-start text-left w-full'
            )}
          >
            <BarChart className="mr-4 h-8 w-8" />
            <div>
              <p className="font-semibold text-lg">View Health Analytics</p>
              <p className="font-normal text-sm text-muted-foreground">
                Analyze trends across all districts.
              </p>
            </div>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
