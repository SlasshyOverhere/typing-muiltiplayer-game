import { Suspense } from 'react';
import GameContainer from './GameContainer';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function GameLoadingSkeleton() {
  return (
    <Card className="w-full max-w-4xl">
      <CardContent className="p-6">
        <Skeleton className="h-8 w-1/2 mb-4" />
        <div className="space-y-2 mb-6">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <Skeleton className="h-24 w-full" />
      </CardContent>
    </Card>
  );
}

export default async function GamePage({
  params,
  searchParams,
}: {
  params: Promise<{ roomId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { roomId } = await params;
  const searchParamsData = await searchParams;
  const playerId = searchParamsData?.playerId as string | undefined;

  return (
    <Suspense fallback={<GameLoadingSkeleton />}>
      <GameContainer roomId={roomId} localPlayerId={playerId} />
    </Suspense>
  );
}
