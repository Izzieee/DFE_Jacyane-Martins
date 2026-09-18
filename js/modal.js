// js/modal.js
// RESPONSABILIDADE: Modal de detalhes e anotações

export function abrirModal(tarefa) {
    const modal = document.getElementById('modal');
    const corpo = document.getElementById('modal-corpo');
    if (!modal || !corpo) return;

    window.estado.tarefaSelecionada = tarefa.id;

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

        <h3>📌 Anotações</h3>
        <div id="anotacoes-lista">
            ${renderizarAnotacoes(tarefa.anotacoes || [])}
        </div>

        <form id="form-anotacao" class="form-anotacao">
            <label for="texto-anotacao">Nova anotação:</label>
            <textarea 
                id="texto-anotacao" 
                rows="3" 
                placeholder="O que você quer registrar sobre esta tarefa?"
                required
            ></textarea>
            <button type="submit" class="btn-anotar">➕ Adicionar anotação</button>
        </form>
    `;

    modal.hidden = false;

    const form = document.getElementById('form-anotacao');
    form?.addEventListener('submit', (e) => {
        e.preventDefault();
        adicionarAnotacao(tarefa.id);
    });
}

function renderizarAnotacoes(anotacoes) {
    if (!anotacoes || anotacoes.length === 0) {
        return `<p class="sem-anotacoes">Nenhuma anotação ainda.</p>`;
    }

    return `
        <ul class="timeline">
            ${anotacoes.map(a => `
                <li>
                    <strong>${a.data}:</strong> ${a.texto}
                </li>
            `).join('')}
        </ul>
    `;
}

function adicionarAnotacao(idTarefa) {
    const textarea = document.getElementById('texto-anotacao');
    if (!textarea) return;

    const texto = textarea.value.trim();
    if (!texto) return;

    const tarefa = window.estado.tarefas.find(t => t.id === idTarefa);
    if (!tarefa) return;

    if (!tarefa.anotacoes) tarefa.anotacoes = [];

    const hoje = new Date();
    const dataFormatada = hoje.toLocaleDateString('pt-BR');

    tarefa.anotacoes.push({
        data: dataFormatada,
        texto: texto
    });

    abrirModal(tarefa);

    const statusRegion = document.getElementById('status-region');
    if (statusRegion) {
        statusRegion.textContent = `Anotação adicionada em "${tarefa.titulo}"`;
    }
}