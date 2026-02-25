import { useState } from "react";
import { Search, Rocket } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchSectionProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

const SearchSection = ({ onSearch, isLoading }: SearchSectionProps) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) onSearch(query.trim());
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="rounded-xl border border-border bg-card p-6 glow-primary">
        <h2 className="mb-1 text-lg font-semibold text-foreground">
          Target Search
        </h2>
        <p className="mb-5 text-sm text-muted-foreground">
          Enter a job title and company to find and engage prospects automatically.
        </p>
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter job title (e.g. Data Scientist Amazon)"
              className="h-12 bg-background pl-10 text-sm placeholder:text-muted-foreground focus-visible:ring-primary"
              disabled={isLoading}
            />
          </div>
          <Button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="h-12 gap-2 px-6 text-sm font-semibold glow-primary-strong"
          >
            <Rocket className="h-4 w-4" />
            Start Scraping & Outreach
          </Button>
        </form>
      </div>
    </div>
  );
};

export default SearchSection;
