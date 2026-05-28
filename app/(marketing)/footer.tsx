export const Footer = () => {
  return (
    <footer className="border-t border-slate-100">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5 text-xs text-slate-400">
        <span className="font-medium text-slate-500">Quiz Attaché Territorial</span>
        <span>Préparation concours · Session 2026</span>
        <span>&copy; {new Date().getFullYear()}</span>
      </div>
    </footer>
  );
};
