import { useNavigate } from "react-router-dom";

type BackButtonProps = {
  fallbackTo?: string;
  label?: string;
  className?: string;
};

export function BackButton({ fallbackTo = "/", label = "Back", className = "" }: BackButtonProps) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => {
        if (window.history.length > 1) {
          navigate(-1);
          return;
        }
        navigate(fallbackTo);
      }}
      className={`inline-flex items-center gap-2 rounded-lg border border-border-green bg-white px-3 py-2 text-sm font-semibold text-text-leaf transition-colors hover:bg-soft-green dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 ${className}`}
    >
      <span className="material-symbols-outlined text-base">arrow_back</span>
      {label}
    </button>
  );
}
