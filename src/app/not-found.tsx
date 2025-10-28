'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, SearchX } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto bg-destructive/20 text-destructive rounded-full p-4 w-fit">
            <SearchX className="h-12 w-12" />
          </div>
          <CardTitle className="text-3xl font-headline mt-4">
            404 - Room Not Found
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            The game room you're looking for doesn't exist or may have been deleted.
          </p>
          <Button asChild className="mt-6">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Return to Homepage
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
