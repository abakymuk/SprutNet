import { render, screen } from "@testing-library/react";
import { LaneInsights } from "../lane-insights";

// Упрощенные mock данные для тестирования
const mockSailings = [
  {
    id: "1",
    carrierCode: "MAE",
    carrierName: "Maersk",
    voyageNumber: "MAE001",
    originPort: { id: "SHANGHAI", name: "Shanghai" },
    destinationPort: { id: "USLAX", name: "Los Angeles" },
    departureDate: new Date("2025-01-15"),
    arrivalDate: new Date("2025-02-02"),
    transitTime: 18,
    vessel: {
      imoNumber: "1234567",
      name: "MAERSK SHANGHAI",
      carrierCode: "MAE",
      capacity: 2000,
      builtYear: 2020,
      flag: "Denmark",
    },
    route: {
      id: "SHANGHAI-USLAX",
      transitTime: 18,
      duration: 18,
      distance: 0,
      type: "OCEAN",
    },
    rates: [
      {
        containerType: "40FT",
        currency: "USD",
        amount: 2500,
        totalCost: 2500,
        validFrom: new Date("2025-01-15"),
        validTo: new Date("2025-02-02"),
        type: "BASE",
      },
    ],
    deadlines: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    carrierCode: "MAE",
    carrierName: "Maersk",
    voyageNumber: "MAE002",
    originPort: { id: "SHANGHAI", name: "Shanghai" },
    destinationPort: { id: "USLAX", name: "Los Angeles" },
    departureDate: new Date("2025-01-22"),
    arrivalDate: new Date("2025-02-09"),
    transitTime: 18,
    vessel: {
      imoNumber: "1234568",
      name: "MAERSK LOS ANGELES",
      carrierCode: "MAE",
      capacity: 2000,
      builtYear: 2021,
      flag: "Denmark",
    },
    route: {
      id: "SHANGHAI-USLAX",
      transitTime: 18,
      duration: 18,
      distance: 0,
      type: "OCEAN",
    },
    rates: [
      {
        containerType: "40FT",
        currency: "USD",
        amount: 2600,
        totalCost: 2600,
        validFrom: new Date("2025-01-22"),
        validTo: new Date("2025-02-09"),
        type: "BASE",
      },
    ],
    deadlines: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe("LaneInsights", () => {
  it("should render empty state when no sailings provided", () => {
    render(<LaneInsights sailings={[]} />);

    expect(screen.getByText("Аналитика направления")).toBeInTheDocument();
    expect(
      screen.getByText("Нет данных для анализа. Выполните поиск рейсов.")
    ).toBeInTheDocument();
  });

  it("should render KPI cards with correct metrics", () => {
    render(
      <LaneInsights
        sailings={mockSailings}
        originPort="Shanghai"
        destinationPort="Los Angeles"
      />
    );

    // Check route header
    expect(
      screen.getByText("Маршрут Shanghai → Los Angeles")
    ).toBeInTheDocument();
    expect(screen.getByText("2 рейсов")).toBeInTheDocument();

    // Check KPI cards
    expect(screen.getByText("Средний транзит")).toBeInTheDocument();
    expect(screen.getByText("18")).toBeInTheDocument(); // avgTransitTime
    expect(screen.getByText("дней")).toBeInTheDocument();

    expect(screen.getByText("Частота рейсов")).toBeInTheDocument();
    expect(screen.getByText("0.5")).toBeInTheDocument(); // sailingsPerWeek
    expect(screen.getByText("рейсов/неделю")).toBeInTheDocument();

    expect(screen.getByText("Надежность")).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument(); // reliability
    expect(screen.getByText("рейсов без задержек")).toBeInTheDocument();

    expect(screen.getByText("Эффективность")).toBeInTheDocument();
    expect(screen.getByText("общий показатель")).toBeInTheDocument();
  });

  it("should render timeline with next sailings", () => {
    render(
      <LaneInsights
        sailings={mockSailings}
        originPort="Shanghai"
        destinationPort="Los Angeles"
      />
    );

    expect(screen.getByText("Ближайшие рейсы")).toBeInTheDocument();

    // Check timeline items
    expect(screen.getByText("15 янв. 2025")).toBeInTheDocument(); // First sailing departure
    expect(screen.getByText("22 янв. 2025")).toBeInTheDocument(); // Second sailing departure
    expect(screen.getByText("MAERSK SHANGHAI")).toBeInTheDocument();
    expect(screen.getByText("MAERSK LOS ANGELES")).toBeInTheDocument();
  });

  it("should render route summary with recommendations", () => {
    render(
      <LaneInsights
        sailings={mockSailings}
        originPort="Shanghai"
        destinationPort="Los Angeles"
      />
    );

    expect(screen.getByText("Общая оценка")).toBeInTheDocument();
    expect(screen.getByText("Рекомендация")).toBeInTheDocument();
    expect(screen.getByText("Риск")).toBeInTheDocument();
  });

  it("should calculate metrics correctly", () => {
    const sailingsWithDelay = [
      {
        ...mockSailings[0],
        delay: 2, // Add delay to test reliability calculation
      },
      mockSailings[1],
    ];

    render(
      <LaneInsights
        sailings={sailingsWithDelay}
        originPort="Shanghai"
        destinationPort="Los Angeles"
      />
    );

    // With one delayed sailing out of two, reliability should be 50%
    expect(screen.getByText("50%")).toBeInTheDocument();
  });

  it("should handle missing vessel names gracefully", () => {
    const sailingsWithoutVessel = [
      {
        ...mockSailings[0],
        vessel: undefined,
      },
    ];

    render(
      <LaneInsights
        sailings={sailingsWithoutVessel}
        originPort="Shanghai"
        destinationPort="Los Angeles"
      />
    );

    expect(screen.getByText("Судно не указано")).toBeInTheDocument();
  });

  it("should display frequency indicators correctly", () => {
    // Test with high frequency (3+ sailings per week)
    const highFrequencySailings = Array.from({ length: 12 }, (_, i) => ({
      ...mockSailings[0],
      id: `high-${i}`,
      departureDate: new Date(Date.now() + i * 24 * 60 * 60 * 1000), // Daily sailings
    }));

    render(
      <LaneInsights
        sailings={highFrequencySailings}
        originPort="Shanghai"
        destinationPort="Los Angeles"
      />
    );

    expect(screen.getByText("Высокая частота")).toBeInTheDocument();
  });
});
