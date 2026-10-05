# PRD — Clima

## 1. Visão do produto

O Clima é uma aplicação web que permite pesquisar uma cidade e consultar as condições meteorológicas atuais daquela localização. A experiência de busca é única para a pessoa usuária, embora dependa de duas consultas sequenciais à API Open-Meteo: primeiro a localização da cidade e, em seguida, o clima nas coordenadas encontradas.

## 2. Objetivos

- Permitir a consulta do clima atual a partir do nome de uma cidade.
- Apresentar as principais condições de forma clara e rápida.
- Manter a interface simples, responsiva e em português.
- Encapsular o acesso à Open-Meteo em funções próprias do projeto, sem chamadas à API espalhadas pela interface.

## 3. Escopo

### Incluído

- Busca de uma cidade pelo nome.
- Consulta de geolocalização e, em seguida, dos dados meteorológicos atuais.
- Exibição dos dados meteorológicos descritos neste documento.
- Estados inicial/vazio, carregamento, resultado não encontrado e erro com nova tentativa.
- Interpretação dos códigos meteorológicos WMO listados neste PRD.
- Layout responsivo para telas estreitas e largas.

### Fora do escopo definido

- Previsão para vários dias ou navegação por horários.
- Favoritos, histórico de pesquisas, autenticação ou persistência de dados.
- Backend próprio ou armazenamento local.

## 4. Usuários e necessidade

Uma pessoa que deseja saber rapidamente as condições atuais de uma cidade precisa pesquisar pelo nome e visualizar temperatura, condição do céu e indicadores relevantes sem navegar por etapas ou interpretar dados brutos da API.

## 5. Requisitos funcionais

### RF-01 — Busca de cidade

- A interface deve oferecer um campo de busca de cidade na região superior, centralizado.
- A pessoa usuária deve conseguir enviar a busca por um controle de submissão acessível e pelo teclado.
- O nome informado deve ser enviado à API de geocodificação com idioma `pt` e limite de até dez resultados.
- Quando a geocodificação retornar mais de uma localidade, a interface deve permitir selecionar qual delas consultar; com um único resultado, a consulta do clima deve prosseguir automaticamente.
- Espaços externos devem ser desconsiderados; um valor vazio não deve iniciar requisições.

### RF-02 — Fluxo de consulta

1. Receber e validar o nome da cidade.
2. Consultar a geocodificação para obter nome, latitude, longitude, código do país e timezone.
3. Se a cidade não retornar um resultado utilizável, mostrar o estado de “nenhum resultado”.
4. Com latitude, longitude e timezone válidos, consultar o clima.
5. Se os dados de clima não estiverem disponíveis ou não contiverem os campos necessários, mostrar o estado de “nenhum resultado”.
6. Mostrar o painel completo somente quando os dados necessários estiverem disponíveis.

A sequência inteira deve ser apresentada como uma única busca para a pessoa usuária, com um único estado de carregamento. Não deve haver um carregamento intermediário entre geocodificação e clima.

Quando houver múltiplas localidades, apresentar uma etapa de seleção entre geocodificação e clima. A seleção não deve iniciar uma nova geocodificação; a requisição meteorológica deve usar as coordenadas e timezone da localidade escolhida.

### RF-03 — Apresentação do resultado

O painel de resultado deve apresentar:

**Área lateral**

- Temperatura atual (`temperature_2m`).
- Nome da cidade e código do país.
- Data atual na timezone da cidade.
- Indicação de dia ou noite com base em `is_day`.
- Descrição da condição meteorológica obtida pela interpretação de `weather_code`.

**Área principal**

- Umidade relativa (`relative_humidity_2m`).
- Temperatura aparente (`apparent_temperature`).
- Probabilidade de precipitação (`precipitation_probability`).
- Velocidade do vento (`wind_speed_10m`).
- Direção do vento (`wind_direction_10m`).

Os valores devem ser apresentados com as unidades retornadas pela API. A data deve ser formatada em português brasileiro e respeitar a timezone da cidade, não a timezone do dispositivo.

### RF-04 — Probabilidade de precipitação

A probabilidade de precipitação é fornecida como variável horária, não como variável `current`. A consulta meteorológica deve solicitar `hourly=precipitation_probability`, além das variáveis atuais. A interface deve exibir o valor referente à hora local correspondente ao horário atual retornado pela API. Se não houver um valor correspondente, o resultado não deve ser apresentado como completo: deve seguir o comportamento de dados meteorológicos indisponíveis.

### RF-05 — Estados da interface

- **Inicial/vazio:** antes da primeira pesquisa, apresentar um estado vazio que oriente a pessoa usuária a pesquisar uma cidade.
- **Carregamento:** enquanto as duas consultas da busca estiverem em andamento, indicar visualmente que a busca está sendo processada e impedir submissões concorrentes que possam substituir o resultado de forma inconsistente.
- **Nenhum resultado:** informar que não foi possível encontrar dados para a cidade/clima pesquisado, sem exibir um painel parcial.
- **Erro:** se uma requisição falhar por rede, resposta HTTP inválida ou falha da API, apresentar uma mensagem de erro distinta de “nenhum resultado” e uma ação para tentar novamente.
- **Resultado:** apresentar os dados após a conclusão bem-sucedida das duas etapas.

A nova tentativa deve repetir o fluxo de busca com a cidade solicitada. A interface não deve mostrar valores de uma pesquisa anterior como se pertencessem à busca atual.

## 6. Requisitos não funcionais e do sistema

- Aplicação web client-side, sem serviço de backend próprio.
- Interface e conteúdo em português brasileiro.
- Layout adaptável a dispositivos móveis e desktops; em telas estreitas, as áreas lateral e principal devem reorganizar-se verticalmente sem rolagem horizontal.
- Controles de busca e nova tentativa devem ser utilizáveis por teclado e ter rótulos acessíveis.
- Estados de carregamento, erro e resultado não podem depender apenas de cor para comunicar significado.
- As requisições devem usar HTTPS e tratar erros de rede, status HTTP não bem-sucedidos e respostas sem os dados requeridos.
- O sistema não deve persistir dados pessoais; a busca consiste no nome de cidade informado e nos dados públicos retornados pela API.
- O funcionamento depende da disponibilidade da Open-Meteo e de conexão à internet.

## 7. Detalhes técnicos

### 7.1 Tecnologias e arquitetura

- HTML, CSS e TypeScript vanilla, com Vite como ferramenta de desenvolvimento e build, conforme a base atual do projeto.
- Um módulo dedicado deve concentrar as funções de integração com a Open-Meteo. A interface não deve realizar `fetch` diretamente para os endpoints.
- Separar, no mínimo, a consulta de geocodificação e a consulta meteorológica, mantendo a orquestração da busca em uma única ação da interface.
- Definir tipos TypeScript para os campos das respostas que o produto utiliza e validar a presença dos parâmetros e dados necessários antes de prosseguir.
- A ausência de parâmetros obrigatórios deve ser tratada como ausência de resultado; não se deve chamar a API com coordenadas ou timezone ausentes.

### 7.2 Geocodificação

Endpoint:

```text
https://geocoding-api.open-meteo.com/v1/search
```

Parâmetros:

| Parâmetro | Valor |
|---|---|
| `name` | Nome da cidade informado, codificado como parâmetro de URL |
| `count` | `10` |
| `language` | `pt` |
| `format` | `json` |

Campos necessários de cada resultado utilizável:

- `name`
- `latitude`
- `longitude`
- `country_code`
- `timezone`
- `admin1` e `country` quando fornecidos, para distinguir opções na seleção.

Se `results` estiver ausente/vazio ou não houver resultados com os campos obrigatórios válidos, tratar como nenhum resultado. Ao apresentar opções, identificar cada localidade com seu nome e, quando disponíveis, subdivisão administrativa e país.

### 7.3 Consulta meteorológica

Endpoint:

```text
https://api.open-meteo.com/v1/forecast
```

Parâmetros:

| Parâmetro | Valor |
|---|---|
| `latitude` | Latitude retornada pela geocodificação |
| `longitude` | Longitude retornada pela geocodificação |
| `timezone` | Timezone retornada pela geocodificação |
| `current` | `temperature_2m,relative_humidity_2m,apparent_temperature,is_day,wind_speed_10m,wind_direction_10m,weather_code` |
| `hourly` | `precipitation_probability` |

Campos necessários em `current`:

- `temperature_2m`
- `relative_humidity_2m`
- `apparent_temperature`
- `is_day`
- `wind_speed_10m`
- `wind_direction_10m`
- `weather_code`

Para a probabilidade horária, usar os arrays `hourly.time` e `hourly.precipitation_probability`, associando o valor à hora local de `current.time`. Exibir as unidades fornecidas em `current_units` e `hourly_units`, quando disponíveis. Temperaturas e demais medidas não devem ser convertidas sem necessidade; a API deve retornar as unidades padrão adequadas ao produto.

### 7.4 Interpretação de `weather_code`

| Código(s) WMO | Descrição em português |
|---|---|
| `0` | Céu limpo |
| `1`, `2`, `3` | Parcialmente nublado, nublado e encoberto |
| `45`, `48` | Nevoeiro e nevoeiro com depósito de geada |
| `51`, `53`, `55` | Garoa leve, moderada e densa |
| `56`, `57` | Garoa congelante leve e densa |
| `61`, `63`, `65` | Chuva leve, moderada e forte |
| `66`, `67` | Chuva congelante leve e forte |
| `71`, `73`, `75` | Queda de neve leve, moderada e intensa |
| `77` | Grãos de neve |
| `80`, `81`, `82` | Pancadas de chuva leves, moderadas e violentas |
| `85`, `86` | Pancadas de neve leves e fortes |
| `95` | Trovoadas leves ou moderadas |
| `96`, `99` | Trovoadas com granizo leve ou forte |

Se chegar um código não listado, exibir uma descrição genérica de condição indisponível sem interromper a apresentação dos demais campos válidos.

## 8. Diretrizes visuais e UX

- Usar fundo geral cinza-escuro.
- Manter a região superior de busca centralizada e sem fundo próprio.
- Abaixo da busca, centralizar um contêiner branco com largura máxima de `800px` e bordas bem arredondadas.
- No desktop, organizar o contêiner em uma barra lateral à esquerda e uma área principal à direita.
- Na barra lateral, dar destaque visual à temperatura e agrupar cidade/código do país, data, indicação dia/noite e condição meteorológica.
- Na área principal, organizar umidade, sensação térmica, probabilidade de precipitação e dados de vento em blocos fáceis de escanear.
- Usar hierarquia tipográfica clara para diferenciar valor, unidade e rótulo.
- Em telas estreitas, empilhar as áreas dentro do contêiner, preservando a hierarquia e a legibilidade.
- Incluir estado vazio visível antes da busca; durante o carregamento, preservar a posição do conteúdo e comunicar a atividade.

Este PRD especifica cores, estrutura e hierarquia, mas não define valores exatos de espaçamento, tipografia, ícones ou paleta além do fundo cinza-escuro e do contêiner branco.

## 9. Critérios de aceite

1. Uma busca válida realiza geocodificação e, com os parâmetros retornados, consulta o clima em sequência.
2. A pessoa usuária vê um único carregamento durante todo o fluxo.
3. O resultado mostra todos os campos obrigatórios, incluindo a probabilidade do horário local atual, com unidade apropriada.
4. Data e associação da probabilidade respeitam a timezone retornada para a cidade.
5. Cidade não encontrada ou dados meteorológicos ausentes resultam no estado de “nenhum resultado”, sem painel parcial.
6. Falha de rede/API apresenta estado de erro distinto e permite repetir a busca.
7. A aplicação não dispara consulta para cidade vazia ou parâmetros obrigatórios ausentes.
8. O layout mantém busca, estado vazio, erro e resultado utilizáveis em telas estreitas e largas.
9. A condição meteorológica exibida corresponde ao mapeamento WMO definido neste documento.
