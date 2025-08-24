"use client";

import { useState } from "react";
import { SearchForm } from "@/components/planner/SearchForm";
import { SailingResults } from "@/components/planner/SailingResults";
import type { PortRef, Sailing } from "@sprutnet/shared/types";

export default function PlannerPage() {
  const [searchResults, setSearchResults] = useState<Sailing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (
    originPort: PortRef | null,
    destinationPort: PortRef | null,
    departureDateFrom: Date | null,
    departureDateTo: Date | null
  ) => {
    if (!originPort || !destinationPort) {
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      const params = new URLSearchParams({
        originPortId: originPort.id,
        destinationPortId: destinationPort.id,
        limit: "10",
      });

      if (departureDateFrom) {
        params.append("departureDateFrom", departureDateFrom.toISOString());
      }
      if (departureDateTo) {
        params.append("departureDateTo", departureDateTo.toISOString());
      }

      const response = await fetch(`/api/schedules?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch schedules");
      }

      const data = await response.json();
      setSearchResults(data.sailings || []);
    } catch (error) {
      console.error("Error searching schedules:", error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Shipping Planner
          </h1>
          <p className="text-gray-600">
            Найдите оптимальные морские маршруты для ваших грузов
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <SearchForm onSearch={handleSearch} isLoading={isLoading} />
        </div>

        {/* Results */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <SailingResults
            sailings={searchResults}
            isLoading={isLoading}
            hasSearched={hasSearched}
          />
        </div>
      </div>
    </div>
  );
}
