import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AuthUser } from "@/hooks/useAuthState";

interface AuthGateProps {
  open: boolean;
  onClose: () => void;
  onSignIn: (user: AuthUser) => void;
  onContinueAsGuest: () => void;
}

export function AuthGate({ open, onClose, onSignIn, onContinueAsGuest }: AuthGateProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md rounded-t-3xl border border-border bg-card p-7 shadow-lift sm:rounded-3xl"
      >
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" strokeWidth={1.75} />
        </button>

        <div className="text-center">
          <h2 className="text-[20px] font-semibold tracking-tight text-foreground">
            Sincronize seu progresso
          </h2>
          <p className="mx-auto mt-2 max-w-xs text-[13px] leading-relaxed text-muted-foreground">
            Crie uma conta gratuita para sincronizar seu progresso e acessar recursos online.
          </p>
        </div>

        <div className="mt-7 flex flex-col gap-2.5">
          <Button
            variant="outline"
            size="lg"
            onClick={() => onSignIn({ name: "Convidado Google", provider: "google" })}
            className="h-12 w-full rounded-xl border-border bg-card text-[14px] font-medium hover:bg-muted"
          >
            <GoogleIcon />
            Entrar com Google
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => onSignIn({ name: "Convidado Apple", provider: "apple" })}
            className="h-12 w-full rounded-xl border-border bg-card text-[14px] font-medium hover:bg-muted"
          >
            <AppleIcon />
            Entrar com Apple
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => onSignIn({ name: "Convidado", provider: "email" })}
            className="h-12 w-full rounded-xl border-border bg-card text-[14px] font-medium hover:bg-muted"
          >
            Entrar com e-mail
          </Button>
        </div>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            ou
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <Button
          variant="ghost"
          size="lg"
          onClick={onContinueAsGuest}
          className="h-12 w-full rounded-xl text-[14px] font-medium text-foreground hover:bg-muted"
        >
          Continuar sem conta
        </Button>

        <p className="mt-4 text-center text-[11px] leading-relaxed text-muted-foreground/80">
          Seu progresso local será preservado. Você pode criar uma conta depois, quando precisar.
        </p>
      </motion.div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-foreground" aria-hidden>
      <path d="M17.05 12.04c-.03-2.6 2.12-3.85 2.22-3.91-1.21-1.77-3.09-2.01-3.76-2.04-1.6-.16-3.12.94-3.93.94-.81 0-2.06-.92-3.39-.89-1.74.03-3.35 1.01-4.25 2.56-1.81 3.14-.46 7.78 1.3 10.33.86 1.25 1.88 2.65 3.22 2.6 1.3-.05 1.79-.83 3.36-.83 1.57 0 2.02.83 3.4.81 1.4-.03 2.3-1.27 3.16-2.53 1-1.46 1.41-2.88 1.43-2.95-.03-.01-2.74-1.05-2.76-4.09zM14.7 4.75c.72-.87 1.2-2.08 1.07-3.28-1.03.04-2.28.69-3.02 1.56-.66.77-1.24 2-1.09 3.18 1.15.09 2.32-.59 3.04-1.46z" />
    </svg>
  );
}
