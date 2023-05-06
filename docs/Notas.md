# Arquit Monkeys Readme for Devs

## Levantar contenedores

``` zsh
➜  docker-compose build --no-cache && docker compose down && docker compose up --force-recreate -d
```

### Caso si quiero 3 instancias de node (caso laod-balancer del nginx_reverse_proxy.conf):

El primer comando agrega instancias.

El segundo command recarga la configuracion del container pasado (en este caso: tp1-arquit-monkeys-node-1)

Round-robin por default nginx

curl -v me muestra el header. El parametro: `X-API-Id` nos sirve para identificar la distimtas instancias de ngix en el caso de load-balancing e identificar si una instancia esta ams cargada que otra.

``` zsh
➜ docker compose up --force-recreate -d --scale node=3

➜ docker kill --signal="SIGHUP" tp1-arquit-monkeys-node-1

```

## API

Ejecutar para obtener respuesta del server

``` zsh
➜  curl localhost:5555/api/
```

``` zsh
➜  curl localhost:5555/api/ping
```

``` zsh
➜  curl localhost:5555/api/fact
```

``` zsh
➜  curl localhost:5555/api/space_news
```

``` zsh
➜  url http://localhost:5555/api/metar?station=SAEZ
```

``` zsh
➜  curl localhost:5555/api/redis/fact
```

``` zsh
➜  curl localhost:5555/api/redis/space_news
```

``` zsh
➜  curl localhost:5555/api/redis/metar?station=SAEZ
```

## Apache Bench

```zsh
➜  ab -n <cantidad de requests> -c <cantidad de requests que quiero que se ejecuten en paralelo> <url>
```

Ejemplo:

``` zsh
➜  ab -n 200 -c 50 "http://localhost:5555/api/metar?station=SAEZ"
```

Con la ayuda de la herramienta ab se ejecutan 200 requests con 50 de ellos en paralelo, es decir se envían 50 requests juntos y después otros 150.

## WARINING for Mac OS users

En el docker-compose hay comentarios de cambios que hay que hacer si tenes MAC para que funcione.

Esto se puede comprobar en cAdvisor que no te muestra los containers si no.

## Artillery

Descarga:

``` zsh
➜ pwd
tp1-arquit-monkeys/perf

➜  npm install
```

Corrida ejemplo:

``` zsh
➜ pwd
tp1-arquit-monkeys/perf

➜  sh run-scenario.sh space_news api

> perf@1.0.0 artillery
> artillery run space_news.yaml -e api

```

## Grafana tips

- No olvidar de cambiarle el nombre la variables containers del template de la catedra
- No olvidar agregar a graphite como data source (Endpoint: `http://graphite`)
- La contraseña e usuario inicial siempre es `admin`
- No olvidan que grafana se guarda en un volumen local. Si se agregan graficos se tiene que exportar el dashboard como json para que este en el repositorio!
- `new_dashboard.json` es un nuevo dashboard para que hagamos nuestras metricas.
