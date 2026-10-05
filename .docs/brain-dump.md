 # Projejto: clima 

 Este projeto vai pegar a cidade e baseado nisso, consultar o clima daquela região, exibindo as principais informações de clima , temperatura, humidade e etc.

 ### Aspectos Técnicos 

 O projeto vai ser feito e git + vanilla + Typescript

### Infomações da API que será usada no projeto:
 Ele vai usar a API OpenMeteo, com os seguintes  endpoints:

 #### Para pegar a lat8idute/longitude e timezone, baseado no nome da cidade 
 https://geocoding-api.open-meteo.com/v1/search?name={NOME_DA_CIDADE}&count=1&language=pt&format=json

{NOME_DA_CIDADE} = NOme da cidade que o usuário digitou

Exemplo de resposta:
{
  "results": [
    {
      "id": 3451190,
      "name": "Rio de Janeiro",
      "latitude": -22.90642,
      "longitude": -43.18223,
      "elevation": 12,
      "feature_code": "PPLA",
      "country_code": "BR",
      "admin1_id": 3451189,
      "admin2_id": 6322060,
      "timezone": "America/Sao_Paulo",
      "population": 6747815,
      "country_id": 3469034,
      "country": "Brasil",
      "admin1": "Rio de Janeiro",
      "admin2": "Rio de Janeiro"
    }
  ],
  "generationtime_ms": 1.1525154
}

Informações que precisamos:
-name
-latitude
-longitude
- country_code
- timezone

#### Para pegar as informações de clima:
https://api.open-meteo.com/v1/forecast?latitude={LATITUDE}&longitude={LONGITUDE}&current=precipitation_probalility,temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,wind_speed_10m,wind_direction_10m,
weather_code&timezone={TIMEZONE}
{LATITUDE} = latitude 
{LONGITUDE} = longitude
{TIMEZONE} = Timezone

Exemplo de resposta:
{
  "latitude": -22.952549,
  "longitude": -43.215027,
  "generationtime_ms": 0.159382820129395,
  "utc_offset_seconds": -10800,
  "timezone": "America/sao_Paulo",
  "timezone_abbreviation": "GMT-3",
  "elevation": 12,
  "current_units": {
    "time": "iso8601",
    "interval": "seconds",
    "temperature_2m": "°C",
    "relative_humidity_2m": "%",
    "apparent_temperature": "°C",
    "is_day": "",
    "precipitation": "mm",
    "wind_speed_10m": "km/h",
    "wind_direction_10m": "°"
    "precipitation":"mm",
    "weather_code":"wmo code"
  },
  "current": {
    "time": "2026-10-05T19:00",
    "interval": 900,
    "temperature_2m": 23.6,
    "relative_humidity_2m": 84,
    "apparent_temperature": 25.9,
    "is_day": 1,
    "precipitation": 0,
    "wind_speed_10m": 12.7,
    "wind_direction_10m": 226
    "precipitation": 0,
    "weather_code":2
  }
}

Informações que precisamos da resposta:
Na resposta  eu tenho 2 itens :
-current_units tem as unidades de medida das propriedades
- current tem os valores das propriedades

Propriedades obrigatórias :
-temperature_2m
-relativehumidity_2m
-apparent_temperature
-is_day
-wind_speed_10m
-wind_direction_10m
-precipitation_probability

#### Informação importante:
Teremos um arquivo com as funcões de OpenMeteo, para que o projeto não faça requisição direta a  API mas sim use as funções desse arquivo.

Fluxo de pesquisa para receber o nome da cidade e pegar as informações de clima :
- O usuário digita o nome da cidade 
- O projeto pega o nome e usa o OpenMeteo para pegar latitude, longetude e timezone dass cidade.
- Ao pegar latitude, longetude e timezone, o projeto usa essas informações para fazer a requisição e pegar as informações do clima dessa localização.
- Caso não ache as  informações da cidade se comportar como se não tivesse achado nada.
- caso acha as informações da cidade más não as de clima, se comportar como se não tivesse echado nada .

A busca encvolve as 2 requisições (buscar latitude/longitude/timezone + buscar clima), mas para o usuário é uma só, com loading.

As  funções do OpenMetoe devem verificar se os parâmetros vieram,caso contrário,age como se não tivesse vindo.

### aspectos visuais (design e UX)

Tem que ter Empty State.

Teremos uma área SUPERIOR centralizada que tem apenas o campo de busca da cidade

O proejto terá um side bar na esquerda com as seguintes informasções:
-Temperatura
-Nome da cidade, Código do país 
-Dia atual
-Se é dia/noite (baseadono is_day)
-weather Code 

Na àrea principal :
-humidade relativa
-Temperatura aparente
-Probabilidade de precipitação
-Velocidade/Direção do vento

Design Geral:
-O projeto terá um fundo cinza escuro
-A parte superior não terá backgorund, más tanto o sidebar quanto a área principal ficarão dentro de uma div com borda bem arredondada, fundo branco, centralizada e largura máxima de 800px.

 Informações  de interpretação sobre o Weather Code:

 • 0: Céu limpo
• 1, 2, 3: Parcialmente nublado, nublado e encoberto
• 45, 48: Nevoeiro e nevoeiro com depósito de geada
• 51, 53, 55: Garoa leve, moderada e densa
• 56, 57: Garoa congelante leve e densa
• 61, 63, 65: Chuva leve, moderada e forte
• 66, 67: Chuva congelante leve e forte
• 71, 73, 75: Queda de neve leve, moderada e intensa
• 77: Grãos de neve
• 80, 81, 82: Pancadas de chuva leves, moderadas e violentas
• 85, 86: Pancadas de neve leves e fortes
• 95: Trovoadas leves ou moderadas
• 96, 99: Trovoadas com granizo leve ou forte