// js/modal.js
// RESPONSABILIDADE: Modais (detalhes, evolução, clonagem, nova tarefa)

// ==========================================
// MODAL DE DETALHES
// ==========================================
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
            <ol>${tarefa.passos.map(p => `<li>${p}</li>`).join('')}</ol>
        ` : ''}

        ${tarefa.aprendizados && tarefa.aprendizados.length > 0 ? `
            <h3>💡 Aprendizados</h3>
            <ul>${tarefa.aprendizados.map(a => `<li>${a}</li>`).join('')}</ul>
        ` : ''}

        <h3>📌 Anotações</h3>
        <div id="anotacoes-lista">
            ${renderizarAnotacoes(tarefa.anotacoes || [])}
        </div>

        <form id="form-anotacao" class="form-anotacao">
            <label for="texto-anotacao">Nova anotação:</label>
            <textarea id="texto-anotacao" rows="3" placeholder="O que você quer registrar?" required></textarea>
            <button type="submit" class="btn-anotar">➕ Adicionar anotação</button>
        </form>

        <details class="acoes-avancadas">
            <summary>⚙️ Ações avançadas</summary>
            <div class="acoes-avancadas-conteudo">
                <button type="button" class="btn-acao-avancada" data-acao-modal="evoluir">
                  ⬆️ Evoluir (criar nova tarefa)
                </button>
                <button type="button" class="btn-acao-avancada" data-acao-modal="clonar">
                  📋 Clonar tarefa
                </button>
                ${tarefa.status === 'concluida' ? `
                  <button type="button" class="btn-acao-avancada" data-acao-modal="publicar">
                    ${tarefa.publica ? '🔒 Despublicar' : '📤 Publicar no Legado'}
                  </button>
                ` : ''}
            </div>
        </details>
    `;

    modal.hidden = false;

    const form = document.getElementById('form-anotacao');
    form?.addEventListener('submit', (e) => {
        e.preventDefault();
        adicionarAnotacao(tarefa.id);
    });

    corpo.querySelectorAll('[data-acao-modal]').forEach(btn => {
        btn.addEventListener('click', () => {
            const acao = btn.dataset.acaoModal;
            if (acao === 'evoluir') abrirModalEvolucao(tarefa);
            else if (acao === 'clonar') clonarTarefa(tarefa);
            else if (acao === 'publicar') {
                tarefa.publica = !tarefa.publica;
                abrirModal(tarefa);
                if (window.renderizar) window.renderizar();
            }
        });
    });
}

// ==========================================
// MODAL DE NOVA TAREFA
// ==========================================
export function abrirModalNovaTarefa() {
    const modal = document.getElementById('modal');
    const corpo = document.getElementById('modal-corpo');
    if (!modal || !corpo) return;

    corpo.innerHTML = `
        <h2>➕ Nova Tarefa</h2>

        <form id="form-nova-tarefa" class="form-evolucao">
            <label for="nt-titulo">Título *:</label>
            <input type="text" id="nt-titulo" placeholder="Ex: Estudar Flexbox" required />

            <label for="nt-projeto">Projeto:</label>
            <input type="text" id="nt-projeto" placeholder="Ex: E5 - Desenvolvimento" />

            <label for="nt-responsavel">Responsável:</label>
            <input type="text" id="nt-responsavel" placeholder="Ex: Jacyane Martins" />

            <label for="nt-prazo">Prazo (DD/MM/AAAA):</label>
            <input type="text" id="nt-prazo" placeholder="Ex: 30/09/2026" />

            <label for="nt-status">Status inicial:</label>
            <select id="nt-status">
                <option value="fazer" selected>A fazer</option>
                <option value="andamento">Em andamento</option>
                <option value="revisao">Revisão</option>
            </select>

            <label for="nt-prioridade">Prioridade:</label>
            <select id="nt-prioridade">
                <option value="baixa">Baixa</option>
                <option value="media" selected>Média</option>
                <option value="alta">Alta</option>
            </select>

            <label for="nt-tags">Tags (separadas por vírgula):</label>
            <input type="text" id="nt-tags" placeholder="Ex: JavaScript, Frontend" />

            <button type="submit" class="btn-anotar">✅ Criar tarefa</button>
        </form>
    `;

    modal.hidden = false;

    const form = document.getElementById('form-nova-tarefa');
    form?.addEventListener('submit', (e) => {
        e.preventDefault();
        criarNovaTarefa();
    });
}

// ==========================================
// CRIAR NOVA TAREFA
// ==========================================
function criarNovaTarefa() {
    const titulo = document.getElementById('nt-titulo')?.value.trim();
    const projeto = document.getElementById('nt-projeto')?.value.trim();
    const responsavel = document.getElementById('nt-responsavel')?.value.trim();
    const prazo = document.getElementById('nt-prazo')?.value.trim();
    const status = document.getElementById('nt-status')?.value || 'fazer';
    const prioridade = document.getElementById('nt-prioridade')?.value || 'media';
    const tagsTexto = document.getElementById('nt-tags')?.value.trim();

    if (!titulo) return;

    const tags = tagsTexto
        ? tagsTexto.split(',').map(t => t.trim()).filter(Boolean)
        : [];

    const novoId = Math.max(...window.estado.tarefas.map(t => t.id), 0) + 1;

    const novaTarefa = {
        id: novoId,
        titulo,
        status,
        prioridade,
        prazo,
        concluidaEm: null,
        projeto: projeto || 'Sem projeto',
        responsavel: responsavel || 'Não informado',
        tags,
        passos: [],
        aprendizados: [],
        anotacoes: [],
        relacionadas: [],
        publica: false
    };

    window.estado.tarefas.push(novaTarefa);

    const modal = document.getElementById('modal');
    if (modal) modal.hidden = true;

    if (window.renderizar) window.renderizar();

    const statusRegion = document.getElementById('status-region');
    if (statusRegion) {
        statusRegion.textContent = `Nova tarefa criada: "${titulo}"`;
    }
}

// ==========================================
// MODAL DE EVOLUÇÃO
// ==========================================
export function abrirModalEvolucao(tarefaOriginal) {
    const modal = document.getElementById('modal');
    const corpo = document.getElementById('modal-corpo');
    if (!modal || !corpo) return;

    corpo.innerHTML = `
        <h2>⬆️ Evoluir: ${tarefaOriginal.titulo}</h2>
        <p class="subtitulo">Crie uma nova tarefa baseada nesta, com uma nova etapa.</p>

        <form id="form-evolucao" class="form-evolucao">
            <label for="nova-etapa">📝 Nova etapa (o que fazer agora?):</label>
            <textarea id="nova-etapa" rows="3" placeholder="Ex: Refatorar o código..." required></textarea>

            <label for="nova-anotacao">📌 Anotação inicial (opcional):</label>
            <textarea id="nova-anotacao" rows="2" placeholder="Contexto do que aprendeu..."></textarea>

            <label for="novo-status">Status inicial:</label>
            <select id="novo-status">
                <option value="fazer">A fazer</option>
                <option value="andamento" selected>Em andamento</option>
                <option value="revisao">Revisão</option>
            </select>

            <label for="nova-prioridade">Prioridade:</label>
            <select id="nova-prioridade">
                <option value="baixa">Baixa</option>
                <option value="media" selected>Média</option>
                <option value="alta">Alta</option>
            </select>

            <label for="novo-prazo">Prazo (DD/MM/AAAA):</label>
            <input type="text" id="novo-prazo" placeholder="Ex: 30/09/2026" />

            <button type="submit" class="btn-anotar">✅ Criar nova tarefa</button>
        </form>
    `;

    modal.hidden = false;

    const form = document.getElementById('form-evolucao');
    form?.addEventListener('submit', (e) => {
        e.preventDefault();
        criarTarefaEvolucao(tarefaOriginal);
    });
}

// ==========================================
// CRIAR TAREFA DE EVOLUÇÃO
// ==========================================
function criarTarefaEvolucao(tarefaOriginal) {
    const novaEtapa = document.getElementById('nova-etapa')?.value.trim();
    const novaAnotacao = document.getElementById('nova-anotacao')?.value.trim();
    const novoStatus = document.getElementById('novo-status')?.value || 'andamento';
    const novaPrioridade = document.getElementById('nova-prioridade')?.value || 'media';
    const novoPrazo = document.getElementById('novo-prazo')?.value || '';

    if (!novaEtapa) return;

    const novoId = Math.max(...window.estado.tarefas.map(t => t.id), 0) + 1;

    const novaTarefa = {
        id: novoId,
        titulo: `${tarefaOriginal.titulo} — Evolução`,
        status: novoStatus,
        prioridade: novaPrioridade,
        prazo: novoPrazo,
        concluidaEm: null,
        projeto: tarefaOriginal.projeto,
        responsavel: tarefaOriginal.responsavel,
        tags: [...(tarefaOriginal.tags || [])],
        passos: [...(tarefaOriginal.passos || []), novaEtapa],
        aprendizados: [...(tarefaOriginal.aprendizados || [])],
        anotacoes: novaAnotacao 
            ? [{ data: new Date().toLocaleDateString('pt-BR'), texto: novaAnotacao }]
            : [],
        relacionadas: [...(tarefaOriginal.relacionadas || []), tarefaOriginal.id],
        publica: false
    };

    window.estado.tarefas.push(novaTarefa);

    const modal = document.getElementById('modal');
    if (modal) modal.hidden = true;

    if (window.trocarModo) window.trocarModo('kanban');
    if (window.renderizar) window.renderizar();

    const statusRegion = document.getElementById('status-region');
    if (statusRegion) {
        statusRegion.textContent = `Nova tarefa criada: "${novaTarefa.titulo}" (${novoStatus})`;
    }
}

// ==========================================
// CLONAR TAREFA
// ==========================================
export function clonarTarefa(tarefaOriginal) {
    const novoId = Math.max(...window.estado.tarefas.map(t => t.id), 0) + 1;
    const novoPrazo = prompt('Qual o prazo da nova tarefa? (DD/MM/AAAA)', '');

    const copia = {
        ...tarefaOriginal,
        id: novoId,
        titulo: `${tarefaOriginal.titulo} (cópia)`,
        status: 'fazer',
        prazo: novoPrazo || '',
        concluidaEm: null,
        anotacoes: [],
        publica: false,
        relacionadas: [...(tarefaOriginal.relacionadas || []), tarefaOriginal.id]
    };

    window.estado.tarefas.push(copia);

    const modal = document.getElementById('modal');
    if (modal) modal.hidden = true;

    if (window.renderizar) window.renderizar();

    const statusRegion = document.getElementById('status-region');
    if (statusRegion) {
        statusRegion.textContent = `"${tarefaOriginal.titulo}" clonada`;
    }
}

// ==========================================
// RENDERIZAR ANOTAÇÕES
// ==========================================
function renderizarAnotacoes(anotacoes) {
    if (!anotacoes || anotacoes.length === 0) {
        return `<p class="sem-anotacoes">Nenhuma anotação ainda.</p>`;
    }

    return `
        <ul class="timeline">
            ${anotacoes.map(a => `
                <li><strong>${a.data}:</strong> ${a.texto}</li>
            `).join('')}
        </ul>
    `;
}

// ==========================================
// ADICIONAR ANOTAÇÃO
// ==========================================
function adicionarAnotacao(idTarefa) {
    const textarea = document.getElementById('texto-anotacao');
    if (!textarea) return;

    const texto = textarea.value.trim();
    if (!texto) return;

    const tarefa = window.estado.tarefas.find(t => t.id === idTarefa);
    if (!tarefa) return;

    if (!tarefa.anotacoes) tarefa.anotacoes = [];

    tarefa.anotacoes.push({
        data: new Date().toLocaleDateString('pt-BR'),
        texto
    });

    abrirModal(tarefa);

    const statusRegion = document.getElementById('status-region');
    if (statusRegion) {
        statusRegion.textContent = `Anotação adicionada em "${tarefa.titulo}"`;
    }
}