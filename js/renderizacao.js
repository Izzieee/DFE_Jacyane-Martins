// js/renderizacao.js
// ⚠️ NÃO ALTERAR A ESTRUTURA BÁSICA (exigência da E3)
// Agora com tags e botão de arquivar

export function renderizarTarefas(tarefas) {
    const container = document.getElementById('tarefas-container');
    
    if (!container || !tarefas || tarefas.length === 0) {
        return;
    }

    // Agrupar tarefas por status
    const agrupadas = {
        'fazer': [],
        'andamento': [],
        'revisao': [],
        'concluida': []
    };

    tarefas.forEach(tarefa => {
        const status = tarefa.status || 'fazer';
        if (agrupadas[status]) {
            agrupadas[status].push(tarefa);
        }
    });

    // Títulos dos status
    const titulosStatus = {
        'fazer': '📋 A fazer',
        'andamento': '🔄 Em andamento',
        'revisao': '🔍 Em revisão',
        'concluida': '✅ Concluída'
    };

    // Classe CSS para prioridade
    const prioridadeClasse = {
        'baixa': 'prioridade-baixa',
        'media': 'prioridade-media',
        'alta': 'prioridade-alta'
    };

    let html = '';

    for (const [status, tarefasStatus] of Object.entries(agrupadas)) {
        if (tarefasStatus.length === 0) continue;

        html += `
            <section data-status="${status}">
                <h2 id="${status}-titulo">${titulosStatus[status] || status}</h2>
                <ul>
        `;

        tarefasStatus.forEach(tarefa => {
            const classePrioridade = prioridadeClasse[tarefa.prioridade] || '';
            
            // Renderizar tags (se houver)
            const tagsHTML = (tarefa.tags && tarefa.tags.length > 0)
                ? `<div class="tags-cartao">
                     ${tarefa.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                   </div>`
                : '';

            // Botão "Arquivar no acervo" só se estiver concluída
            const botaoArquivar = (tarefa.status === 'concluida')
                ? `<button type="button" class="btn-arquivar" data-acao="arquivar">
                     📚 Arquivar no acervo
                   </button>`
                : '';

            html += `
                <li class="${classePrioridade}" data-tarefa-id="${tarefa.id}">
                    <article>
                        <h3>${tarefa.titulo}</h3>
                        <p><strong>Projeto:</strong> ${tarefa.projeto || 'Não informado'}</p>
                        <p><strong>Responsável:</strong> ${tarefa.responsavel || 'Não informado'}</p>
                        <p><strong>Prazo:</strong> ${tarefa.prazo || 'Sem prazo'}</p>
                        <p><strong>Prioridade:</strong> ${tarefa.prioridade || 'Não definida'}</p>
                        ${tagsHTML}
                        ${botaoArquivar}
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