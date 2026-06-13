import { KalvioBrand } from "./KalvioLogo";

interface ConfigErrorProps {
  title?: string;
  message: string;
}

export default function ConfigError({
  title = "Kalvio is not configured yet",
  message,
}: ConfigErrorProps) {
  return (
    <div className="min-h-screen bg-surface paper-texture flex items-center justify-center p-6">
      <div className="hand-drawn-border charcoal-shadow-lg bg-surface-container w-full max-w-md p-8 text-center">
        <KalvioBrand size="lg" className="mb-6" />
        <h1 className="font-headline text-lg text-primary mb-3">{title}</h1>
        <p className="font-body text-sm text-on-surface-variant whitespace-pre-line">{message}</p>
      </div>
    </div>
  );
}
