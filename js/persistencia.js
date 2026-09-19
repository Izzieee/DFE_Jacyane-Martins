// js/persistencia.js
// RESPONSABILIDADE: salvar e carregar o estado do localStorage

const CHAVE = 'step-tarefas-v1';

export function salvarTarefas(tarefas) {
    try {
        localStorage.setItem(CHAVE, JSON.stringify(tarefas));
        return true;
    } catch (erro) {
        console.warn('Não foi possível salvar:', erro);
        return false;
    }
}

export function carregarTarefasSalvas() {
    try {
        const dados = localStorage.getItem(CHAVE);
        if (!dados) return null;
        const tarefas = JSON.parse(dados);
        if (!Array.isArray(tarefas)) return null;
        return tarefas;
    } catch (erro) {
        console.warn('Não foi possível carregar:', erro);
        return null;
    }
}

export function limparTarefasSalvas() {
    localStorage.removeItem(CHAVE);
}

export function temDadosSalvos() {
    return localStorage.getItem(CHAVE) !== null;
}