export default function GameRoomLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(199,125,255,0.2),rgba(255,255,255,0))]"></div>
        <main className="container mx-auto flex flex-1 flex-col items-center justify-center py-8 z-10">
            {children}
        </main>
    </div>
  );
}
