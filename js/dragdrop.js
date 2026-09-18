// js/dragdrop.js

let idArrastando = null;

export function inicializarDragDrop(container, onMudarStatus) {
    if (!container) return;

    container.addEventListener('dragstart', (e) => {
        const cartao = e.target.closest('[data-tarefa-id]');
        if (!cartao) return;
        idArrastando = Number(cartao.dataset.tarefaId);
        cartao.classList.add('arrastando');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', String(idArrastando));
    });

    container.addEventListener('dragend', (e) => {
        const cartao = e.target.closest('[data-tarefa-id]');
        if (cartao) cartao.classList.remove('arrastando');
        idArrastando = null;
        document.querySelectorAll('.coluna-drop').forEach(col => col.classList.remove('drop-ativa'));
    });

    container.addEventListener('dragover', (e) => {
        const coluna = e.target.closest('[data-status]');
        if (!coluna) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        coluna.classList.add('drop-ativa');
    });

    container.addEventListener('dragleave', (e) => {
        const coluna = e.target.closest('[data-status]');
        if (!coluna) return;
        coluna.classList.remove('drop-ativa');
    });

    container.addEventListener('drop', (e) => {
        const coluna = e.target.closest('[data-status]');
        if (!coluna) return;
        e.preventDefault();
        coluna.classList.remove('drop-ativa');

        const novoStatus = coluna.dataset.status;
        if (!novoStatus || !idArrastando) return;

        onMudarStatus(idArrastando, novoStatus);
        idArrastando = null;
    });
}