// js/api.js
// RESPONSABILIDADE: APENAS BUSCAR OS DADOS - NÃO MEXE NO DOM

export async function carregarTarefas() {
    try {
        // 1. FAZER A REQUISIÇÃO
        const resposta = await fetch('dados.json');

        // 2. VERIFICAR SE DEU ERRO (ex: 404)
        if (!resposta.ok) {
            throw new Error(`Erro HTTP: ${resposta.status}`);
        }

        // 3. CONVERTER PARA JSON
        const dados = await resposta.json();

        // 4. VERIFICAR SE TEM A CHAVE "tarefas"
        if (!dados.tarefas || !Array.isArray(dados.tarefas)) {
            throw new Error('Formato inválido: esperado objeto com chave "tarefas"');
        }

        // 5. RETORNAR O ARRAY
        return dados.tarefas;

    } catch (erro) {
        // REPASSAR O ERRO PARA QUEM CHAMOU
        throw erro;
    }
}