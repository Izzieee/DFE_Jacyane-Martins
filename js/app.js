// js/app.js
import { carregarTarefas } from './api.js';
import { renderizarEstado } from './estados.js';
import { renderizarTarefas } from './renderizacao.js';
import { estado, derivarListaVisivel } from './estado.js';
import { derivarAcervo, renderizarAcervo } from './acervo.js';
import { derivarMapa, renderizarMapa } from './mapa.js';
import { derivarLegado, renderizarLegado, exportarMarkdown } from './legado.js';
import { abrirModal, abrirModalEvolucao, abrirModalNovaTarefa, abrirModalEditar } from './modal.js';
import { inicializarDragDrop } from './dragdrop.js';
import { salvarTarefas, carregarTarefasSalvas, limparTarefasSalvas, temDadosSalvos } from './persistencia.js';

window.renderizarTarefas = renderizarTarefas;

// ==========================================
// PERSISTÊNCIA AUTOMÁTICA
// ==========================================
let _salvarTimeout = null;
function agendarSalvar() {
    clearTimeout(_salvarTimeout);
    _salvarTimeout = setTimeout(() => {
        salvarTarefas(estado.tarefas);
    }, 300);
}

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
// BUSCA GLOBAL
// ==========================================
function buscaGlobal(termo) {
    const t = termo.toLowerCase().trim();
    if (!t) return [];

    return estado.tarefas.filter(tarefa => {
        const campos = [
            tarefa.titulo,
            tarefa.projeto,
            tarefa.responsavel,
            ...(tarefa.tags || []),
            ...(tarefa.passos || []),
            ...(tarefa.aprendizados || [])
        ];
        return campos.some(c => c && c.toLowerCase().includes(t));
    });
}

function renderizarBuscaGlobal(resultados, termo) {
    const modal = document.getElementById('modal');
    const corpo = document.getElementById('modal-corpo');
    if (!modal || !corpo) return;

    if (!termo.trim()) {
        corpo.innerHTML = `
            <h2>Busca global</h2>
            <p class="subtitulo">Digite algo para buscar em todas as tarefas.</p>
        `;
    } else if (resultados.length === 0) {
        corpo.innerHTML = `
            <h2>Busca global</h2>
            <p class="subtitulo">Nenhum resultado para "${termo}".</p>
        `;
    } else {
        corpo.innerHTML = `
            <h2>Busca global</h2>
            <p class="subtitulo">${resultados.length} resultado${resultados.length !== 1 ? 's' : ''} para "${termo}"</p>
            <ul class="busca-lista">
                ${resultados.map(t => `
                    <li class="busca-item" data-tarefa-id="${t.id}">
                        <strong>${t.titulo}</strong>
                        <small>${t.projeto || 'Sem projeto'} · ${t.status}</small>
                    </li>
                `).join('')}
            </ul>
        `;

        corpo.querySelectorAll('.busca-item').forEach(item => {
            item.addEventListener('click', () => {
                const id = Number(item.dataset.tarefaId);
                const tarefa = estado.tarefas.find(t => t.id === id);
                if (tarefa) abrirModal(tarefa);
            });
        });
    }

    modal.hidden = false;
}

// ==========================================
// EXPORTAR TUDO
// ==========================================
function exportarTudo() {
    const dados = {
        exportadoEm: new Date().toISOString(),
        total: estado.tarefas.length,
        tarefas: estado.tarefas
    };

    const blob = new Blob(
        [JSON.stringify(dados, null, 2)],
        { type: 'application/json;charset=utf-8' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `step-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    const statusRegion = document.getElementById('status-region');
    if (statusRegion) {
        statusRegion.textContent = `${estado.tarefas.length} tarefas exportadas`;
    }
}

// ==========================================
// RESETAR DADOS
// ==========================================
function resetarDados() {
    const confirmar = confirm(
        'Isso vai APAGAR todas as suas alterações e recarregar os dados originais.\n\n' +
        'Tem certeza?'
    );
    if (!confirmar) return;

    limparTarefasSalvas();
    location.reload();
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
        case 'legado': {
            const listaLegado = derivarLegado(estado);
            renderizarLegado(listaLegado);
            const statusRegion = document.getElementById('status-region');
            if (statusRegion) {
                statusRegion.textContent = `${listaLegado.length} ${listaLegado.length === 1 ? 'tutorial publicado' : 'tutoriais publicados'}`;
            }
            break;
        }
        case 'sobre': {
            const statusRegion = document.getElementById('status-region');
            if (statusRegion) {
                statusRegion.textContent = 'Sobre o S.T.E.P — manual e informações';
            }
            break;
        }
    }
}

// ==========================================
// CONECTAR CONTROLES
// ==========================================
function conectarControles() {
    document.querySelectorAll('nav.modos button').forEach(btn => {
        btn.addEventListener('click', () => trocarModo(btn.dataset.modo));
    });

    // Nova tarefa
    document.getElementById('btn-nova-tarefa')?.addEventListener('click', () => abrirModalNovaTarefa());

    // Exportar tudo
    document.getElementById('btn-exportar-tudo')?.addEventListener('click', exportarTudo);

    // Resetar dados
    document.getElementById('btn-resetar-dados')?.addEventListener('click', resetarDados);

    // Busca global
    const inputBuscaGlobal = document.getElementById('busca-global');
    inputBuscaGlobal?.addEventListener('input', (e) => {
        const resultados = buscaGlobal(e.target.value);
        renderizarBuscaGlobal(resultados, e.target.value);
    });

    // Filtros do Kanban
    const busca = document.getElementById('titulo-tarefa');
    const status = document.getElementById('status');
    const prioridade = document.querySelectorAll('input[name="prioridade"]');
    const limpar = document.getElementById('btn-limpar');
    const ordenacao = document.getElementById('ordenacao');

    busca?.addEventListener('input', (e) => { estado.busca = e.target.value; renderizar(); });
    status?.addEventListener('change', (e) => { estado.status = e.target.value; renderizar(); });
    prioridade.forEach(radio => {
        radio.addEventListener('change', (e) => { estado.prioridade = e.target.value; renderizar(); });
    });
    ordenacao?.addEventListener('change', (e) => { estado.ordenacao = e.target.value; renderizar(); });

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
    document.querySelector('.modal-fechar')?.addEventListener('click', () => { modal.hidden = true; });
    modal?.addEventListener('click', (e) => { if (e.target === modal) modal.hidden = true; });

    // Acervo
    document.getElementById('busca-acervo')?.addEventListener('input', (e) => {
        estado.buscaAcervo = e.target.value;
        if (estado.modo === 'acervo') renderizar();
    });

    document.getElementById('acervo-tags')?.addEventListener('click', (e) => {
        const btn = e.target.closest('.tag-filtro');
        if (!btn) return;
        estado.tagSelecionada = btn.dataset.tag || null;
        renderizar();
    });

    document.getElementById('acervo-container')?.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-acao]');
        if (!btn) return;
        const cartao = btn.closest('[data-tarefa-id]');
        const id = Number(cartao?.dataset.tarefaId);
        const tarefa = estado.tarefas.find(t => t.id === id);
        if (!tarefa) return;

        const acao = btn.dataset.acao;
        if (acao === 'ver-detalhes') abrirModal(tarefa);
        else if (acao === 'evoluir') abrirModalEvolucao(tarefa);
        else if (acao === 'publicar') {
            tarefa.publica = !tarefa.publica;
            agendarSalvar();
            renderizar();
            const statusRegion = document.getElementById('status-region');
            if (statusRegion) {
                statusRegion.textContent = tarefa.publica
                    ? `"${tarefa.titulo}" publicada no Legado`
                    : `"${tarefa.titulo}" despublicada`;
            }
        }
    });

    // Mapa
    document.getElementById('mapa-tags')?.addEventListener('click', (e) => {
        const btn = e.target.closest('.tag-filtro');
        if (!btn) return;
        estado.tagSelecionada = btn.dataset.tag || null;
        renderizar();
    });

    // Legado
    document.getElementById('busca-legado')?.addEventListener('input', (e) => {
        estado.buscaLegado = e.target.value;
        if (estado.modo === 'legado') renderizar();
    });

    document.getElementById('legado-tags')?.addEventListener('click', (e) => {
        const btn = e.target.closest('.tag-filtro');
        if (!btn) return;
        estado.tagSelecionada = btn.dataset.tag || null;
        renderizar();
    });

    document.getElementById('legado-container')?.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-acao]');
        if (!btn) return;
        const cartao = btn.closest('[data-tarefa-id]');
        const id = Number(cartao?.dataset.tarefaId);
        const tarefa = estado.tarefas.find(t => t.id === id);
        if (!tarefa) return;

        const acao = btn.dataset.acao;
        if (acao === 'ver-detalhes') abrirModal(tarefa);
        else if (acao === 'exportar') exportarMarkdown(tarefa);
        else if (acao === 'despublicar') {
            tarefa.publica = false;
            agendarSalvar();
            renderizar();
            const statusRegion = document.getElementById('status-region');
            if (statusRegion) statusRegion.textContent = `"${tarefa.titulo}" despublicada`;
        }
    });

    // Kanban
    const container = document.getElementById('tarefas-container');

    container?.addEventListener('click', (evento) => {
        const botao = evento.target.closest('button[data-acao]');
        if (!botao || !container.contains(botao)) return;

        const cartao = botao.closest('[data-tarefa-id]');
        const id = Number(cartao?.dataset.tarefaId);
        const tarefa = estado.tarefas.find(t => t.id === id);
        if (!tarefa) return;

        const acao = botao.dataset.acao;

        if (acao === 'arquivar') {
            tarefa.arquivada = true;
            agendarSalvar();
            renderizar();
            const statusRegion = document.getElementById('status-region');
            if (statusRegion) statusRegion.textContent = `"${tarefa.titulo}" arquivada no acervo`;
        } else if (acao === 'excluir') {
            const confirmar = confirm(`Tem certeza que quer excluir "${tarefa.titulo}"?`);
            if (!confirmar) return;
            const idx = estado.tarefas.findIndex(t => t.id === id);
            if (idx >= 0) estado.tarefas.splice(idx, 1);
            agendarSalvar();
            renderizar();
            const statusRegion = document.getElementById('status-region');
            if (statusRegion) statusRegion.textContent = `"${tarefa.titulo}" excluída`;
        }
    });

    inicializarDragDrop(container, (id, novoStatus) => {
        const tarefa = estado.tarefas.find(t => t.id === id);
        if (!tarefa) return;

        tarefa.status = novoStatus;
        if (novoStatus === 'concluida') {
            tarefa.concluidaEm = new Date().toLocaleDateString('pt-BR');
        } else {
            tarefa.concluidaEm = null;
        }

        agendarSalvar();
        renderizar();

        const statusRegion = document.getElementById('status-region');
        if (statusRegion) {
            statusRegion.textContent = `"${tarefa.titulo}" movida para "${novoStatus}"`;
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
        // 1. Tenta carregar dados salvos
        const salvas = carregarTarefasSalvas();

        if (salvas && salvas.length > 0) {
            // Usa dados salvos
            estado.tarefas = salvas;
            const statusRegion = document.getElementById('status-region');
            if (statusRegion) {
                setTimeout(() => {
                    statusRegion.textContent = `${salvas.length} tarefas carregadas do navegador`;
                }, 100);
            }
        } else {
            // Carrega do JSON
            const tarefas = await carregarTarefas();
            estado.tarefas = tarefas;
            salvarTarefas(tarefas);
        }

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
window.abrirModalEvolucao = abrirModalEvolucao;
window.abrirModalNovaTarefa = abrirModalNovaTarefa;
window.abrirModalEditar = abrirModalEditar;
window.renderizar = renderizar;
window.trocarModo = trocarModo;
window.exportarTudo = exportarTudo;