// js/renderizacao.js

export function renderizarTarefas(tarefas) {
    const container = document.getElementById('tarefas-container');
    if (!container) return;

    // ⭐ FILTRA: não mostra tarefas arquivadas no Kanban
    const tarefasVisiveis = tarefas.filter(t => !t.arquivada);

    const agrupadas = {
        'fazer': [],
        'andamento': [],
        'revisao': [],
        'concluida': []
    };

    tarefasVisiveis.forEach(tarefa => {
        const status = tarefa.status || 'fazer';
        if (agrupadas[status]) {
            agrupadas[status].push(tarefa);
        }
    });

    const titulosStatus = {
        'fazer': '📋 A fazer',
        'andamento': '🔄 Em andamento',
        'revisao': '🔍 Em revisão',
        'concluida': '✅ Concluída'
    };

    const prioridadeClasse = {
        'baixa': 'prioridade-baixa',
        'media': 'prioridade-media',
        'alta': 'prioridade-alta'
    };

    let html = '';

    for (const [status, tarefasStatus] of Object.entries(agrupadas)) {
        html += `
            <section data-status="${status}" class="coluna-drop">
                <h2 id="${status}-titulo">${titulosStatus[status] || status} (${tarefasStatus.length})</h2>
                <ul>
        `;

        if (tarefasStatus.length === 0) {
            html += `<li class="coluna-vazia">Solte aqui</li>`;
        }

        tarefasStatus.forEach(tarefa => {
            const classePrioridade = prioridadeClasse[tarefa.prioridade] || '';
            
            const tagsHTML = (tarefa.tags && tarefa.tags.length > 0)
                ? `<div class="tags-cartao">
                     ${tarefa.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                   </div>`
                : '';

            // ⭐ Botões de ação só para tarefas concluídas
            const acoesConcluida = (tarefa.status === 'concluida')
                ? `<div class="acoes-concluida">
                     <button type="button" class="btn-arquivar" data-acao="arquivar" title="Mover para o acervo">
                       📚 Arquivar no Acervo
                     </button>
                     <button type="button" class="btn-excluir" data-acao="excluir" title="Excluir tarefa">
                       🗑️ Excluir
                     </button>
                   </div>`
                : '';

            html += `
                <li class="${classePrioridade}" data-tarefa-id="${tarefa.id}" draggable="true">
                    <article>
                        <h3>${tarefa.titulo}</h3>
                        <p><strong>Projeto:</strong> ${tarefa.projeto || 'Não informado'}</p>
                        <p><strong>Responsável:</strong> ${tarefa.responsavel || 'Não informado'}</p>
                        <p><strong>Prazo:</strong> ${tarefa.prazo || 'Sem prazo'}</p>
                        <p><strong>Prioridade:</strong> ${tarefa.prioridade || 'Não definida'}</p>
                        ${tagsHTML}
                        ${acoesConcluida}
                    </article>
                </li>
            `;
        });

        html += `
                </ul>
            </section>
        `;
    }

    container.innerHTML = html;
}