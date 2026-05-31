export const Footer = () => {
  return (
    <footer className="px-6 pb-8">
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-between gap-2 border-t border-ink/10 pt-6 text-xs text-ink/40 sm:flex-row">
        <span className="font-bold text-ink/60">Quiz Attaché Territorial</span>
        <span>Préparation concours · Session 2026</span>
        <span>&copy; {new Date().getFullYear()}</span>
      </div>
    </footer>
  );
};
