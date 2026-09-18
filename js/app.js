// js/app.js
import { carregarTarefas } from './api.js';
import { renderizarEstado } from './estados.js';
import { renderizarTarefas } from './renderizacao.js';
import { estado, derivarListaVisivel } from './estado.js';
import { derivarAcervo, renderizarAcervo } from './acervo.js';
import { derivarMapa, renderizarMapa } from './mapa.js';
import { abrirModal } from './modal.js';

window.renderizarTarefas = renderizarTarefas;

// ==========================================
// ALTERNADOR DE MODOS
// ==========================================
function trocarModo(novoModo) {
    document.querySelectorAll('.modo').forEach(secao => {
        secao.classList.remove('ativo');
    });

    const secao = document.getElementById(`modo-${novoModo}`);
    if (secao) secao.classList.add('ativo');

    document.querySelectorAll('nav.modos button').forEach(btn => {
        btn.classList.toggle('ativo', btn.dataset.modo === novoModo);
    });

    estado.modo = novoModo;
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

    window.estadoTotal = estado.tarefas.length;

    switch (estado.modo) {
        case 'kanban': {
            const listaVisivel = derivarListaVisivel(estado);
            renderizarEstado('sucesso', listaVisivel);
            break;
        }
        case 'acervo': {
            const listaAcervo = derivarAcervo(estado);
            renderizarAcervo(listaAcervo);

            const statusRegion = document.getElementById('status-region');
            if (statusRegion) {
                statusRegion.textContent = `${listaAcervo.length} tarefa${listaAcervo.length !== 1 ? 's' : ''} no acervo`;
            }
            break;
        }
        case 'mapa': {
            const dadosMapa = derivarMapa(estado);
            renderizarMapa(dadosMapa);

            const statusRegion = document.getElementById('status-region');
            if (statusRegion) {
                statusRegion.textContent = `${dadosMapa.nos.length} tarefa${dadosMapa.nos.length !== 1 ? 's' : ''} no mapa`;
            }
            break;
        }
        case 'legado':
            console.log('Modo legado ainda não implementado');
            break;
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

    // ==========================================
    // EVENTOS DO MODO ACERVO
    // ==========================================
    const buscaAcervo = document.getElementById('busca-acervo');
    buscaAcervo?.addEventListener('input', (e) => {
        estado.buscaAcervo = e.target.value;
        if (estado.modo === 'acervo') renderizar();
    });

    const acervoTags = document.getElementById('acervo-tags');
    acervoTags?.addEventListener('click', (e) => {
        const btn = e.target.closest('.tag-filtro');
        if (!btn) return;
        estado.tagSelecionada = btn.dataset.tag || null;
        renderizar();
    });

    const acervoContainer = document.getElementById('acervo-container');
    acervoContainer?.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-acao]');
        if (!btn) return;

        const cartao = btn.closest('[data-tarefa-id]');
        const id = Number(cartao?.dataset.tarefaId);
        const tarefa = estado.tarefas.find(t => t.id === id);
        if (!tarefa) return;

        const acao = btn.dataset.acao;

        if (acao === 'ver-detalhes') {
            abrirModal(tarefa);
        } else if (acao === 'reabrir') {
            alert(`Reabrir "${tarefa.titulo}" (em breve)`);
        } else if (acao === 'clonar') {
            alert(`Clonar "${tarefa.titulo}" (em breve)`);
        }
    });

    // ==========================================
    // EVENTOS DO MODO MAPA
    // ==========================================
    const mapaTags = document.getElementById('mapa-tags');
    mapaTags?.addEventListener('click', (e) => {
        const btn = e.target.closest('.tag-filtro');
        if (!btn) return;
        estado.tagSelecionada = btn.dataset.tag || null;
        renderizar();
    });

    // ==========================================
    // EVENTO DELEGADO: ARQUIVAR NO ACERVO (Kanban)
    // ==========================================
    const container = document.getElementById('tarefas-container');
    container?.addEventListener('click', (evento) => {
        if (!(evento.target instanceof Element)) return;

        const botao = evento.target.closest('button[data-acao="arquivar"]');
        if (!botao || !container.contains(botao)) return;

        const cartao = botao.closest('[data-tarefa-id]');
        const id = Number(cartao?.dataset.tarefaId);
        const tarefa = estado.tarefas.find(t => t.id === id);

        if (tarefa) {
            alert(`"${tarefa.titulo}" será arquivada no acervo! (em breve)`);
        }
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

// ⚠️ DEBUG
window.estado = estado;
window.abrirModal = abrirModal;