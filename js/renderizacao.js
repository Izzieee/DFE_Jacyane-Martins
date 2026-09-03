// js/renderizacao.js
// ⚠️ NÃO ALTERAR ESTA FUNÇÃO (exigência da E3)

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
            html += `
                <li class="${classePrioridade}">
                    <article>
                        <h3>${tarefa.titulo}</h3>
                        <p><strong>Projeto:</strong> ${tarefa.projeto || 'Não informado'}</p>
                        <p><strong>Responsável:</strong> ${tarefa.responsavel || 'Não informado'}</p>
                        <p><strong>Prazo:</strong> ${tarefa.prazo || 'Sem prazo'}</p>
                        <p><strong>Prioridade:</strong> ${tarefa.prioridade || 'Não definida'}</p>
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