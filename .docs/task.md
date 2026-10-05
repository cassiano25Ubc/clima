# Tarefas de implementação — Clima

Este arquivo transforma o [PRD](./prd.md) em tarefas verificáveis. Os requisitos completos, o mapeamento de códigos WMO e as diretrizes visuais permanecem no PRD; as tarefas abaixo referenciam suas seções para evitar duplicação.

Marque cada tarefa como concluída somente quando seu critério de aprovação for atendido.

## 1. Estruturar a aplicação

- [x] **Substituir a tela inicial do Vite pela estrutura base do Clima.**
  - Referência: PRD §§ 1, 5 (RF-01, RF-05), 7.1 e 8.
  - Critério de aprovação: a aplicação inicia sem conteúdo de demonstração do Vite e contém regiões semânticas para busca, estado da aplicação e resultado; o projeto continua compilando com a configuração atual de Vite e TypeScript.

## 2. Integrar a Open-Meteo

- [x] **Definir os tipos e validar os dados necessários das respostas.**
  - Referência: PRD §§ 7.1, 7.2 e 7.3.
  - Critério de aprovação: os tipos representam os campos utilizados de geocodificação e clima; dados ausentes ou inválidos não são tratados como resultado válido e a compilação TypeScript passa sem casts inseguros para contornar a validação.

- [x] **Implementar a função de geocodificação em um módulo dedicado.**
  - Referência: PRD §§ 7.1 e 7.2.
  - Critério de aprovação: a função constrói a URL com `name`, `count=10`, `language=pt` e `format=json`; codifica corretamente o nome da cidade; não faz requisição com nome vazio; retorna resultados válidos com contexto de localidade ou sinaliza ausência de resultado; falhas de rede e HTTP são propagadas como erro.

- [x] **Implementar a função de consulta meteorológica em um módulo dedicado.**
  - Referência: PRD §§ 7.1, 7.3 e RF-04.
  - Critério de aprovação: a função recebe latitude, longitude e timezone válidas, solicita todas as variáveis atuais e `hourly=precipitation_probability`, não consulta a API quando faltam parâmetros e diferencia dados incompletos de falhas de rede/HTTP.

- [x] **Associar a probabilidade de precipitação à hora local atual.**
  - Referência: PRD §§ 5 (RF-04) e 7.3.
  - Critério de aprovação: o valor retornado corresponde à mesma hora local de `current.time` nos dados horários, mesmo que a observação atual esteja em um intervalo de 15 minutos; hora/valor ausente resulta em dados incompletos, sem selecionar silenciosamente outra hora.

## 3. Preparar os dados para apresentação

- [x] **Implementar a interpretação dos códigos meteorológicos WMO.**
  - Referência: PRD § 7.4.
  - Critério de aprovação: cada código listado no PRD produz a descrição correspondente; um código não listado produz a descrição genérica prevista sem impedir a apresentação dos outros dados.

- [x] **Formatar a data e os valores para apresentação em português brasileiro.**
  - Referência: PRD §§ 5 (RF-03), 6 e 7.3.
  - Critério de aprovação: a data é formatada em português brasileiro na timezone recebida para a cidade; os valores são apresentados com as unidades retornadas pela API, sem conversões indevidas.

## 4. Implementar busca e estados

- [x] **Implementar o formulário de busca e a orquestração das duas consultas.**
  - Referência: PRD §§ 5 (RF-01 e RF-02) e 7.1.
  - Critério de aprovação: enviar uma cidade válida executa geocodificação e depois clima em uma única ação; cidade vazia não inicia requisições; não há chamada meteorológica sem coordenadas/timezone válidas.

- [x] **Implementar os estados vazio, carregamento, nenhum resultado e erro com nova tentativa.**
  - Referência: PRD § 5 (RF-02 e RF-05) e critérios de aceite 2, 5, 6 e 7.
  - Critério de aprovação: a busca mostra um único estado de carregamento durante as duas etapas; ausência de cidade ou de dados meteorológicos mostra “nenhum resultado”; falha de rede/HTTP mostra erro distinto e permite repetir a busca; submissões concorrentes não geram resultados fora de ordem nem mantêm dados antigos como se fossem atuais.

## 5. Exibir o clima

- [x] **Construir o painel de resultado com todos os campos exigidos.**
  - Referência: PRD §§ 5 (RF-03 e RF-04) e 7.3.
  - Critério de aprovação: o resultado apresenta na área lateral temperatura, cidade, código do país, data local, dia/noite e condição meteorológica; a área principal mostra umidade, temperatura aparente, probabilidade de precipitação e velocidade/direção do vento; nenhum painel parcial aparece quando faltam dados obrigatórios.

## 6. Aplicar design responsivo e acessibilidade

- [x] **Implementar o layout visual para desktop e telas estreitas.**
  - Referência: PRD §§ 6 e 8; critério de aceite 8.
  - Critério de aprovação: fundo geral cinza-escuro, busca superior centralizada sem fundo próprio e contêiner branco arredondado centralizado com largura máxima de 800px; no desktop, painel lateral à esquerda e conteúdo principal à direita; em telas estreitas, as áreas empilham-se sem rolagem horizontal.

- [x] **Garantir interação acessível por teclado e comunicação dos estados.**
  - Referência: PRD §§ 5 (RF-01 e RF-05) e 6.
  - Critério de aprovação: busca e nova tentativa têm rótulos acessíveis e podem ser acionadas por teclado; carregamento, erro e resultado são comunicados por texto/semântica, não apenas por cor; o foco permanece utilizável ao mudar de estado.

## 7. Verificar a entrega

- [x] **Validar os fluxos e os critérios de aceite do PRD.**
  - Referência: PRD § 9.
  - Critério de aprovação: testes ou verificações reproduzíveis cobrem busca bem-sucedida, cidade sem resultado, dados meteorológicos incompletos, falha e nova tentativa, probabilidade horária/timezone e mapeamento WMO; build de produção conclui sem erros TypeScript.
