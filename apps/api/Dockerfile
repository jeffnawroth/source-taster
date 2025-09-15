# Dockerfile
FROM ruby:3.2-slim

# Systemabhängige Pakete installieren (für Nokogiri & Co.)
RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    libxml2-dev \
    libxslt1-dev \
    curl \
 && rm -rf /var/lib/apt/lists/*

# Gems installieren (inkl. CLI)
RUN gem install anystyle anystyle-cli sinatra citeproc rackup puma nokogiri

WORKDIR /app

# Serverdatei + ggf. Modell kopieren
COPY anystyle-server.rb ./

EXPOSE 4567

# Standard-CMD: Sinatra-Server starten
CMD ["ruby", "anystyle-server.rb"]
