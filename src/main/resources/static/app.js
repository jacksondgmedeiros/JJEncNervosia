const form = document.getElementById('encomendaForm');
const formMessage = document.getElementById('formMessage');
const resultadoCadastro = document.getElementById('resultadoCadastro');
const emptyState = document.getElementById('emptyState');
const codigoGrande = document.getElementById('codigoGrande');
const corBadge = document.getElementById('corBadge');
const qrCodeImage = document.getElementById('qrCodeImage');
const resultadoNome = document.getElementById('resultadoNome');
const resultadoDescricao = document.getElementById('resultadoDescricao');
const resultadoData = document.getElementById('resultadoData');
const previewPrintButton = document.getElementById('previewPrintButton');
const printPreview = document.getElementById('printPreview');
const printButton = document.getElementById('printButton');
const printNomeMorador = document.getElementById('printNomeMorador');
const printCorBadge = document.getElementById('printCorBadge');
const printQrCodeImage = document.getElementById('printQrCodeImage');
const printCodigo = document.getElementById('printCodigo');
const printApartamento = document.getElementById('printApartamento');
const printDataRegistro = document.getElementById('printDataRegistro');
const printDescricao = document.getElementById('printDescricao');
const tableBody = document.getElementById('encomendasTableBody');
const somentePendentes = document.getElementById('somentePendentes');
const refreshButton = document.getElementById('refreshButton');

const COLOR_MAP = {
    VERDE: '#86efac',
    AMARELO: '#fde68a',
    VERMELHO: '#fca5a5'
};

let ultimaEncomendaRegistrada = null;

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

function obterNomeMorador(encomenda) {
    return encomenda.nomeMorador?.trim() || 'Morador não informado';
}

function obterDescricao(encomenda) {
    return encomenda.descricao?.trim() || 'Sem descrição';
}

function popularEtiqueta(encomenda) {
    const nomeMorador = obterNomeMorador(encomenda);
    const descricao = obterDescricao(encomenda);
    const dataRegistro = formatarDataEtiqueta(encomenda.dataCriacao);
    const unidade = encomenda.apartamento;
    const qrCodeSrc = `data:image/png;base64,${encomenda.qrCodeBase64}`;

    resultadoNome.textContent = nomeMorador;
    resultadoDescricao.textContent = `${unidade} • ${descricao}`;
    resultadoData.textContent = `Registrada em ${dataRegistro}`;

    printNomeMorador.textContent = nomeMorador;
    printCodigo.textContent = encomenda.codigoFormatado;
    printApartamento.textContent = unidade;
    printDataRegistro.textContent = dataRegistro;
    printDescricao.textContent = descricao;
    printQrCodeImage.src = qrCodeSrc;
    aplicarCor(printCorBadge, encomenda.cor);
    printCorBadge.textContent = encomenda.cor;

    qrCodeImage.src = qrCodeSrc;
}

function renderResultadoCadastro(encomenda) {
    ultimaEncomendaRegistrada = encomenda;
    emptyState.classList.add('hidden');
    resultadoCadastro.classList.remove('hidden');
    codigoGrande.textContent = encomenda.codigoFormatado;
    corBadge.textContent = encomenda.cor;
    aplicarCor(corBadge, encomenda.cor);
    popularEtiqueta(encomenda);
    previewPrintButton.classList.remove('hidden');
    printPreview.classList.add('hidden');
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

previewPrintButton.addEventListener('click', () => {
    if (!ultimaEncomendaRegistrada) {
        return;
    }

    popularEtiqueta(ultimaEncomendaRegistrada);
    printPreview.classList.remove('hidden');
    printPreview.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

printButton.addEventListener('click', () => {
    window.print();
});

somentePendentes.addEventListener('change', carregarEncomendas);
refreshButton.addEventListener('click', carregarEncomendas);

carregarEncomendas();
window.setInterval(carregarEncomendas, 15000);
