// js/legado.js
// RESPONSABILIDADE: MODO LEGADO — publicar tarefas como tutoriais

import { abrirModal } from './modal.js';

// ==========================================
// DERIVAÇÃO: só tarefas públicas
// ==========================================
export function derivarLegado(estado) {
    let lista = estado.tarefas.filter(t => t.publica === true);

    if (estado.buscaLegado && estado.buscaLegado.trim() !== '') {
        const termo = estado.buscaLegado.toLowerCase();
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

// ==========================================
// RENDERIZAÇÃO
// ==========================================
export function renderizarLegado(lista) {
    const container = document.getElementById('legado-container');
    if (!container) return;

    renderizarTagsLegado();

    if (lista.length === 0) {
        container.innerHTML = `
            <div class="estado-vazio">
                <p>📤 Nenhum tutorial publicado</p>
                <p class="subtitulo">Publique tarefas do acervo para vê-las aqui</p>
            </div>
        `;
        return;
    }

    container.innerHTML = lista.map(tarefa => `
        <article class="cartao-legado" data-tarefa-id="${tarefa.id}">
            <header class="legado-cabecalho">
                <h3>📄 ${tarefa.titulo}</h3>
                <span class="data-publicacao">📅 ${tarefa.concluidaEm || 'sem data'}</span>
            </header>

            <div class="tags-cartao">
                ${(tarefa.tags || []).map(tag => 
                    `<span class="tag">${tag}</span>`
                ).join('')}
            </div>

            ${tarefa.aprendizados && tarefa.aprendizados.length > 0 ? `
                <div class="resumo-aprendizados">
                    <strong>💡 Aprendizados:</strong>
                    <ul>
                        ${tarefa.aprendizados.slice(0, 2).map(a => `<li>${a}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}

            <footer class="legado-acoes">
                <button type="button" class="btn-legado" data-acao="ver-detalhes">
                    👁️ Ver detalhes
                </button>
                <button type="button" class="btn-legado" data-acao="exportar">
                    📥 Exportar Markdown
                </button>
                <button type="button" class="btn-legado" data-acao="despublicar">
                    🔒 Despublicar
                </button>
            </footer>
        </article>
    `).join('');
}

// ==========================================
// TAGS DISPONÍVEIS
// ==========================================
export function renderizarTagsLegado() {
    const container = document.getElementById('legado-tags');
    if (!container) return;

    const tagsUnicas = new Set();
    window.estado.tarefas
        .filter(t => t.publica === true)
        .forEach(t => (t.tags || []).forEach(tag => tagsUnicas.add(tag)));

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

// ==========================================
// EXPORTAR COMO MARKDOWN
// ==========================================
export function exportarMarkdown(tarefa) {
    const linhas = [];

    linhas.push(`# ${tarefa.titulo}`);
    linhas.push('');
    linhas.push(`**Projeto:** ${tarefa.projeto || '—'}`);
    linhas.push(`**Responsável:** ${tarefa.responsavel || '—'}`);
    linhas.push(`**Concluída em:** ${tarefa.concluidaEm || '—'}`);
    linhas.push(`**Prioridade:** ${tarefa.prioridade}`);
    linhas.push('');
    linhas.push(`**Tags:** ${(tarefa.tags || []).join(', ')}`);
    linhas.push('');

    if (tarefa.passos && tarefa.passos.length > 0) {
        linhas.push('## 📝 Passos');
        linhas.push('');
        tarefa.passos.forEach((p, i) => {
            linhas.push(`${i + 1}. ${p}`);
        });
        linhas.push('');
    }

    if (tarefa.aprendizados && tarefa.aprendizados.length > 0) {
        linhas.push('## 💡 Aprendizados');
        linhas.push('');
        tarefa.aprendizados.forEach(a => {
            linhas.push(`- ${a}`);
        });
        linhas.push('');
    }

    if (tarefa.anotacoes && tarefa.anotacoes.length > 0) {
        linhas.push('## 📌 Anotações');
        linhas.push('');
        tarefa.anotacoes.forEach(a => {
            linhas.push(`- **${a.data}:** ${a.texto}`);
        });
        linhas.push('');
    }

    const conteudo = linhas.join('\n');
    const blob = new Blob([conteudo], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${tarefa.titulo.replace(/\s+/g, '-').toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    const statusRegion = document.getElementById('status-region');
    if (statusRegion) {
        statusRegion.textContent = `"${tarefa.titulo}" exportada como Markdown`;
    }
}