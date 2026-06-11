export default function MobileHeader() {
  return (
    <header className="md:hidden sticky top-0 z-40 border-b-2 border-primary bg-surface-container px-4 py-3 shadow-[0_4px_12px_-4px_rgba(51,75,70,0.12)]">
      <h1 className="font-headline text-lg font-semibold text-on-surface leading-tight">Kalvio</h1>
      <p className="font-label text-[10px] text-on-surface-variant tracking-wider mt-0.5">
        Semester 5
      </p>
    </header>
  );
}
