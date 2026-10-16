export function CommunityHeader({ sub }: { sub?: string }) {
  return (
    <header className="bg-navy text-navy-foreground">
      <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4">
        <div className="shrink-0 rounded-lg bg-background p-1.5">
          <img src="/logo.svg" alt="Esia Mvetsetsa logo" className="h-8 w-8 object-contain" />
        </div>
        <div className="min-w-0">
          <div className="font-display text-lg font-bold leading-tight">Malo a Anthu</div>
          <div className="text-xs opacity-80">{sub ?? "Esia Mvetsetsa community space"}</div>
        </div>
      </div>
    </header>
  );
}