# S.T.E.P — Simple Task Execution Platform

**Canivete de Tarefas** — um gerenciador de tarefas acadêmicas que não descarta o que foi feito. Cada tarefa concluída vira conhecimento vivo, conectado e compartilhável.

[**Acessar a aplicação**](https://izzieee.github.io/DFE_Jacyane-Martins)

---

## Índice

- [Propósito](#propósito)
- [Conceito](#conceito)
- [Funcionalidades](#funcionalidades)
- [Manual de uso](#manual-de-uso)
- [Persistência](#persistência)
- [Arquitetura](#arquitetura)
- [Tecnologias](#tecnologias)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Princípios de design](#princípios-de-design)
- [Informações de criação](#informações-de-criação)
- [Licença](#licença)

---

## Propósito

O **S.T.E.P** foi criado para resolver um problema comum: tarefas acadêmicas se perdem em cadernos, mensagens e na memória. Mais do que um gerenciador, o S.T.E.P transforma cada tarefa concluída em material de estudo reutilizável.

Quando você conclui uma tarefa, ela não desaparece — ela vira uma entrada no acervo, com passos, aprendizados e anotações. Você pode evoluí-la em uma nova tarefa, conectá-la a outras por tags e publicá-la como tutorial.

---

## Conceito

A metáfora central é o canivete suíço: uma ferramenta, várias lâminas.

| Lâmina | Modo | Função |
|--------|------|--------|
| Executar | [ ] Kanban | Onde você faz as tarefas |
| Consultar | [#] Acervo Vivo | Onde você revisa o que fez |
| Descobrir | [~] Mapa | Onde você vê conexões |
| Compartilhar | [>] Legado | Onde você publica tutoriais |
| Entender | [i] Sobre | Onde está o manual |

O ciclo:

Kanban -> conclui -> Acervo -> Mapa -> Legado -> Evoluir -> Kanban

---

## Funcionalidades

Essenciais:
- Drag & drop entre colunas do Kanban
- Criar, editar, excluir tarefas
- Busca e filtros combinados
- Persistência automática no navegador
- Exportar tudo como JSON
- Resetar dados para o original

Diferenciais:
- Acervo Vivo com anotações em timeline
- Evoluir tarefa — cria nova versão com uma etapa extra
- Clonar tarefa — duplica como template
- Mapa de conexões — grafo SVG por tags
- Estatísticas — progresso, tags, distribuição
- Publicar no Legado — exporta como Markdown
- Busca global — procura em todas as tarefas

Acessibilidade:
- Região de status com aria-live="polite"
- Foco visível em todos os controles
- Navegação completa por teclado
- Contraste alto (WCAG AA)

---

## Manual de uso

### [ ] Kanban

Onde você executa as tarefas.

- Arrastar e soltar cartões entre colunas para mudar o status
- + Nova Tarefa abre um formulário completo
- Filtros buscam por título, status e prioridade
- Ordenação por prazo ou padrão

Colunas:

| Coluna | Significado |
|--------|-------------|
| A fazer | Ainda não começou |
| Em andamento | Em execução |
| Em revisão | Precisa de revisão |
| Concluída | Finalizada |

Tarefas concluídas ganham dois botões:

- [#] Arquivar no Acervo — some do Kanban, vai para o Acervo
- [x] Excluir — apaga permanentemente

Prioridades:

- Alta (vermelho) — urgente
- Média (laranja) — normal
- Baixa (verde) — pode esperar

### [#] Acervo Vivo

Onde você consulta e evolui tarefas concluídas.

- Lista todas as tarefas arquivadas ou concluídas
- Busca por título ou tag
- Filtro por tag — clique numa tag para filtrar

Ações por tarefa:

| Botão | Função |
|-------|--------|
| ^ Evoluir Tarefa | Cria nova tarefa com nova etapa, volta pro Kanban |
| > Ver detalhes | Abre modal com passos, aprendizados e anotações |
| [>] Publicar | Envia para o Legado |

### [~] Mapa

Onde você descobre conexões entre tarefas.

- Cada tarefa é um nó no grafo
- Linhas tracejadas conectam tarefas que compartilham tags
- Clique num nó ou item da lista para abrir detalhes
- Filtro por tag destaca um grupo

Estatísticas exibidas:

- Quantidade por status (a fazer, andamento, revisão, concluída)
- Progresso em percentual
- Tags únicas usadas

Cores dos nós:

| Status | Cor |
|--------|-----|
| A fazer | Cinza |
| Em andamento | Ciano |
| Em revisão | Âmbar |
| Concluída | Verde |

### [>] Legado

Onde você compartilha tarefas como tutoriais.

- Lista de todas as tarefas publicadas
- Busca por título ou tag
- Filtro por tag

Ações por tarefa:

| Botão | Função |
|-------|--------|
| > Ver detalhes | Abre o modal |
| [+] Exportar Markdown | Baixa um arquivo .md |
| [#] Despublicar | Remove do Legado |

### [i] Sobre

Manual completo e informações do projeto.

Seções:

- Propósito — o que é o S.T.E.P
- Capturas — screenshots dos 4 modos principais
- Manual — guia de cada modo
- Informações de criação — autora, disciplina, tecnologias
- Princípios — filosofia de design
- Atalhos — dicas de uso
- Dados — exportar tudo / resetar

### Busca global

No header, há um campo de busca que procura em:

- Título
- Projeto
- Responsável
- Tags
- Passos
- Aprendizados

Como usar:

1. Digite algo no campo [?] Busca global...
2. Um modal abre com os resultados
3. Clique num resultado para abrir a tarefa

### = Ações avançadas

Dentro do modal de detalhes, na seção = Ações avançadas:

| Botão | Função |
|-------|--------|
| Editar tarefa | Abre formulário de edição completa |
| ^ Evoluir | Cria nova tarefa baseada nesta |
| > Clonar | Duplica a tarefa com novo ID |
| [>] Publicar / [#] Despublicar | Alterna publicação no Legado |
| [x] Excluir | Apaga permanentemente |

Adicionar anotação: em qualquer modal, digite no campo de texto e clique em + Adicionar anotação. A anotação aparece na timeline com a data de hoje.

### Fluxo sugerido

1. Crie tarefas no Kanban
2. Arraste para A fazer -> Andamento -> Revisão -> Concluída
3. Clique em [#] Arquivar no Acervo
4. Evolua tarefas recorrentes com ^ Evoluir
5. Conecte tarefas por tags no Mapa
6. Publique no Legado o que vale compartilhar
7. Exporte como Markdown para guardar fora do app

---

## Persistência

Suas tarefas são salvas automaticamente no navegador usando localStorage.

- Cada mudança é salva com debounce de 300ms
- Ao recarregar, os dados salvos são carregados primeiro
- Se não houver nada salvo, o dados.json original é carregado
- Resetar dados apaga o localStorage e recarrega o JSON

---

## Arquitetura

O projeto segue 5 princípios:

### 1. Estado único

Todo o estado vive em js/estado.js:

export const estado = {
    tarefas: [],
    busca: '',
    status: 'todos',
    prioridade: 'todas',
    ordenacao: 'padrao',
    modo: 'kanban',
    tagSelecionada: null,
    tarefaSelecionada: null,
    buscaAcervo: '',
    buscaLegado: '',
    carregando: false,
    erro: null
};

### 2. Derivação sem mutação

A lista visível é calculada a partir do estado, sem alterar o array original:

export function derivarListaVisivel(estado) {
    let lista = [...estado.tarefas];
    // aplica busca, filtro, ordenação
    return lista;
}

### 3. Ciclo único de atualização

Evento -> altera estado -> derivação -> renderização

Todo evento (input, click, change) passa pelo mesmo caminho.

### 4. Separação de responsabilidades

| Arquivo | Responsabilidade |
|---------|------------------|
| api.js | Buscar dados (fetch) |
| estado.js | Estado único + derivações |
| estados.js | 4 estados da tela |
| renderizacao.js | Cartões do Kanban |
| acervo.js | Modo Acervo |
| mapa.js | Modo Mapa + estatísticas |
| legado.js | Modo Legado + exportação |
| modal.js | Modais (detalhes, editar, evoluir, clonar, nova tarefa) |
| dragdrop.js | Drag & drop entre colunas |
| persistencia.js | localStorage |
| app.js | Inicialização + eventos |

### 5. Acessibilidade

Região de status com role="status" e aria-live="polite" anuncia cada mudança para leitores de tela. O elemento existe vazio no HTML desde o início.

---

## Tecnologias

- HTML5 semântico
- CSS3 com variáveis HSL, grid, flexbox, backdrop-filter
- JavaScript (ES Modules)
- Fetch API com try/catch, response.ok e tratamento de 4 tipos de erro
- SVG para o grafo do Mapa
- localStorage para persistência
- GitHub Pages para publicação

---

## Estrutura do projeto

```text
DFE_Jacyane-Martins/
├── index.html                 # Estrutura principal da SPA e modal
├── README.md                  # Documentação do projeto
├── dados.json                 # Dados iniciais carregados via fetch
│
├── css/
│   └── style.css              # Tema visual, layout e estilos do sistema
│
├── img/
│   └── avatar.jpeg            # Foto da autora no modo Sobre
│
├── logo/                      # Ícones e elementos visuais das redes sociais
│
├── screenshots/               # Capturas dos modos principais do app
│   ├── kanban.png
│   ├── acervo.png
│   ├── mapa.png
│   └── legado.png
│
└── js/
    ├── api.js                 # Busca e carregamento de dados
    ├── estado.js              # Estado global e derivações
    ├── estados.js             # Estados da interface
    ├── renderizacao.js        # Renderização dos cartões e listas
    ├── acervo.js              # Lógica do modo Acervo
    ├── mapa.js                # Lógica do modo Mapa e estatísticas
    ├── legado.js              # Lógica do modo Legado e exportação
    ├── modal.js               # Modais de detalhe e ações
    ├── dragdrop.js            # Drag & drop do Kanban
    ├── persistencia.js        # Salvo em localStorage
    └── app.js                 # Inicialização e eventos da aplicação
```

A estrutura foi organizada para separar claramente apresentação, dados, lógica e documentação, mantendo o projeto em uma arquitetura simples e escalável para uma SPA acadêmica.
---

## Princípios de design

- Fonte única de verdade — o estado é a fonte; a tela é uma projeção
- Derivação sem mutação — a lista visível é sempre recalculada
- Ciclo único de atualização — todo evento passa pelo mesmo ponto
- Separação de responsabilidades — buscar, derivar e renderizar são funções distintas
- Acessibilidade — região de status anuncia cada mudança
- Estética de terminal — sem emojis; apenas símbolos, monocromia e alto contraste
- Zero frameworks — JavaScript puro, ES Modules, SVG nativo

---

## Informações de criação

Autora: Jacyane Carvalho Martins
Disciplina: Desenvolvimento Frontend — 2026.2
Orientação: Profª Marianne Lacerda Dutra Theodoro

Etapas do projeto:

- E1 — Estrutura semântica e acessível
- E2 — Layout responsivo (Flexbox + Grid)
- E3 — Fetch e os 4 estados da tela
- E4 — Estado único, busca, filtros e publicação
- Projeto final — Releitura como Canivete de Tarefas

---

## Licença

Projeto acadêmico — Desenvolvimento Frontend 2026.2.