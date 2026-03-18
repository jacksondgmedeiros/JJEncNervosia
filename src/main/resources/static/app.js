const form = document.getElementById('encomendaForm');
const formMessage = document.getElementById('formMessage');
const resultadoCadastro = document.getElementById('resultadoCadastro');
const emptyState = document.getElementById('emptyState');
const codigoGrande = document.getElementById('codigoGrande');
const corBadge = document.getElementById('corBadge');
const qrCodeImage = document.getElementById('qrCodeImage');
const resultadoDescricao = document.getElementById('resultadoDescricao');
const tableBody = document.getElementById('encomendasTableBody');
const somentePendentes = document.getElementById('somentePendentes');
const refreshButton = document.getElementById('refreshButton');

const COLOR_MAP = {
    VERDE: '#86efac',
    AMARELO: '#fde68a',
    VERMELHO: '#fca5a5'
};

async function apiFetch(url, options = {}) {
    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        },
        ...options
    });

    if (!response.ok) {
        let message = 'Não foi possível concluir a operação.';
        try {
            const body = await response.json();
            message = body.mensagem || message;
        } catch (error) {
            console.error('Erro ao ler resposta da API', error);
        }
        throw new Error(message);
    }

    const contentType = response.headers.get('Content-Type') || '';
    if (contentType.includes('application/json')) {
        return response.json();
    }
    return response;
}

function aplicarCor(element, cor) {
    element.style.backgroundColor = COLOR_MAP[cor] || '#e5e7eb';
}

function formatarData(dataIso) {
    return new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short'
    }).format(new Date(dataIso));
}

function renderResultadoCadastro(encomenda) {
    emptyState.classList.add('hidden');
    resultadoCadastro.classList.remove('hidden');
    codigoGrande.textContent = encomenda.codigoFormatado;
    corBadge.textContent = encomenda.cor;
    aplicarCor(corBadge, encomenda.cor);
    qrCodeImage.src = `data:image/png;base64,${encomenda.qrCodeBase64}`;
    resultadoDescricao.textContent = `Apartamento ${encomenda.apartamento} • Status ${encomenda.status}`;
}

function renderTabela(encomendas) {
    if (!encomendas.length) {
        tableBody.innerHTML = '<tr><td colspan="6" class="empty-row">Nenhuma encomenda encontrada.</td></tr>';
        return;
    }

    tableBody.innerHTML = encomendas.map((encomenda) => {
        const disabled = encomenda.status === 'RETIRADO' ? 'disabled' : '';
        const statusColor = encomenda.status === 'PENDENTE' ? '#22c55e' : '#64748b';

        return `
            <tr>
                <td>${encomenda.apartamento}</td>
                <td><strong>${encomenda.codigoFormatado}</strong></td>
                <td><span class="cor-cell" style="background:${COLOR_MAP[encomenda.cor] || '#e5e7eb'}">${encomenda.cor}</span></td>
                <td>
                    <span class="status-chip">
                        <span class="status-dot" style="background:${statusColor}"></span>
                        ${encomenda.status}
                    </span>
                </td>
                <td>${formatarData(encomenda.dataCriacao)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="secondary-button action-button" data-action="retirar" data-id="${encomenda.id}" ${disabled}>Retirar</button>
                        <a class="secondary-button action-button" href="${encomenda.qrCodeImageUrl}" target="_blank" rel="noreferrer">QR</a>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

async function carregarEncomendas() {
    const endpoint = somentePendentes.checked ? '/encomendas/pendentes' : '/encomendas';
    try {
        const encomendas = await apiFetch(endpoint, { method: 'GET' });
        renderTabela(encomendas);
    } catch (error) {
        tableBody.innerHTML = `<tr><td colspan="6" class="empty-row">${error.message}</td></tr>`;
    }
}

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    formMessage.textContent = '';
    formMessage.className = 'form-message';

    const payload = {
        apartamento: document.getElementById('apartamento').value,
        nomeMorador: document.getElementById('nomeMorador').value,
        descricao: document.getElementById('descricao').value
    };

    try {
        const encomenda = await apiFetch('/encomendas', {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        renderResultadoCadastro(encomenda);
        form.reset();
        formMessage.textContent = 'Encomenda registrada com sucesso.';
        formMessage.classList.add('success');
        await carregarEncomendas();
    } catch (error) {
        formMessage.textContent = error.message;
        formMessage.classList.add('error');
    }
});

tableBody.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-action="retirar"]');
    if (!button) {
        return;
    }

    try {
        await apiFetch(`/encomendas/${button.dataset.id}/retirar`, { method: 'PUT' });
        await carregarEncomendas();
    } catch (error) {
        alert(error.message);
    }
});

somentePendentes.addEventListener('change', carregarEncomendas);
refreshButton.addEventListener('click', carregarEncomendas);

carregarEncomendas();
window.setInterval(carregarEncomendas, 15000);
