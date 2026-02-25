import { Bot, Zap } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const DashboardHeader = () => {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 glow-primary">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Louis <span className="text-primary">AI Agent</span>
            </h1>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Zap className="h-3 w-3 text-primary" />
              LinkedIn Outreach Automation
            </p>
          </div>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
};

export default DashboardHeader;
