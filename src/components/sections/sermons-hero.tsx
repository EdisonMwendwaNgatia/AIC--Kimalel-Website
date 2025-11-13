export default function SermonsHero() {
  return (
    <section className="relative py-20 md:py-28 bg-gradient-to-br from-primary to-primary/90 text-primary-foreground">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-headline mb-6">
          Sermon Library
        </h1>
        <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-8 opacity-90">
          Dive deep into God's Word through our collection of inspiring messages and teachings.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <p className="text-sm opacity-80">Weekly Messages</p>
            <p className="text-lg font-semibold">Every Sunday</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <p className="text-sm opacity-80">Available Formats</p>
            <p className="text-lg font-semibold">Audio & Video</p>
          </div>
        </div>
      </div>
    </section>
  );
}
