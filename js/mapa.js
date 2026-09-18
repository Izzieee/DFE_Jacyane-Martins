// js/mapa.js
// RESPONSABILIDADE: MODO MAPA — grafo de tarefas conectadas por tags

import { abrirModal } from './modal.js';

// ==========================================
// DERIVAÇÃO: constrói nós e arestas
// ==========================================
export function derivarMapa(estado) {
    let tarefas = estado.tarefas;
    if (estado.tagSelecionada) {
        tarefas = tarefas.filter(t =>
            t.tags?.includes(estado.tagSelecionada)
        );
    }

    const nos = tarefas.map(t => ({
        id: t.id,
        titulo: t.titulo,
        tags: t.tags || [],
        status: t.status,
        prioridade: t.prioridade
    }));

    const arestas = [];
    for (let i = 0; i < nos.length; i++) {
        for (let j = i + 1; j < nos.length; j++) {
            const tagsComuns = nos[i].tags.filter(tag =>
                nos[j].tags.includes(tag)
            );
            if (tagsComuns.length > 0) {
                arestas.push({
                    de: nos[i].id,
                    para: nos[j].id,
                    tags: tagsComuns
                });
            }
        }
    }

    return { nos, arestas };
}

// ==========================================
// RENDERIZAÇÃO: SVG com nós e arestas + barra lateral
// ==========================================
export function renderizarMapa({ nos, arestas }) {
    const container = document.getElementById('mapa-container');
    if (!container) return;

    renderizarTagsMapa();

    if (nos.length === 0) {
        container.innerHTML = `
            <div class="estado-vazio">
                <p>🕸️ Nenhuma tarefa para mostrar</p>
                <p class="subtitulo">Tente limpar os filtros</p>
            </div>
        `;
        return;
    }

    const largura = 900;
    const altura = 500;
    const centroX = largura / 2;
    const centroY = altura / 2;
    const raio = Math.min(centroX, centroY) - 80;

    const posicoes = {};
    nos.forEach((no, i) => {
        const angulo = (2 * Math.PI * i) / nos.length - Math.PI / 2;
        posicoes[no.id] = {
            x: centroX + raio * Math.cos(angulo),
            y: centroY + raio * Math.sin(angulo)
        };
    });

    const corPorStatus = {
        'fazer': '#ffd700',
        'andamento': '#e0b400',
        'revisao': '#b98f00',
        'concluida': '#fff3b8'
    };

    const labelPorStatus = {
        'fazer': 'A fazer',
        'andamento': 'Em andamento',
        'revisao': 'Revisão',
        'concluida': 'Concluída'
    };

    let svg = `<svg viewBox="0 0 ${largura} ${altura}" class="mapa-svg" xmlns="http://www.w3.org/2000/svg">`;

    arestas.forEach(aresta => {
        const de = posicoes[aresta.de];
        const para = posicoes[aresta.para];
        if (!de || !para) return;

        svg += `
            <line 
                x1="${de.x}" y1="${de.y}" 
                x2="${para.x}" y2="${para.y}" 
                stroke="#3a3a3a" 
                stroke-width="2"
                stroke-dasharray="4 4"
            />
        `;
    });

    nos.forEach(no => {
        const pos = posicoes[no.id];
        const cor = corPorStatus[no.status] || '#ffd700';
        const tituloCurto = no.titulo.length > 20 
            ? no.titulo.substring(0, 18) + '...' 
            : no.titulo;

        svg += `
            <g class="mapa-no" data-tarefa-id="${no.id}">
                <circle 
                    cx="${pos.x}" cy="${pos.y}" r="28" 
                    fill="${cor}" 
                    stroke="#0a0a0a" 
                    stroke-width="2"
                    style="cursor: pointer;"
                />
                <text 
                    x="${pos.x}" y="${pos.y + 45}" 
                    text-anchor="middle" 
                    fill="#f3f3ec" 
                    font-size="11"
                    font-family="inherit"
                    style="pointer-events: none;"
                >
                    ${tituloCurto}
                </text>
                <title>${no.titulo} — ${no.tags.join(', ')}</title>
            </g>
        `;
    });

    svg += `</svg>`;

    const listaHTML = nos.map(no => `
        <li class="mapa-item" data-tarefa-id="${no.id}">
            <span class="mapa-cor" style="background: ${corPorStatus[no.status] || '#ffd700'}"></span>
            <div class="mapa-item-info">
                <strong>${no.titulo}</strong>
                <small>${labelPorStatus[no.status] || no.status}</small>
            </div>
        </li>
    `).join('');

    container.innerHTML = `
        <div class="mapa-info">
            <p>🕸️ ${nos.length} ${nos.length === 1 ? 'tarefa' : 'tarefas'} · ${arestas.length} ${arestas.length === 1 ? 'conexão' : 'conexões'}</p>
        </div>
        <div class="mapa-layout">
            <aside class="mapa-lateral">
                <h3>📋 Tarefas (${nos.length})</h3>
                <ul class="mapa-lista">
                    ${listaHTML}
                </ul>
            </aside>
            <div class="mapa-grafo">
                ${svg}
            </div>
        </div>
    `;

    // Evento de clique nos itens da lista
    container.querySelectorAll('.mapa-item').forEach(item => {
        item.addEventListener('click', () => {
            const id = Number(item.dataset.tarefaId);
            const tarefa = window.estado.tarefas.find(t => t.id === id);
            if (tarefa) abrirModal(tarefa);
        });
    });

    // Evento de clique nos nós do SVG
    container.querySelectorAll('.mapa-no').forEach(no => {
        no.addEventListener('click', () => {
            const id = Number(no.dataset.tarefaId);
            const tarefa = window.estado.tarefas.find(t => t.id === id);
            if (tarefa) abrirModal(tarefa);
        });
    });
}

// ==========================================
// RENDERIZAÇÃO: tags disponíveis (filtros)
// ==========================================
export function renderizarTagsMapa() {
    const container = document.getElementById('mapa-tags');
    if (!container) return;

    const tagsUnicas = new Set();
    window.estado.tarefas.forEach(t => 
        (t.tags || []).forEach(tag => tagsUnicas.add(tag))
    );

    const tags = Array.from(tagsUnicas).sort();
    const tagSelecionada = window.estado.tagSelecionada;

    container.innerHTML = `
        <button type="button" 
                class="tag-filtro ${!tagSelecionada ? 'ativa' : ''}" 
                data-tag="">
            Todas
        </button>
        ${tags.map(tag => `
            <button type="button" 
                    class="tag-filtro ${tagSelecionada === tag ? 'ativa' : ''}" 
                    data-tag="${tag}">
                ${tag}
            </button>
        `).join('')}
    `;
}