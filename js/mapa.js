// js/mapa.js
import { abrirModal } from './modal.js';

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

export function renderizarMapa({ nos, arestas }) {
    const container = document.getElementById('mapa-container');
    if (!container) return;

    renderizarTagsMapa();

    if (nos.length === 0) {
        container.innerHTML = `
            <div class="estado-vazio">
                <p>Nenhuma tarefa para mostrar</p>
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
        'fazer': 'hsl(355, 100%, 49%)',
        'andamento': 'hsl(59, 100%, 50%)',
        'revisao': 'hsl(278, 78%, 31%)',
        'concluida': 'hsl(133, 81%, 29%)'
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
                stroke="hsl(214 31% 34%)" 
                stroke-width="2"
                stroke-dasharray="4 4"
            />
        `;
    });

    nos.forEach(no => {
        const pos = posicoes[no.id];
        const cor = corPorStatus[no.status] || corPorStatus.fazer;
        const tituloCurto = no.titulo.length > 20 
            ? no.titulo.substring(0, 18) + '...' 
            : no.titulo;

        svg += `
            <g class="mapa-no" data-tarefa-id="${no.id}">
                <circle 
                    cx="${pos.x}" cy="${pos.y}" r="28" 
                    fill="${cor}" 
                    stroke="hsl(220 40% 8%)" 
                    stroke-width="2"
                    style="cursor: pointer;"
                />
                <text 
                    x="${pos.x}" y="${pos.y + 45}" 
                    text-anchor="middle" 
                    fill="hsl(210 100% 96%)" 
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
            <span class="mapa-cor" style="background: ${corPorStatus[no.status] || corPorStatus.fazer}"></span>
            <div class="mapa-item-info">
                <strong>${no.titulo}</strong>
                <small>${labelPorStatus[no.status] || no.status}</small>
            </div>
        </li>
    `).join('');

    container.innerHTML = `
        <div class="mapa-info">
            <p>${nos.length} ${nos.length === 1 ? 'tarefa' : 'tarefas'} · ${arestas.length} ${arestas.length === 1 ? 'conexão' : 'conexões'}</p>
        </div>
        <div class="mapa-layout">
            <aside class="mapa-lateral">
                <h3>Tarefas (${nos.length})</h3>
                <ul class="mapa-lista">
                    ${listaHTML}
                </ul>
            </aside>
            <div class="mapa-grafo">
                ${svg}
            </div>
        </div>
    `;

    container.querySelectorAll('.mapa-item').forEach(item => {
        item.addEventListener('click', () => {
            const id = Number(item.dataset.tarefaId);
            const tarefa = window.estado.tarefas.find(t => t.id === id);
            if (tarefa) abrirModal(tarefa);
        });
    });

    container.querySelectorAll('.mapa-no').forEach(no => {
        no.addEventListener('click', () => {
            const id = Number(no.dataset.tarefaId);
            const tarefa = window.estado.tarefas.find(t => t.id === id);
            if (tarefa) abrirModal(tarefa);
        });
    });
}

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
        <button type="button" class="tag-filtro ${!tagSelecionada ? 'ativa' : ''}" data-tag="">
            Todas
        </button>
        ${tags.map(tag => `
            <button type="button" class="tag-filtro ${tagSelecionada === tag ? 'ativa' : ''}" data-tag="${tag}">
                ${tag}
            </button>
        `).join('')}
    `;
}