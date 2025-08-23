export default function HomePage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          🚢 SprutNet
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          MVP планировщик морских перевозок
        </p>
        <div className="bg-card border rounded-lg p-6 max-w-md mx-auto">
          <p className="text-sm text-muted-foreground">
            Проект успешно настроен! 🎉
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Next.js 15 + shadcn/ui + Supabase готов к разработке.
          </p>
        </div>
      </div>
    </main>
  )
}
