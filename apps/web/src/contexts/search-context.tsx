"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { PortRef } from "@sprutnet/shared/types";

interface SearchState {
  originPort: PortRef | null;
  destinationPort: PortRef | null;
  departureDateFrom: Date | null;
  departureDateTo: Date | null;
  searchResults: any[];
}

interface SearchContextType {
  searchState: SearchState;
  setOriginPort: (port: PortRef | null) => void;
  setDestinationPort: (port: PortRef | null) => void;
  setDepartureDateFrom: (date: Date | null) => void;
  setDepartureDateTo: (date: Date | null) => void;
  setSearchResults: (results: any[]) => void;
  clearSearch: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

const STORAGE_KEY = "sprutnet_search_state";

const getInitialState = (): SearchState => {
  return {
    originPort: null,
    destinationPort: null,
    departureDateFrom: null,
    departureDateTo: null,
    searchResults: [],
  };
};

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [searchState, setSearchState] = useState<SearchState>(getInitialState);
  const [isInitialized, setIsInitialized] = useState(false);

  // Загружаем данные из localStorage после монтирования
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          const loadedState: SearchState = {
            originPort: parsed.originPort ? { ...parsed.originPort } : null,
            destinationPort: parsed.destinationPort
              ? { ...parsed.destinationPort }
              : null,
            departureDateFrom: parsed.departureDateFrom
              ? new Date(parsed.departureDateFrom)
              : null,
            departureDateTo: parsed.departureDateTo
              ? new Date(parsed.departureDateTo)
              : null,
            searchResults: parsed.searchResults || [],
          };
          setSearchState(loadedState);
        }
      } catch (error) {
        console.error("Error loading search state from localStorage:", error);
      }
      setIsInitialized(true);
    }
  }, []);

  const saveToStorage = (newState: SearchState) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      } catch (error) {
        console.error("Error saving search state to localStorage:", error);
      }
    }
  };

  const setOriginPort = (port: PortRef | null) => {
    const newState = { ...searchState, originPort: port };
    setSearchState(newState);
    saveToStorage(newState);
  };

  const setDestinationPort = (port: PortRef | null) => {
    const newState = { ...searchState, destinationPort: port };
    setSearchState(newState);
    saveToStorage(newState);
  };

  const setDepartureDateFrom = (date: Date | null) => {
    const newState = { ...searchState, departureDateFrom: date };
    setSearchState(newState);
    saveToStorage(newState);
  };

  const setDepartureDateTo = (date: Date | null) => {
    const newState = { ...searchState, departureDateTo: date };
    setSearchState(newState);
    saveToStorage(newState);
  };

  const setSearchResults = (results: any[]) => {
    const newState = { ...searchState, searchResults: results };
    setSearchState(newState);
    saveToStorage(newState);
  };

  const clearSearch = () => {
    const newState = {
      originPort: null,
      destinationPort: null,
      departureDateFrom: null,
      departureDateTo: null,
      searchResults: [],
    };
    setSearchState(newState);
    saveToStorage(newState);
  };

  const value: SearchContextType = {
    searchState,
    setOriginPort,
    setDestinationPort,
    setDepartureDateFrom,
    setDepartureDateTo,
    setSearchResults,
    clearSearch,
  };

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
}

export function useSearchContext() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error("useSearchContext must be used within a SearchProvider");
  }
  return context;
}
