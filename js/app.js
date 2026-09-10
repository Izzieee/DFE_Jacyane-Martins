// js/app.js
import { carregarTarefas } from './api.js';
import { renderizarEstado } from './estados.js';
import { renderizarTarefas } from './renderizacao.js';
import { estado, derivarListaVisivel } from './estado.js';

// Torna funções acessíveis globalmente (usadas por estados.js)
window.renderizarTarefas = renderizarTarefas;

// ==========================================
// PONTO ÚNICO DE RENDERIZAÇÃO
// Toda mudança no estado passa por aqui
// ==========================================
export function renderizar() {
    // Caso especial: carregando ou erro
    if (estado.carregando) {
        renderizarEstado('carregando', []);
        return;
    }
    if (estado.erro) {
        renderizarEstado('erro', estado.erro);
        return;
    }

    // Origem vazia (JSON sem tarefas)
    if (estado.tarefas.length === 0) {
        renderizarEstado('origem-vazia', []);
        return;
    }

    // Derivar lista visível
    const listaVisivel = derivarListaVisivel(estado);
    window.estadoTotal = estado.tarefas.length;

    // Sucesso (pode ser lista cheia ou resultado vazio)
    renderizarEstado('sucesso', listaVisivel);
}

// ==========================================
// INICIALIZAÇÃO
// ==========================================
async function iniciarAplicacao() {
    // 1. Estado: carregando (ANTES do await)
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

    // 2. Renderizar com o resultado
    renderizar();

    // 3. Conectar os controles (só UMA vez)
    conectarControles();
    conectarEventosDelegados();
}

// ==========================================
// CONECTAR OS CONTROLES AO ESTADO
// ==========================================
function conectarControles() {
    const busca = document.getElementById('titulo-tarefa');
    const status = document.getElementById('status');
    const prioridade = document.querySelectorAll('input[name="prioridade"]');
    const limpar = document.getElementById('btn-limpar');

    // Busca por título
    busca?.addEventListener('input', (e) => {
        estado.busca = e.target.value;
        renderizar();
    });

    // Filtro de status
    status?.addEventListener('change', (e) => {
        estado.status = e.target.value;
        renderizar();
    });

    // Filtro de prioridade (radios)
    prioridade.forEach(radio => {
        radio.addEventListener('change', (e) => {
            estado.prioridade = e.target.value;
            renderizar();
        });
    });

    // Botão Limpar filtros
    limpar?.addEventListener('click', () => {
        // 1. Resetar o ESTADO
        estado.busca = '';
        estado.status = 'todos';
        estado.prioridade = 'todas';
        estado.ordenacao = 'padrao';

        // 2. Resetar os CONTROLES
        if (busca) busca.value = '';
        if (status) status.value = 'todos';
        prioridade.forEach(r => { r.checked = false; });

        // 3. Renderizar
        renderizar();
    });

    // Ordenação (se você criar um select de ordenação)
    const ordenacao = document.getElementById('ordenacao');
    ordenacao?.addEventListener('change', (e) => {
        estado.ordenacao = e.target.value;
        renderizar();
    });
}

// ==========================================
// EVENTOS DELEGADOS DOS CARTÕES (da E3)
// ==========================================
function conectarEventosDelegados() {
    const container = document.getElementById('tarefas-container');
    if (!container) return;

    container.addEventListener('click', (evento) => {
        if (!(evento.target instanceof Element)) return;

        const botao = evento.target.closest('button[data-acao="ver-detalhes"]');
        if (!botao || !container.contains(botao)) return;

        const cartao = botao.closest('[data-tarefa-id]');
        const tarefa = estado.tarefas.find(
            item => item.id === Number(cartao?.dataset.tarefaId)
        );

        if (tarefa) {
            console.log('Detalhes da tarefa:', tarefa);
        }
    });
}

// Iniciar
iniciarAplicacao();