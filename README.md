# 🌤️ Clima

> **Aplicação web responsiva para consultar o clima atual de cidades do mundo todo.**

O **Clima** permite pesquisar cidades, selecionar a localidade desejada e visualizar as condições meteorológicas atuais de forma simples, rápida e responsiva.

A aplicação utiliza a **Open-Meteo** para realizar a geolocalização das cidades e consultar os dados meteorológicos.

---
# link do projeto
https://clima-omega-sepia.vercel.app/
---

## ✨ Funcionalidades

* 🌎 **Busca de cidades** em diferentes países
* 📍 **Seleção de localidade** quando existem cidades com o mesmo nome
* 🌡️ **Temperatura atual**
* ☁️ **Condição meteorológica**
* 📅 **Data e horário local**
* 🌙 **Identificação de dia/noite**
* 💧 **Umidade relativa**
* 🌡️ **Sensação térmica**
* 🌧️ **Probabilidade de precipitação**
* 💨 **Velocidade do vento**
* ⏳ **Estado de carregamento**
* 🔍 **Tratamento para buscas sem resultados**
* ⚠️ **Tratamento de erros com opção de tentar novamente**
* ⌨️ **Navegação por teclado**
* 📱 **Interface responsiva**
* 🇧🇷 **Interface em português**

---

## 🛠️ Tecnologias

| Tecnologia              | Utilização                            |
| ----------------------- | ------------------------------------- |
| **HTML**                | Estrutura da aplicação                |
| **CSS**                 | Estilização e responsividade          |
| **TypeScript**          | Lógica e tipagem                      |
| **Vite**                | Desenvolvimento e build               |
| **Open-Meteo**          | Geocodificação e dados meteorológicos |
| **Node.js Test Runner** | Testes automatizados                  |

---

## 🌐 APIs utilizadas

### 📍 Open-Meteo Geocoding API

Responsável por localizar a cidade pesquisada e retornar informações como:

* Nome da cidade
* País
* Estado/região
* Latitude
* Longitude
* Timezone

### 🌦️ Open-Meteo Forecast API

Utilizada para obter os dados meteorológicos da localidade selecionada.

Entre os dados utilizados estão:

* Temperatura
* Sensação térmica
* Umidade
* Probabilidade de precipitação
* Velocidade do vento
* Condição do tempo
* Período do dia

---

## 🔎 Como funciona

O fluxo da aplicação acontece em quatro etapas:

```text
🔎 Pesquisa da cidade
        ↓
📍 Seleção da localidade
        ↓
🌦️ Consulta dos dados meteorológicos
        ↓
📊 Exibição das condições atuais
```

### 1. Pesquisa

A aplicação envia o nome informado pelo usuário para a **API de geocodificação da Open-Meteo**.

### 2. Seleção

Quando existem várias localidades com o mesmo nome, a aplicação apresenta as opções disponíveis para que o usuário escolha a correta.

### 3. Consulta meteorológica

Após a seleção, são utilizados:

* Latitude
* Longitude
* Timezone

Essas informações são enviadas para a **Forecast API** da Open-Meteo.

### 4. Exibição

Os dados retornados pela API são apresentados na interface com as informações meteorológicas atuais.

> 💡 A probabilidade de precipitação exibida corresponde à **hora local atual da cidade selecionada**.

---

## ⚙️ Arquitetura

As chamadas às APIs são organizadas em **módulos de serviço no cliente**, mantendo a lógica de comunicação externa separada da interface.

O projeto:

* não possui backend próprio;
* não possui banco de dados;
* não persiste pesquisas;
* depende de conexão com a internet;
* depende da disponibilidade das APIs da Open-Meteo.

---

## 📋 Requisitos

Antes de executar o projeto, certifique-se de possuir:

* **Node.js 24 ou superior**
* **npm**
* Conexão com a internet

---

## 📁 Estrutura geral

```text
clima/
│
├── src/
│   ├── services/
│   │   └── ...
│   │
│   ├── ...
│   └── ...
│
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

> A estrutura acima representa a organização geral do projeto. Os arquivos podem variar conforme a implementação atual.

---

## 🎯 Objetivo do projeto

O projeto foi desenvolvido para praticar conceitos importantes do desenvolvimento web moderno, principalmente:

* TypeScript
* Consumo de APIs
* Programação assíncrona
* Manipulação do DOM
* Tipagem de dados
* Tratamento de erros
* Estados de carregamento
* Responsividade
* Organização de código
* Testes automatizados
* Build com Vite

---

## 📌 Status

🟢 **Projeto funcional**

O projeto possui busca de cidades, consulta meteorológica, tratamento de estados da interface, testes automatizados e build de produção.

---

## 👨‍💻 Desenvolvido por

**Cassiano Maia**

Estudante de Ciência da Computação e desenvolvedor em formação.

[![GitHub](https://img.shields.io/badge/GitHub-Cassiano25Ubc-181717?style=for-the-badge\&logo=github)](https://github.com/cassiano25Ubc)

---

<div align="center">

### 🌤️ Clima

**Informação meteorológica de forma simples e rápida.**

</div>


## Documentação do projeto

- [PRD](./.docs/prd.md) — requisitos funcionais, detalhes técnicos e diretrizes visuais.
- [Tarefas](./.docs/task.md) — decomposição da implementação e critérios de aprovação.
