// js/estados.js
// RESPONSABILIDADE: DECIDIR QUAL TELA MOSTRAR - NENHUMA REQUISIÇÃO AQUI!

export function renderizarEstado(estado, dados) {
    const container = document.getElementById('tarefas-container');
    const statusRegion = document.getElementById('status-region');
    
    if (!container || !statusRegion) {
        console.error('Elementos necessários não encontrados');
        return;
    }

    // Limpar o container
    container.innerHTML = '';

    // Pegar a função de renderização
    const renderizarTarefas = window.renderizarTarefas;

    switch (estado) {
        case 'carregando':
            container.innerHTML = `
                <div class="estado-carregando">
                    <div class="spinner"></div>
                    <p>⏳ Carregando tarefas...</p>
                </div>
            `;
            statusRegion.textContent = 'Carregando tarefas, aguarde...';
            break;

        case 'sucesso':
            renderizarTarefas(dados);
            const qtd = dados.length;
            statusRegion.textContent = `${qtd} tarefa${qtd > 1 ? 's' : ''} carregada${qtd > 1 ? 's' : ''}`;
            break;

        case 'vazio':
            container.innerHTML = `
                <div class="estado-vazio">
                    <p>📭 Nenhuma tarefa encontrada</p>
                    <p class="subtitulo">Sua lista está vazia no momento</p>
                </div>
            `;
            statusRegion.textContent = 'Nenhuma tarefa encontrada';
            break;

        case 'erro':
            let mensagemErro = '';
            let icone = '❌';

            if (dados instanceof Error) {
                if (dados.name === 'TypeError') {
                    mensagemErro = 'Falha de rede: não foi possível conectar ao servidor. Verifique sua conexão com a internet.';
                    icone = '🌐';
                } else if (dados.name === 'SyntaxError') {
                    mensagemErro = 'Erro de formato: o arquivo de dados está mal formatado. Verifique a estrutura do JSON.';
                    icone = '📄';
                } else {
                    mensagemErro = dados.message || 'Erro desconhecido ao carregar os dados.';
                }
            } else {
                mensagemErro = 'Erro desconhecido ao carregar os dados.';
            }

            container.innerHTML = `
                <div class="estado-erro">
                    <p>${icone} ${mensagemErro}</p>
                </div>
            `;
            statusRegion.textContent = `Erro: ${mensagemErro}`;
            break;

        default:
            console.warn(`Estado desconhecido: ${estado}`);
    }
}