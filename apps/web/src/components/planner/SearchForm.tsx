"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { CalendarIcon, Search, Ship, MapPin } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { PortRef } from "@sprutnet/shared/types";

interface SearchFormProps {
  onSearch: (
    originPort: PortRef | null,
    destinationPort: PortRef | null,
    departureDateFrom: Date | null,
    departureDateTo: Date | null
  ) => void;
  isLoading: boolean;
}

export function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [originPort, setOriginPort] = useState<PortRef | null>(null);
  const [destinationPort, setDestinationPort] = useState<PortRef | null>(null);
  const [departureDateFrom, setDepartureDateFrom] = useState<Date | undefined>(
    undefined
  );
  const [departureDateTo, setDepartureDateTo] = useState<Date | undefined>(
    undefined
  );

  const [originSearchQuery, setOriginSearchQuery] = useState("");
  const [destinationSearchQuery, setDestinationSearchQuery] = useState("");
  const [originPorts, setOriginPorts] = useState<PortRef[]>([]);
  const [destinationPorts, setDestinationPorts] = useState<PortRef[]>([]);
  const [isOriginOpen, setIsOriginOpen] = useState(false);
  const [isDestinationOpen, setIsDestinationOpen] = useState(false);

  // Поиск портов отправления
  useEffect(() => {
    const searchOriginPorts = async () => {
      if (originSearchQuery.length < 2) {
        setOriginPorts([]);
        return;
      }

      try {
        const response = await fetch(
          `/api/ports/search?query=${encodeURIComponent(originSearchQuery)}&limit=10`
        );
        if (response.ok) {
          const data = await response.json();
          setOriginPorts(data.ports || []);
        }
      } catch (error) {
        console.error("Error searching origin ports:", error);
        setOriginPorts([]);
      }
    };

    const timeoutId = setTimeout(searchOriginPorts, 300);
    return () => clearTimeout(timeoutId);
  }, [originSearchQuery]);

  // Поиск портов назначения
  useEffect(() => {
    const searchDestinationPorts = async () => {
      if (destinationSearchQuery.length < 2) {
        setDestinationPorts([]);
        return;
      }

      try {
        const response = await fetch(
          `/api/ports/search?query=${encodeURIComponent(destinationSearchQuery)}&limit=10`
        );
        if (response.ok) {
          const data = await response.json();
          setDestinationPorts(data.ports || []);
        }
      } catch (error) {
        console.error("Error searching destination ports:", error);
        setDestinationPorts([]);
      }
    };

    const timeoutId = setTimeout(searchDestinationPorts, 300);
    return () => clearTimeout(timeoutId);
  }, [destinationSearchQuery]);

  const handleSearch = () => {
    onSearch(
      originPort,
      destinationPort,
      departureDateFrom || null,
      departureDateTo || null
    );
  };

  const isSearchDisabled = !originPort || !destinationPort || isLoading;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Port of Loading */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Port of Loading (POL)
          </label>
          <Popover open={isOriginOpen} onOpenChange={setIsOriginOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={isOriginOpen}
                className="w-full justify-between"
              >
                {originPort ? (
                  <span className="truncate">
                    {originPort.name} ({originPort.cityName},{" "}
                    {originPort.countryName})
                  </span>
                ) : (
                  <span className="text-muted-foreground">
                    Выберите порт отправления...
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput
                  placeholder="Поиск портов..."
                  value={originSearchQuery}
                  onValueChange={setOriginSearchQuery}
                />
                <CommandList>
                  <CommandEmpty>Порты не найдены.</CommandEmpty>
                  <CommandGroup>
                    {originPorts.map((port) => (
                      <CommandItem
                        key={port.id}
                        value={port.id}
                        onSelect={() => {
                          setOriginPort(port);
                          setIsOriginOpen(false);
                          setOriginSearchQuery("");
                        }}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{port.name}</span>
                          <span className="text-sm text-gray-500">
                            {port.cityName}, {port.countryName}
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Port of Discharge */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Ship className="h-4 w-4" />
            Port of Discharge (POD)
          </label>
          <Popover open={isDestinationOpen} onOpenChange={setIsDestinationOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={isDestinationOpen}
                className="w-full justify-between"
              >
                {destinationPort ? (
                  <span className="truncate">
                    {destinationPort.name} ({destinationPort.cityName},{" "}
                    {destinationPort.countryName})
                  </span>
                ) : (
                  <span className="text-muted-foreground">
                    Выберите порт назначения...
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput
                  placeholder="Поиск портов..."
                  value={destinationSearchQuery}
                  onValueChange={setDestinationSearchQuery}
                />
                <CommandList>
                  <CommandEmpty>Порты не найдены.</CommandEmpty>
                  <CommandGroup>
                    {destinationPorts.map((port) => (
                      <CommandItem
                        key={port.id}
                        value={port.id}
                        onSelect={() => {
                          setDestinationPort(port);
                          setIsDestinationOpen(false);
                          setDestinationSearchQuery("");
                        }}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{port.name}</span>
                          <span className="text-sm text-gray-500">
                            {port.cityName}, {port.countryName}
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Дата отправления от
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !departureDateFrom && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {departureDateFrom
                  ? format(departureDateFrom, "PPP", { locale: ru })
                  : "Выберите дату"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={departureDateFrom}
                onSelect={setDepartureDateFrom}
                initialFocus
                locale={ru}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Дата отправления до
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !departureDateTo && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {departureDateTo
                  ? format(departureDateTo, "PPP", { locale: ru })
                  : "Выберите дату"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={departureDateTo}
                onSelect={setDepartureDateTo}
                initialFocus
                locale={ru}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Search Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleSearch}
          disabled={isSearchDisabled}
          className="px-8 py-3"
          size="lg"
        >
          <Search className="mr-2 h-4 w-4" />
          {isLoading ? "Поиск..." : "Найти рейсы"}
        </Button>
      </div>
    </div>
  );
}
