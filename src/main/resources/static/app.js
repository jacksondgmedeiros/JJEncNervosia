const form = document.getElementById('encomendaForm');
const formMessage = document.getElementById('formMessage');
const resultadoCadastro = document.getElementById('resultadoCadastro');
const emptyState = document.getElementById('emptyState');
const codigoGrande = document.getElementById('codigoGrande');
const codigoSecundario = document.getElementById('codigoSecundario');
const corBadge = document.getElementById('corBadge');
const qrCodeImage = document.getElementById('qrCodeImage');
const resultadoUnidade = document.getElementById('resultadoUnidade');
const resultadoData = document.getElementById('resultadoData');
const previewPrintButton = document.getElementById('previewPrintButton');
const printButton = document.getElementById('printButton');
const printModal = document.getElementById('printModal');
const printModalTitle = document.getElementById('printModalTitle');
const printModalSubtitle = document.getElementById('printModalSubtitle');
const printLabelsContainer = document.getElementById('printLabelsContainer');
const closePrintModalButton = document.getElementById('closePrintModalButton');
const tableBody = document.getElementById('encomendasTableBody');
const somentePendentes = document.getElementById('somentePendentes');
const refreshButton = document.getElementById('refreshButton');
const reprintPendingButton = document.getElementById('reprintPendingButton');

const COLOR_MAP = {
    VERDE: '#86efac',
    AMARELO: '#fde68a',
    VERMELHO: '#fca5a5'
};

let ultimaEncomendaRegistrada = null;
let etiquetaAberta = [];

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

function formatarDataEtiqueta(dataIso) {
    return new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'full',
        timeStyle: 'short'
    }).format(new Date(dataIso));
}

function obterQrCodeSrc(encomenda) {
    if (encomenda.qrCodeBase64) {
        return `data:image/png;base64,${encomenda.qrCodeBase64}`;
    }
    return encomenda.qrCodeImageUrl;
}

function criarEtiquetaHtml(encomenda) {
    const cor = COLOR_MAP[encomenda.cor] || '#e5e7eb';
    const dataRegistro = formatarDataEtiqueta(encomenda.dataCriacao);
    const qrCodeSrc = obterQrCodeSrc(encomenda);

    return `
        <article class="etiqueta-impressao">
            <p class="etiqueta-titulo">Etiqueta de Encomenda</p>
            <p class="etiqueta-identificador">ID geral ${encomenda.identificadorGeral}</p>
            <div class="cor-badge etiqueta-cor" style="background:${cor}">${encomenda.cor}</div>
            <img src="${qrCodeSrc}" alt="QR Code da etiqueta da encomenda ${encomenda.codigoFormatado}">
            <div class="etiqueta-infos">
                <p><strong>Código do dia:</strong> <span>${encomenda.codigoFormatado}</span></p>
                <p><strong>Unidade:</strong> <span>${encomenda.apartamento}</span></p>
                <p><strong>Registrada em:</strong> <span>${dataRegistro}</span></p>
                <p><strong>Status:</strong> <span>${encomenda.status}</span></p>
            </div>
        </article>
    `;
}

function popularResumo(encomenda) {
    codigoGrande.textContent = encomenda.codigoFormatado;
    codigoSecundario.textContent = `ID geral ${encomenda.identificadorGeral}`;
    corBadge.textContent = encomenda.cor;
    aplicarCor(corBadge, encomenda.cor);
    resultadoUnidade.textContent = encomenda.apartamento;
    resultadoData.textContent = `Registrada em ${formatarDataEtiqueta(encomenda.dataCriacao)}`;
    qrCodeImage.src = obterQrCodeSrc(encomenda);
}

function abrirModalImpressao(encomendas, titulo, subtitulo) {
    etiquetaAberta = encomendas;
    printModalTitle.textContent = titulo;
    printModalSubtitle.textContent = subtitulo;
    printLabelsContainer.innerHTML = encomendas.map(criarEtiquetaHtml).join('');
    printModal.classList.remove('hidden');
    document.body.classList.add('modal-open');
    printModal.setAttribute('aria-hidden', 'false');
}

function fecharModalImpressao() {
    etiquetaAberta = [];
    printModal.classList.add('hidden');
    document.body.classList.remove('modal-open');
    printModal.setAttribute('aria-hidden', 'true');
}

function renderResultadoCadastro(encomenda) {
    ultimaEncomendaRegistrada = encomenda;
    emptyState.classList.add('hidden');
    resultadoCadastro.classList.remove('hidden');
    popularResumo(encomenda);
    previewPrintButton.classList.remove('hidden');
}

function renderTabela(encomendas) {
    if (!encomendas.length) {
        tableBody.innerHTML = '<tr><td colspan="7" class="empty-row">Nenhuma encomenda encontrada.</td></tr>';
        return;
    }

    tableBody.innerHTML = encomendas.map((encomenda) => {
        const disabled = encomenda.status === 'RETIRADO' ? 'disabled' : '';
        const statusColor = encomenda.status === 'PENDENTE' ? '#22c55e' : '#64748b';

        return `
            <tr>
                <td>${encomenda.apartamento}</td>
                <td><strong>${encomenda.codigoFormatado}</strong></td>
                <td><span class="table-id">${encomenda.identificadorGeral}</span></td>
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
                        <button class="secondary-button action-button" data-action="imprimir" data-id="${encomenda.id}">Imprimir</button>
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
        tableBody.innerHTML = `<tr><td colspan="7" class="empty-row">${error.message}</td></tr>`;
    }
}

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    formMessage.textContent = '';
    formMessage.className = 'form-message';

    const bloco = document.getElementById('bloco').value;
    const apartamento = document.getElementById('apartamento').value.trim();
    const payload = {
        apartamento: `${bloco} • Apto ${apartamento}`,
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
        document.getElementById('bloco').value = 'Bloco 1';
        formMessage.textContent = 'Encomenda registrada com sucesso.';
        formMessage.classList.add('success');
        await carregarEncomendas();
    } catch (error) {
        formMessage.textContent = error.message;
        formMessage.classList.add('error');
    }
});

tableBody.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) {
        return;
    }

    if (button.dataset.action === 'retirar') {
        try {
            await apiFetch(`/encomendas/${button.dataset.id}/retirar`, { method: 'PUT' });
            await carregarEncomendas();
        } catch (error) {
            alert(error.message);
        }
        return;
    }

    if (button.dataset.action === 'imprimir') {
        try {
            const encomendas = await apiFetch('/encomendas', { method: 'GET' });
            const encomenda = encomendas.find((item) => item.id === button.dataset.id);
            if (!encomenda) {
                throw new Error('Não foi possível localizar a encomenda para impressão.');
            }
            abrirModalImpressao(
                [encomenda],
                'Impressão da etiqueta',
                `Reimpressão do pacote ${encomenda.codigoFormatado}.`
            );
        } catch (error) {
            alert(error.message);
        }
    }
});

previewPrintButton.addEventListener('click', () => {
    if (!ultimaEncomendaRegistrada) {
        return;
    }

    abrirModalImpressao(
        [ultimaEncomendaRegistrada],
        'Impressão da etiqueta',
        `Etiqueta pronta para o código ${ultimaEncomendaRegistrada.codigoFormatado}.`
    );
});

reprintPendingButton.addEventListener('click', async () => {
    try {
        const pendentes = await apiFetch('/encomendas/pendentes', { method: 'GET' });
        if (!pendentes.length) {
            alert('Não há pacotes pendentes para reimpressão.');
            return;
        }
        abrirModalImpressao(
            pendentes,
            'Reimpressão de pacotes pendentes',
            `${pendentes.length} etiqueta(s) pendente(s) pronta(s) para impressão.`
        );
    } catch (error) {
        alert(error.message);
    }
});

printModal.addEventListener('click', (event) => {
    if (event.target.dataset.closeModal === 'true') {
        fecharModalImpressao();
    }
});

closePrintModalButton.addEventListener('click', fecharModalImpressao);

printButton.addEventListener('click', () => {
    if (!etiquetaAberta.length) {
        return;
    }
    window.print();
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !printModal.classList.contains('hidden')) {
        fecharModalImpressao();
    }
});

somentePendentes.addEventListener('change', carregarEncomendas);
refreshButton.addEventListener('click', carregarEncomendas);

carregarEncomendas();
window.setInterval(carregarEncomendas, 15000);
