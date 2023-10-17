build:
    docker build -t csbot .

run:
    docker run -d -p 3000:3000 --name csbot --rm csbot