import { Link } from "react-router-dom";

type LogoProps = { className?: string };

export function Logo({ className = "" }: LogoProps) {
  return (
    <Link to="/" className={`flex items-center gap-2 group cursor-pointer ${className}`}>
      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-background-dark">
        <span className="material-symbols-outlined font-bold">eco</span>
      </div>
      <h2 className="text-xl font-extrabold tracking-tight dark:text-white text-text-leaf">
        EventLeaf
      </h2>
    </Link>
  );
}
