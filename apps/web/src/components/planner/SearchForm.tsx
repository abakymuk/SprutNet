"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  CalendarIcon,
  Search,
  Ship,
  MapPin,
  Info,
  Settings,
  Filter,
  Clock,
  DollarSign,
  Zap,
  Star,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { PortRef } from "@sprutnet/shared/types";

interface SearchFormProps {
  onSearch: (
    originPort: PortRef | null,
    destinationPort: PortRef | null,
    departureDateFrom: Date | null,
    departureDateTo: Date | null,
    options: SearchOptions
  ) => void;
  isLoading: boolean;
}

interface SearchOptions {
  includeTransshipment: boolean;
  directRoutesOnly: boolean;
  sortBy: "earliest" | "fastest" | "cheapest" | "best";
  containerTypes: string[];
  maxTransitDays: number;
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

  const [searchOptions, setSearchOptions] = useState<SearchOptions>({
    includeTransshipment: true,
    directRoutesOnly: false,
    sortBy: "best",
    containerTypes: ["20GP", "40GP", "40HC"],
    maxTransitDays: 30,
  });

  const [originSearchQuery, setOriginSearchQuery] = useState("");
  const [destinationSearchQuery, setDestinationSearchQuery] = useState("");
  const [originPorts, setOriginPorts] = useState<PortRef[]>([]);
  const [destinationPorts, setDestinationPorts] = useState<PortRef[]>([]);
  const [isOriginOpen, setIsOriginOpen] = useState(false);
  const [isDestinationOpen, setIsDestinationOpen] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  // Debounced port search for origin
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (originSearchQuery.trim()) {
        searchPorts(originSearchQuery, setOriginPorts);
      } else {
        setOriginPorts([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [originSearchQuery]);

  // Debounced port search for destination
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (destinationSearchQuery.trim()) {
        searchPorts(destinationSearchQuery, setDestinationPorts);
      } else {
        setDestinationPorts([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [destinationSearchQuery]);

  const searchPorts = async (
    query: string,
    setPorts: (ports: PortRef[]) => void
  ) => {
    try {
      const params = new URLSearchParams({
        query: query.trim(),
        limit: "10",
      });

      const response = await fetch(`/api/ports/search?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch ports");
      }

      const data = await response.json();
      setPorts(data.ports || []);
    } catch (error) {
      console.error("Error searching ports:", error);
      setPorts([]);
    }
  };

  const handleSearch = () => {
    onSearch(
      originPort,
      destinationPort,
      departureDateFrom || null,
      departureDateTo || null,
      searchOptions
    );
  };

  const isSearchDisabled = !originPort || !destinationPort || isLoading;

  const containerTypeOptions = [
    {
      id: "20GP",
      label: "20' GP",
      description: "20-футовый стандартный контейнер",
    },
    {
      id: "40GP",
      label: "40' GP",
      description: "40-футовый стандартный контейнер",
    },
    {
      id: "40HC",
      label: "40' HC",
      description: "40-футовый высокий контейнер",
    },
    {
      id: "45HC",
      label: "45' HC",
      description: "45-футовый высокий контейнер",
    },
  ];

  const recentSearches = [
    { origin: "Санкт-Петербург", destination: "Шанхай", date: "2024-01-15" },
    { origin: "Новороссийск", destination: "Роттердам", date: "2024-01-20" },
    { origin: "Владивосток", destination: "Лос-Анджелес", date: "2024-01-25" },
  ];

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Main Search Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              Поиск рейсов
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Port Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Port of Loading */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Port of Loading (POL)
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Порт отправления груза</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
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
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
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
                                <span className="text-sm text-muted-foreground">
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
                <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Ship className="h-4 w-4" />
                  Port of Discharge (POD)
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Порт назначения груза</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <Popover
                  open={isDestinationOpen}
                  onOpenChange={setIsDestinationOpen}
                >
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
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
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
                                <span className="text-sm text-muted-foreground">
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
                <Label className="text-sm font-medium text-foreground">
                  Дата отправления от
                </Label>
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
                <Label className="text-sm font-medium text-foreground">
                  Дата отправления до
                </Label>
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

            {/* Advanced Options Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="advanced-options"
                  checked={showAdvancedOptions}
                  onCheckedChange={setShowAdvancedOptions}
                />
                <Label htmlFor="advanced-options">Расширенные настройки</Label>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Настройки
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Быстрые настройки</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() =>
                      setSearchOptions((prev) => ({
                        ...prev,
                        directRoutesOnly: true,
                      }))
                    }
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Только прямые рейсы
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      setSearchOptions((prev) => ({
                        ...prev,
                        sortBy: "fastest",
                      }))
                    }
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Сортировка по скорости
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      setSearchOptions((prev) => ({
                        ...prev,
                        sortBy: "cheapest",
                      }))
                    }
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Сортировка по цене
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Advanced Options */}
            {showAdvancedOptions && (
              <div className="space-y-6 p-4 bg-muted/50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Route Options */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-foreground">
                      Опции маршрута
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="include-transshipment"
                          checked={searchOptions.includeTransshipment}
                          onCheckedChange={(checked) =>
                            setSearchOptions((prev) => ({
                              ...prev,
                              includeTransshipment: !!checked,
                            }))
                          }
                        />
                        <Label htmlFor="include-transshipment">
                          Включать перегрузки
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="direct-routes-only"
                          checked={searchOptions.directRoutesOnly}
                          onCheckedChange={(checked) =>
                            setSearchOptions((prev) => ({
                              ...prev,
                              directRoutesOnly: !!checked,
                            }))
                          }
                        />
                        <Label htmlFor="direct-routes-only">
                          Только прямые рейсы
                        </Label>
                      </div>
                    </div>
                  </div>

                  {/* Container Types */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-foreground">
                      Типы контейнеров
                    </h4>
                    <div className="space-y-2">
                      {containerTypeOptions.map((type) => (
                        <div
                          key={type.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={type.id}
                            checked={searchOptions.containerTypes.includes(
                              type.id
                            )}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSearchOptions((prev) => ({
                                  ...prev,
                                  containerTypes: [
                                    ...prev.containerTypes,
                                    type.id,
                                  ],
                                }));
                              } else {
                                setSearchOptions((prev) => ({
                                  ...prev,
                                  containerTypes: prev.containerTypes.filter(
                                    (t) => t !== type.id
                                  ),
                                }));
                              }
                            }}
                          />
                          <Label htmlFor={type.id} className="text-sm">
                            {type.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sort Options */}
                <div className="space-y-4">
                  <h4 className="font-medium text-foreground">
                    Сортировка результатов
                  </h4>
                  <RadioGroup
                    value={searchOptions.sortBy}
                    onValueChange={(value: SearchOptions["sortBy"]) =>
                      setSearchOptions((prev) => ({ ...prev, sortBy: value }))
                    }
                    className="grid grid-cols-2 md:grid-cols-4 gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="earliest" id="earliest" />
                      <Label htmlFor="earliest" className="text-sm">
                        Самый ранний
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="fastest" id="fastest" />
                      <Label htmlFor="fastest" className="text-sm">
                        Самый быстрый
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cheapest" id="cheapest" />
                      <Label htmlFor="cheapest" className="text-sm">
                        Самый дешевый
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="best" id="best" />
                      <Label htmlFor="best" className="text-sm">
                        Лучший выбор
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            )}

            {/* Search Button */}
            <div className="flex justify-center">
              <Button
                onClick={handleSearch}
                disabled={isSearchDisabled}
                className="px-8 py-3"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Поиск...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Найти рейсы
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Searches */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Недавние поиски
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Откуда</TableHead>
                  <TableHead>Куда</TableHead>
                  <TableHead>Дата</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentSearches.map((search, index) => (
                  <TableRow key={index}>
                    <TableCell>{search.origin}</TableCell>
                    <TableCell>{search.destination}</TableCell>
                    <TableCell>{search.date}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        Повторить
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Help Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <HelpCircle className="h-4 w-4 mr-2" />
              Нужна помощь?
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Как пользоваться планировщиком</DialogTitle>
              <DialogDescription>
                Пошаговое руководство по поиску рейсов
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">1. Выберите порты</h4>
                <p className="text-sm text-muted-foreground">
                  Укажите порт отправления (POL) и порт назначения (POD)
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">2. Укажите даты</h4>
                <p className="text-sm text-muted-foreground">
                  Выберите диапазон дат отправления
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">3. Настройте параметры</h4>
                <p className="text-sm text-muted-foreground">
                  Используйте расширенные настройки для точной настройки поиска
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
