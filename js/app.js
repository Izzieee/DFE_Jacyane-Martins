// js/app.js
import { carregarTarefas } from './api.js';
import { renderizarEstado } from './estados.js';
import { renderizarTarefas } from './renderizacao.js';
import { estado, derivarListaVisivel } from './estado.js';

// Torna funções acessíveis globalmente
window.renderizarTarefas = renderizarTarefas;

// ==========================================
// ALTERNADOR DE MODOS
// ==========================================
function trocarModo(novoModo) {
    // 1. Esconde todos os modos
    document.querySelectorAll('.modo').forEach(secao => {
        secao.classList.remove('ativo');
    });

    // 2. Mostra o modo escolhido
    const secao = document.getElementById(`modo-${novoModo}`);
    if (secao) secao.classList.add('ativo');

    // 3. Atualiza os botões
    document.querySelectorAll('nav.modos button').forEach(btn => {
        btn.classList.toggle('ativo', btn.dataset.modo === novoModo);
    });

    // 4. Atualiza o estado
    estado.modo = novoModo;

    // 5. Re-renderiza
    renderizar();
}

// ==========================================
// PONTO ÚNICO DE RENDERIZAÇÃO
// ==========================================
export function renderizar() {
    if (estado.carregando) {
        renderizarEstado('carregando', []);
        return;
    }
    if (estado.erro) {
        renderizarEstado('erro', estado.erro);
        return;
    }

    if (estado.tarefas.length === 0) {
        renderizarEstado('origem-vazia', []);
        return;
    }

    // Decide o que renderizar com base no modo ativo
    const listaVisivel = derivarListaVisivel(estado);
    window.estadoTotal = estado.tarefas.length;

    // Por enquanto, só o Kanban funciona
    // Nas próximas fases, adicionamos acervo/mapa/legado
    if (estado.modo === 'kanban') {
        renderizarEstado('sucesso', listaVisivel);
    } else {
        // Modos ainda não implementados
        // (nas próximas fases)
        console.log('Modo ainda não implementado:', estado.modo);
    }
}

// ==========================================
// CONECTAR CONTROLES
// ==========================================
function conectarControles() {
    // Alternador de modos
    document.querySelectorAll('nav.modos button').forEach(btn => {
        btn.addEventListener('click', () => {
            trocarModo(btn.dataset.modo);
        });
    });

    // Filtros do Kanban
    const busca = document.getElementById('titulo-tarefa');
    const status = document.getElementById('status');
    const prioridade = document.querySelectorAll('input[name="prioridade"]');
    const limpar = document.getElementById('btn-limpar');
    const ordenacao = document.getElementById('ordenacao');

    busca?.addEventListener('input', (e) => {
        estado.busca = e.target.value;
        renderizar();
    });

    status?.addEventListener('change', (e) => {
        estado.status = e.target.value;
        renderizar();
    });

    prioridade.forEach(radio => {
        radio.addEventListener('change', (e) => {
            estado.prioridade = e.target.value;
            renderizar();
        });
    });

    ordenacao?.addEventListener('change', (e) => {
        estado.ordenacao = e.target.value;
        renderizar();
    });

    limpar?.addEventListener('click', () => {
        estado.busca = '';
        estado.status = 'todos';
        estado.prioridade = 'todas';
        estado.ordenacao = 'padrao';

        if (busca) busca.value = '';
        if (status) status.value = 'todos';
        prioridade.forEach(r => { r.checked = false; });
        if (ordenacao) ordenacao.value = 'padrao';

        renderizar();
    });

    // Modal - fechar
    const modal = document.getElementById('modal');
    document.querySelector('.modal-fechar')?.addEventListener('click', () => {
        modal.hidden = true;
    });
    modal?.addEventListener('click', (e) => {
        if (e.target === modal) modal.hidden = true;
    });
}

// ==========================================
// INICIALIZAÇÃO
// ==========================================
async function iniciarAplicacao() {
    estado.carregando = true;
    renderizar();

    try {
        const tarefas = await carregarTarefas();
        estado.tarefas = tarefas;
        estado.carregando = false;
        estado.erro = null;
    } catch (erro) {
        estado.carregando = false;
        estado.erro = erro;
    }

    renderizar();
    conectarControles();
}

iniciarAplicacao();
window.estado = estado;