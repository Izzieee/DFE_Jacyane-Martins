// js/app.js
import { carregarTarefas } from './api.js';
import { renderizarEstado } from './estados.js';
import { renderizarTarefas } from './renderizacao.js';
import { estado, derivarListaVisivel } from './estado.js';
import { derivarAcervo, renderizarAcervo } from './acervo.js';

// Torna funções acessíveis globalmente
window.renderizarTarefas = renderizarTarefas;
window.renderizarAcervo = renderizarAcervo;

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

    // Atualiza total pro status region
    window.estadoTotal = estado.tarefas.length;

    // Decide o que renderizar com base no modo ativo
    switch (estado.modo) {
        case 'kanban': {
            const listaVisivel = derivarListaVisivel(estado);
            renderizarEstado('sucesso', listaVisivel);
            break;
        }
        case 'acervo': {
            const listaAcervo = derivarAcervo(estado);
            renderizarAcervo(listaAcervo);
            
            // Atualiza a região de status
            const statusRegion = document.getElementById('status-region');
            if (statusRegion) {
                statusRegion.textContent = `${listaAcervo.length} tarefa${listaAcervo.length !== 1 ? 's' : ''} no acervo`;
            }
            break;
        }
        case 'mapa':
            // Fase 6
            console.log('Modo mapa ainda não implementado');
            break;
        case 'legado':
            // Fase 7
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
}

// ==========================================
// EVENTOS DO MODO ACERVO
// ==========================================

// Busca no acervo
const buscaAcervo = document.getElementById('busca-acervo');
buscaAcervo?.addEventListener('input', (e) => {
    estado.buscaAcervo = e.target.value;
    if (estado.modo === 'acervo') renderizar();
});

// Clique nas tags de filtro (delegação)
const acervoTags = document.getElementById('acervo-tags');
acervoTags?.addEventListener('click', (e) => {
    const btn = e.target.closest('.tag-filtro');
    if (!btn) return;
    estado.tagSelecionada = btn.dataset.tag || null;
    renderizar();
});

// Ações dos cartões do acervo (delegação)
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
        console.log('Reabrir:', tarefa);
        alert(`Reabrir "${tarefa.titulo}" (em breve)`);
    } else if (acao === 'clonar') {
        console.log('Clonar:', tarefa);
        alert(`Clonar "${tarefa.titulo}" (em breve)`);
    }
});

// ==========================================
// EVENTO DELEGADO: ARQUIVAR NO ACERVO
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
        console.log('Arquivar tarefa:', tarefa);
        // Na Fase 4, vamos fazer algo de verdade aqui
        alert(`"${tarefa.titulo}" será arquivada no acervo! (em breve)`);
    }
});

// ==========================================
// MODAL DE DETALHES
// ==========================================
export function abrirModal(tarefa) {
    const modal = document.getElementById('modal');
    const corpo = document.getElementById('modal-corpo');
    if (!modal || !corpo) return;

    corpo.innerHTML = `
        <h2>${tarefa.titulo}</h2>
        <p><strong>Projeto:</strong> ${tarefa.projeto || '—'}</p>
        <p><strong>Responsável:</strong> ${tarefa.responsavel || '—'}</p>
        <p><strong>Concluída em:</strong> ${tarefa.concluidaEm || '—'}</p>
        <p><strong>Prioridade:</strong> ${tarefa.prioridade}</p>

        <div class="tags-cartao">
            ${(tarefa.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>

        ${tarefa.passos && tarefa.passos.length > 0 ? `
            <h3>📝 Passos</h3>
            <ol>
                ${tarefa.passos.map(p => `<li>${p}</li>`).join('')}
            </ol>
        ` : ''}

        ${tarefa.aprendizados && tarefa.aprendizados.length > 0 ? `
            <h3>💡 Aprendizados</h3>
            <ul>
                ${tarefa.aprendizados.map(a => `<li>${a}</li>`).join('')}
            </ul>
        ` : ''}

        ${tarefa.anotacoes && tarefa.anotacoes.length > 0 ? `
            <h3>📌 Anotações</h3>
            <ul class="timeline">
                ${tarefa.anotacoes.map(a => `
                    <li><strong>${a.data}:</strong> ${a.texto}</li>
                `).join('')}
            </ul>
        ` : ''}
    `;

    modal.hidden = false;
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
window.abrirModal = abrirModal;