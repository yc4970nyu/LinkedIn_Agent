import { Loader2 } from "lucide-react";

const LoadingIndicator = () => {
  return (
    <div className="mx-auto max-w-7xl px-6 pb-6">
      <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-5 py-4">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <div>
          <p className="text-sm font-medium text-foreground">
            Agent is working...
          </p>
          <p className="text-xs text-muted-foreground">
            Scraping profiles & generating personalized messages. This might take a minute.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingIndicator;
