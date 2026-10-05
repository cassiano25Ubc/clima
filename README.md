# Clima

Aplicação web responsiva para pesquisar cidades e consultar suas condições meteorológicas atuais. A busca usa a API Open-Meteo para localizar a cidade e obter os dados do clima.

## Funcionalidades

- Busca de cidades em diferentes países.
- Seleção da localidade quando o nome corresponde a mais de uma cidade.
- Exibição de temperatura atual, condição do tempo, data e período local (dia/noite).
- Indicadores de umidade relativa, sensação térmica, probabilidade de precipitação e vento.
- Estados de carregamento, busca sem resultados e erro com opção de tentar novamente.
- Interface em português, responsiva e utilizável por teclado.

## Tecnologias

- HTML, CSS e TypeScript
- Vite
- Open-Meteo Geocoding API e Forecast API
- Node.js Test Runner para os testes automatizados

## Requisitos

- Node.js 24 ou superior
- npm

## Executar localmente

```bash
git clone https://github.com/cassiano25Ubc/clima.git
cd clima
npm install
npm run dev
```

Abra no navegador o endereço local informado pelo Vite, normalmente `http://localhost:5173`.

## Testes e build

Executar os testes:

```bash
npm test
```

Gerar o build de produção e verificar os tipos TypeScript:

```bash
npm run build
```

Para servir localmente o build:

```bash
npm run preview
```

## Como funciona a busca

1. A aplicação pesquisa a cidade usando a API de geocodificação da Open-Meteo.
2. Se houver várias localidades correspondentes, a pessoa usuária escolhe uma opção.
3. Com latitude, longitude e timezone da localidade escolhida, a aplicação consulta a API de previsão.
4. Os dados meteorológicos são exibidos com as unidades retornadas pela API. A probabilidade de precipitação corresponde à hora local atual.

As chamadas às APIs ficam encapsuladas em módulos de serviço no cliente; o projeto não possui backend próprio nem persiste pesquisas. O funcionamento requer conexão à internet e disponibilidade da Open-Meteo.

## Documentação do projeto

- [PRD](./.docs/prd.md) — requisitos funcionais, detalhes técnicos e diretrizes visuais.
- [Tarefas](./.docs/task.md) — decomposição da implementação e critérios de aprovação.
