// js/estados.js

export function renderizarEstado(estado, dados) {
    const container = document.getElementById('tarefas-container');
    const statusRegion = document.getElementById('status-region');

    if (!container || !statusRegion) return;

    container.innerHTML = '';

    switch (estado) {
        case 'carregando':
            container.innerHTML = `
                <div class="estado-carregando">
                    <div class="spinner"></div>
                    <p>Carregando tarefas...</p>
                </div>
            `;
            statusRegion.textContent = 'Carregando tarefas, aguarde...';
            break;

        case 'sucesso':
            if (dados.length === 0) {
                container.innerHTML = `
                    <div class="estado-vazio">
                        <p>Nenhum resultado para os critérios</p>
                        <p class="subtitulo">Tente alterar ou limpar os filtros</p>
                    </div>
                `;
                statusRegion.textContent = 'Nenhum resultado para os critérios selecionados';
            } else {
                window.renderizarTarefas(dados);
                const total = window.estadoTotal || dados.length;
                statusRegion.textContent = `${dados.length} de ${total} tarefa${total > 1 ? 's' : ''}`;
            }
            break;

        case 'origem-vazia':
            container.innerHTML = `
                <div class="estado-vazio">
                    <p>Nenhuma tarefa cadastrada</p>
                    <p class="subtitulo">O arquivo de dados está vazio</p>
                </div>
            `;
            statusRegion.textContent = 'Nenhuma tarefa cadastrada';
            break;

        case 'erro':
            let mensagemErro = '';
            if (dados instanceof Error) {
                if (dados.name === 'TypeError') {
                    mensagemErro = 'Falha de rede: verifique sua conexão.';
                } else if (dados.name === 'SyntaxError') {
                    mensagemErro = 'Erro de formato: o JSON está mal formatado.';
                } else {
                    mensagemErro = dados.message || 'Erro desconhecido.';
                }
            } else {
                mensagemErro = 'Erro desconhecido ao carregar os dados.';
            }

            container.innerHTML = `
                <div class="estado-erro">
                    <p>${mensagemErro}</p>
                </div>
            `;
            statusRegion.textContent = `Erro: ${mensagemErro}`;
            break;
    }
}