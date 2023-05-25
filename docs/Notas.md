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
➜  curl http://localhost:5555/api/metar?station=SAEZ
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
- to reset password run:

```bash
> docker exec -it <graphana container id> /bin/bash
> grafana-cli admin reset-admin-password
> exit
```

Example:

``` bash
➜  app git:(metricas-propias) docker exec -it 6faa47e837368051a2cd699bcc5d614e8a190791174f350c3ea6a62553ef7ff2 /bin/bash
bash-5.1$ grafana-cli admin reset-admin-password admin
INFO [05-25|16:54:21] Starting Grafana                         logger=settings version= commit= branch= compiled=1970-01-01T00:00:00Z
INFO [05-25|16:54:21] Config loaded from                       logger=settings file=/usr/share/grafana/conf/defaults.ini
INFO [05-25|16:54:21] Config overridden from Environment variable logger=settings var="GF_PATHS_DATA=/var/lib/grafana"
INFO [05-25|16:54:21] Config overridden from Environment variable logger=settings var="GF_PATHS_LOGS=/var/log/grafana"
INFO [05-25|16:54:21] Config overridden from Environment variable logger=settings var="GF_PATHS_PLUGINS=/var/lib/grafana/plugins"
INFO [05-25|16:54:21] Config overridden from Environment variable logger=settings var="GF_PATHS_PROVISIONING=/etc/grafana/provisioning"
INFO [05-25|16:54:21] Path Home                                logger=settings path=/usr/share/grafana
INFO [05-25|16:54:21] Path Data                                logger=settings path=/var/lib/grafana
INFO [05-25|16:54:21] Path Logs                                logger=settings path=/var/log/grafana
INFO [05-25|16:54:21] Path Plugins                             logger=settings path=/var/lib/grafana/plugins
INFO [05-25|16:54:21] Path Provisioning                        logger=settings path=/etc/grafana/provisioning
INFO [05-25|16:54:21] App mode production                      logger=settings
INFO [05-25|16:54:21] Connecting to DB                         logger=sqlstore dbtype=sqlite3
INFO [05-25|16:54:21] Starting DB migrations                   logger=migrator
INFO [05-25|16:54:21] migrations completed                     logger=migrator performed=0 skipped=452 duration=603.08µs
INFO [05-25|16:54:21] Envelope encryption state                logger=secrets enabled=true current provider=secretKey.v1
INFO [05-25|16:54:21] Plugin registered                        logger=plugin.loader pluginID=input

Admin password changed successfully ✔

bash-5.1$ exit
exit
```
## Caso cache

- Explicacion de "Caching design patterns"y ejemplo de codigoen python :
https://aws.amazon.com/caching/best-practices/

## Data de METAR
Link de donde sacamos los ID de estaciones:
- https://metar-taf.com/airports?page=1&per-page=250
