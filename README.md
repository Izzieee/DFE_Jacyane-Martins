# S.T.E.P — Simple Task Execution Platform

**Canivete de Tarefas** — um gerenciador de tarefas acadêmicas que **não descarta o que foi feito**. Cada tarefa concluída vira conhecimento vivo, conectado e compartilhável.

[**Acessar a aplicação →**] (https://izzieee.github.io/DFE_Jacyane-Martins)

---

## Índice

- [Propósito](#propósito)
- [Conceito](#conceito)
- [Manual de uso](#manual-de-uso)
- [Arquitetura](#arquitetura)
- [Tecnologias](#tecnologias)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Princípios de design](#princípios-de-design)
- [Informações de criação](#informações-de-criação)

---

## Propósito

O **S.T.E.P** foi criado para resolver um problema comum: tarefas acadêmicas se perdem em cadernos, mensagens e na memória. Mais do que um gerenciador, o S.T.E.P. transforma cada tarefa concluída em **material de estudo reutilizável**.

Quando você conclui uma tarefa, ela não desaparece — ela vira uma entrada no **acervo**, com passos, aprendizados e anotações. Você pode **evoluí-la** em uma nova tarefa, **conectá-la** a outras por tags e **publicá-la** como tutorial.

---

## Conceito

A metáfora central é o **canivete suíço**: uma ferramenta, várias lâminas.

| Lâmina | Modo | Função |
|--------|------|--------|
| Executar | **[ ] Kanban** | Onde você faz as tarefas |
| Consultar | **[#] Acervo Vivo** | Onde você revisa o que fez |
| Descobrir | **[~] Mapa** | Onde você vê conexões |
| Compartilhar | **[>] Legado** | Onde você publica tutoriais |

O ciclo:

```
Kanban → conclui → Acervo → Mapa → Legado → Evoluir → Kanban
```

---

## Manual de uso

### [ ] Kanban

Onde você **executa** as tarefas.

- **Arrastar e soltar** cartões entre colunas para mudar o status
- **+ Nova Tarefa** abre um formulário para criar uma tarefa
- **Filtros** buscam por título, status e prioridade
- Tarefas na coluna **Concluída** ganham dois botões:
  - **[#] Arquivar no Acervo** — some do Kanban, aparece no Acervo
  - **[x] Excluir** — apaga permanentemente

**Colunas:**

| Coluna | Significado |
|--------|-------------|
| A fazer | Ainda não começou |
| Em andamento | Em execução |
| Em revisão | Precisa de revisão |
| Concluída | Finalizada |

**Prioridades:**

- **Alta** (vermelho) — urgente
- **Média** (laranja) — normal
- **Baixa** (verde) — pode esperar

### [#] Acervo Vivo

Onde você **consulta e evolui** tarefas concluídas.

- Lista de todas as tarefas arquivadas ou concluídas
- **Busca** por título ou tag
- **Filtro por tag** — clique numa tag para filtrar

**Ações por tarefa:**

| Botão | Função |
|-------|--------|
| **^ Evoluir Tarefa** | Cria uma nova tarefa baseada nesta, com nova etapa, e joga de volta pro Kanban |
| **> Ver detalhes** | Abre o modal com passos, aprendizados e anotações |
| **[>] Publicar** | Envia a tarefa para o Legado |

### [~] Mapa

Onde você **descobre conexões** entre tarefas.

- Cada tarefa é um **nó** no grafo
- Linhas conectam tarefas que **compartilham tags**
- **Clique num nó ou item da lista** para abrir os detalhes
- **Filtro por tag** destaca um grupo específico

**Cores dos nós:**

| Status | Cor |
|--------|-----|
| A fazer | Vermelho |
| Em andamento | Amarelo |
| Em revisão | Roxo |
| Concluída | Verde |

### [>] Legado

Onde você **compartilha** tarefas como tutoriais.

- Lista de todas as tarefas publicadas
- **Busca** por título ou tag
- **Filtro por tag**

**Ações por tarefa:**

| Botão | Função |
|-------|--------|
| **> Ver detalhes** | Abre o modal |
| **[+] Exportar Markdown** | Baixa um arquivo `.md` com passos, aprendizados e anotações |
| **[#] Despublicar** | Remove do Legado |

### = Ações avançadas

Dentro do **modal de detalhes**, na seção `= Ações avançadas`:

| Botão | Função |
|-------|--------|
| **^ Evoluir** | Cria nova tarefa baseada nesta |
| **> Clonar** | Duplica a tarefa com novo ID (status "a fazer") |
| **[>] Publicar / [#] Despublicar** | Alterna publicação no Legado |
| **[x] Excluir** | Apaga permanentemente |

**Adicionar anotação:** em qualquer modal, digite no campo de texto e clique em **+ Adicionar anotação**. A anotação aparece na timeline com a data de hoje.

### Fluxo sugerido

```
1. Crie tarefas no Kanban
2. Arraste para A fazer → Andamento → Revisão → Concluída
3. Arraste ou clique em [#] Arquivar no Acervo
4. Evolua tarefas recorrentes com ^ Evoluir
5. Conecte tarefas por tags no Mapa
6. Publique no Legado o que vale compartilhar
7. Exporte como Markdown para guardar fora do app
```

---

## Arquitetura

O projeto segue **5 princípios**:

**1. Estado único** — todo o estado vive em `js/estado.js`:

```javascript
export const estado = {
    tarefas: [],          // array original
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
```

**2. Derivação sem mutação** — a lista visível é calculada a partir do estado, sem alterar o array original:

```javascript
export function derivarListaVisivel(estado) {
    let lista = [...estado.tarefas];   // cópia!
    // aplica busca, filtro, ordenação
    return lista;
}
```

**3. Ciclo único de atualização:**

```
Evento → altera estado → derivação → renderização
```

**4. Separação de responsabilidades:**

| Arquivo | Responsabilidade |
|---------|------------------|
| `api.js` | Buscar dados (fetch) |
| `estado.js` | Estado único + derivações |
| `estados.js` | 4 estados da tela (carregando, sucesso, erro, origem-vazia) |
| `renderizacao.js` | Desenhar cartões do Kanban |
| `acervo.js` | Modo Acervo |
| `mapa.js` | Modo Mapa |
| `legado.js` | Modo Legado |
| `modal.js` | Modais (detalhes, evolução, clonagem, nova tarefa) |
| `dragdrop.js` | Drag & drop entre colunas |
| `app.js` | Inicialização + eventos |

**5. Acessibilidade** — região de status com `role="status"` e `aria-live="polite"` anuncia cada mudança para leitores de tela. O elemento existe vazio no HTML desde o início.

---

## Tecnologias

- **HTML5** semântico
- **CSS3** com variáveis HSL, grid, flexbox, backdrop-filter
- **JavaScript** (ES Modules)
- **Fetch API** com `try/catch`, `response.ok` e tratamento de 4 tipos de erro
- **SVG** para o grafo do Mapa
- **GitHub Pages** para publicação

---

## Estrutura do projeto

```
/
├── index.html              # Estrutura da SPA (5 modos + modal)
├── README.md               # Este arquivo
├── dados.json              # Dados carregados por fetch
│
├── css/
│   └── style.css           # Tema terminal (dark + monocromia + 3 cores de prioridade)
│
├── logo/                   # Ícones das redes sociais
│   ├── github.png
│   ├── instagram.png
│   └── linkedln.png
│
└── js/
    ├── api.js              # Fetch
    ├── estado.js           # Estado único + derivação
    ├── estados.js          # 4 estados (carregando, sucesso, erro, origem-vazia)
    ├── renderizacao.js     # Kanban
    ├── acervo.js           # Acervo
    ├── mapa.js             # Mapa
    ├── legado.js           # Legado + exportação Markdown
    ├── modal.js            # Modais
    ├── dragdrop.js         # Drag & drop
    └── app.js              # Inicialização e eventos
```

---

## Princípios de design

- **Fonte única de verdade** — o estado é a fonte; a tela é uma projeção
- **Derivação sem mutação** — a lista visível é sempre recalculada
- **Ciclo único de atualização** — todo evento passa pelo mesmo ponto
- **Separação de responsabilidades** — buscar ≠ derivar ≠ renderizar
- **Acessibilidade** — região de status anuncia cada mudança
- **Estética de terminal** — sem emojis; apenas símbolos, monocromia e alto contraste
- **Zero frameworks** — JavaScript puro, ES Modules, SVG nativo

---

## Informações de criação

**Autora:** Jacyane Carvalho Martins  
**Disciplina:** Desenvolvimento Frontend — 2026.2  
**Orientação:** Profª Marianne Lacerda Dutra Theodoro  

**Etapas do projeto:**

- **E1** — Estrutura semântica e acessível
- **E2** — Layout responsivo (Flexbox + Grid)
- **E3** — Fetch e os 4 estados da tela
- **E4** — Estado único, busca, filtros e publicação
- **Projeto final** — Releitura como Canivete de Tarefas

**Links:**

- GitHub: [@Izzieee](https://github.com/Izzieee)
- Instagram: [@jacy_martins_](https://www.instagram.com/jacy_martins_)
- LinkedIn: [Jacyane Martins](https://www.linkedin.com/in/jacyane-martins-a6b0723a3)

---

## Licença

Projeto acadêmico — Desenvolvimento Frontend 2026.2.