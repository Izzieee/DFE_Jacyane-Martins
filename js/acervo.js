// js/acervo.js
import { abrirModalEvolucao, abrirModal } from './modal.js';

export function derivarAcervo(estado) {
    // ⭐ Mostra tarefas arquivadas OU concluídas (compatibilidade)
    let lista = estado.tarefas.filter(t => 
        t.arquivada === true || t.status === 'concluida'
    );

    if (estado.buscaAcervo && estado.buscaAcervo.trim() !== '') {
        const termo = estado.buscaAcervo.toLowerCase();
        lista = lista.filter(tarefa => {
            const tituloMatch = tarefa.titulo.toLowerCase().includes(termo);
            const tagMatch = tarefa.tags?.some(tag => 
                tag.toLowerCase().includes(termo)
            );
            return tituloMatch || tagMatch;
        });
    }

    if (estado.tagSelecionada) {
        lista = lista.filter(tarefa =>
            tarefa.tags?.includes(estado.tagSelecionada)
        );
    }

    return lista;
}

export function renderizarAcervo(lista) {
    const container = document.getElementById('acervo-container');
    if (!container) return;

    renderizarTagsDisponiveis();

    if (lista.length === 0) {
        container.innerHTML = `
            <div class="estado-vazio">
                <p>📭 Nenhuma tarefa no acervo</p>
                <p class="subtitulo">Conclua e arquive tarefas no Kanban para vê-las aqui</p>
            </div>
        `;
        return;
    }

    container.innerHTML = lista.map(tarefa => `
        <article class="cartao-acervo" data-tarefa-id="${tarefa.id}">
            <header class="acervo-cabecalho">
                <h3>✅ ${tarefa.titulo}</h3>
                <span class="data-conclusao">📅 ${tarefa.concluidaEm || 'sem data'}</span>
            </header>

            <div class="tags-cartao">
                ${(tarefa.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>

            ${tarefa.aprendizados && tarefa.aprendizados.length > 0 ? `
                <div class="resumo-aprendizados">
                    <strong>💡 Aprendizados:</strong>
                    <ul>${tarefa.aprendizados.map(a => `<li>${a}</li>`).join('')}</ul>
                </div>
            ` : ''}

            ${tarefa.anotacoes && tarefa.anotacoes.length > 0 ? `
                <div class="contagem-anotacoes">
                    📌 ${tarefa.anotacoes.length} anotaç${tarefa.anotacoes.length === 1 ? 'ão' : 'ões'}
                </div>
            ` : ''}

            <footer class="acervo-acoes">
                <button type="button" class="btn-acervo btn-evoluir-acervo" data-acao="evoluir">
                    ⬆️ Evoluir Tarefa
                </button>
                <button type="button" class="btn-acervo" data-acao="ver-detalhes">
                    👁️ Ver detalhes
                </button>
                <button type="button" class="btn-acervo" data-acao="publicar">
                    ${tarefa.publica ? '🔒 Despublicar' : '📤 Publicar'}
                </button>
            </footer>
        </article>
    `).join('');
}

export function renderizarTagsDisponiveis() {
    const container = document.getElementById('acervo-tags');
    if (!container) return;

    const tagsUnicas = new Set();
    window.estado.tarefas
        .filter(t => t.arquivada === true || t.status === 'concluida')
        .forEach(t => (t.tags || []).forEach(tag => tagsUnicas.add(tag)));

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