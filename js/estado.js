// js/estado.js

// ==========================================
// ESTADO ÚNICO DA APLICAÇÃO
// ==========================================
export const estado = {
    // ===== CAMPOS DA E4 =====
    tarefas: [],              // array original (nunca alterado)
    busca: '',                // texto digitado na busca
    status: 'todos',          // filtro de status
    prioridade: 'todas',      // filtro de prioridade
    ordenacao: 'padrao',      // 'padrao' ou 'prazo'
    carregando: false,        // true enquanto busca dados
    erro: null,               // erro atual (se houver)

    // ===== NOVOS CAMPOS (FASE 1) =====
    modo: 'kanban',           // 'kanban', 'acervo', 'mapa', 'legado'
    tagSelecionada: null,     // qual tag está filtrada (acervo/mapa)
    tarefaSelecionada: null,   // qual tarefa está no modal
    buscaAcervo: ''
};

// ==========================================
// FUNÇÃO DE DERIVAÇÃO
// Recebe o estado, devolve a lista visível
// NÃO altera o estado, NÃO altera o array original
// ==========================================
export function derivarListaVisivel(estadoAtual) {
    // 1. COPIAR o array (não mexer no original!)
    let lista = [...estadoAtual.tarefas];

    // 2. APLICAR BUSCA (case-insensitive)
    if (estadoAtual.busca.trim() !== '') {
        const termo = estadoAtual.busca.toLowerCase();
        lista = lista.filter(tarefa =>
            tarefa.titulo.toLowerCase().includes(termo)
        );
    }

    // 3. APLICAR FILTRO DE STATUS
    if (estadoAtual.status !== 'todos') {
        lista = lista.filter(tarefa => tarefa.status === estadoAtual.status);
    }

    // 4. APLICAR FILTRO DE PRIORIDADE
    if (estadoAtual.prioridade !== 'todas') {
        lista = lista.filter(tarefa => tarefa.prioridade === estadoAtual.prioridade);
    }

    // 5. APLICAR ORDENAÇÃO (copiar de novo antes de sort)
    if (estadoAtual.ordenacao === 'prazo') {
        lista = [...lista].sort((a, b) => {
            const dataA = converterData(a.prazo);
            const dataB = converterData(b.prazo);
            return dataA - dataB;
        });
    }

    return lista;
}

// ==========================================
// FUNÇÃO AUXILIAR
// Converte "DD/MM/AAAA" em Date
// ==========================================
function converterData(texto) {
    if (!texto) return new Date(0);
    const [dia, mes, ano] = texto.split('/');
    return new Date(ano, mes - 1, dia);
}