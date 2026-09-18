// js/estado.js

// ==========================================
// ESTADO ÚNICO DA APLICAÇÃO
// ==========================================
export const estado = {
    // ===== CAMPOS DA E4 =====
    tarefas: [],
    busca: '',
    status: 'todos',
    prioridade: 'todas',
    ordenacao: 'padrao',
    carregando: false,
    erro: null,

    // ===== CAMPOS DA FASE 1 =====
    modo: 'kanban',
    tagSelecionada: null,
    tarefaSelecionada: null,

    // ===== CAMPOS DA FASE 4 =====
    buscaAcervo: ''
};

// ==========================================
// FUNÇÃO DE DERIVAÇÃO (Kanban)
// ==========================================
export function derivarListaVisivel(estadoAtual) {
    let lista = [...estadoAtual.tarefas];

    if (estadoAtual.busca.trim() !== '') {
        const termo = estadoAtual.busca.toLowerCase();
        lista = lista.filter(tarefa =>
            tarefa.titulo.toLowerCase().includes(termo)
        );
    }

    if (estadoAtual.status !== 'todos') {
        lista = lista.filter(tarefa => tarefa.status === estadoAtual.status);
    }

    if (estadoAtual.prioridade !== 'todas') {
        lista = lista.filter(tarefa => tarefa.prioridade === estadoAtual.prioridade);
    }

    if (estadoAtual.ordenacao === 'prazo') {
        lista = [...lista].sort((a, b) => {
            const dataA = converterData(a.prazo);
            const dataB = converterData(b.prazo);
            return dataA - dataB;
        });
    }

    return lista;
}

function converterData(texto) {
    if (!texto) return new Date(0);
    const [dia, mes, ano] = texto.split('/');
    return new Date(ano, mes - 1, dia);
}