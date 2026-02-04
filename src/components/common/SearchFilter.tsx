import { Search, Filter, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface SearchFilterProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: FilterState) => void;
  routes: string[];
}

interface FilterState {
  route: string;
  status: string;
}

const SearchFilter = ({ onSearch, onFilterChange, routes }: SearchFilterProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({ route: "", status: "" });

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    setFilters({ route: "", status: "" });
    setSearchQuery("");
    onSearch("");
    onFilterChange({ route: "", status: "" });
  };

  const hasActiveFilters = filters.route || filters.status || searchQuery;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by bus name or route..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="input-field pl-12"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearchChange("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <Button
          variant={showFilters ? "secondary" : "outline"}
          onClick={() => setShowFilters(!showFilters)}
          className="shrink-0"
        >
          <Filter className="w-4 h-4" />
          Filters
        </Button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="glass-card rounded-xl p-4 animate-scale-in">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium text-foreground mb-2 block">Route</label>
              <select
                value={filters.route}
                onChange={(e) => handleFilterChange("route", e.target.value)}
                className="input-field"
              >
                <option value="">All Routes</option>
                {routes.map((route) => (
                  <option key={route} value={route}>
                    {route}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium text-foreground mb-2 block">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="input-field"
              >
                <option value="">All Status</option>
                <option value="on-time">On Time</option>
                <option value="delayed">Delayed</option>
                <option value="arriving">Arriving Soon</option>
                <option value="departed">Departed</option>
              </select>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex justify-end mt-4 pt-4 border-t border-border/50">
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="w-4 h-4" />
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchFilter;
