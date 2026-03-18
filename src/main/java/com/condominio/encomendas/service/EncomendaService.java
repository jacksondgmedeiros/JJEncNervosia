package com.condominio.encomendas.service;

import com.condominio.encomendas.dto.CriarEncomendaRequest;
import com.condominio.encomendas.dto.EncomendaResponse;
import com.condominio.encomendas.model.Encomenda;
import com.condominio.encomendas.model.StatusEncomenda;
import com.condominio.encomendas.repository.EncomendaRepository;
import jakarta.persistence.EntityNotFoundException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EncomendaService {

    private final EncomendaRepository encomendaRepository;
    private final QrCodeService qrCodeService;

    public EncomendaService(EncomendaRepository encomendaRepository, QrCodeService qrCodeService) {
        this.encomendaRepository = encomendaRepository;
        this.qrCodeService = qrCodeService;
    }

    @Transactional
    public EncomendaResponse criar(CriarEncomendaRequest request) {
        LocalDateTime agora = LocalDateTime.now();
        Integer proximoCodigo = obterProximoCodigoDiario(agora.toLocalDate());

        Encomenda encomenda = new Encomenda();
        encomenda.setId(UUID.randomUUID());
        encomenda.setApartamento(request.getApartamento().trim());
        encomenda.setNomeMorador(normalizarTexto(request.getNomeMorador()));
        encomenda.setDescricao(normalizarTexto(request.getDescricao()));
        encomenda.setCodigoDiario(proximoCodigo);
        encomenda.setIdentificadorGeral(obterProximoIdentificadorGeral());
        encomenda.setCor(definirCor(proximoCodigo));
        encomenda.setStatus(StatusEncomenda.PENDENTE);
        encomenda.setDataCriacao(agora);

        Encomenda salva = encomendaRepository.save(encomenda);
        return paraResponse(salva, true);
    }

    @Transactional(readOnly = true)
    public List<EncomendaResponse> listarTodas() {
        return encomendaRepository.findAllByOrderByDataCriacaoDesc()
                .stream()
                .map(encomenda -> paraResponse(encomenda, false))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<EncomendaResponse> listarPendentes() {
        return encomendaRepository.findAllByStatusOrderByDataCriacaoDesc(StatusEncomenda.PENDENTE)
                .stream()
                .map(encomenda -> paraResponse(encomenda, false))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<EncomendaResponse> listarPorApartamento(String apartamento) {
        return encomendaRepository.findAllByApartamentoOrderByDataCriacaoDesc(apartamento)
                .stream()
                .map(encomenda -> paraResponse(encomenda, false))
                .toList();
    }

    @Transactional
    public EncomendaResponse retirar(UUID id) {
        Encomenda encomenda = buscarPorId(id);
        if (encomenda.getStatus() == StatusEncomenda.RETIRADO) {
            return paraResponse(encomenda, false);
        }

        encomenda.setStatus(StatusEncomenda.RETIRADO);
        encomenda.setDataRetirada(LocalDateTime.now());
        return paraResponse(encomendaRepository.save(encomenda), false);
    }

    @Transactional(readOnly = true)
    public byte[] gerarQrCodeImagem(UUID id) {
        Encomenda encomenda = buscarPorId(id);
        return qrCodeService.gerarQrCodePng(encomenda.getId().toString());
    }

    private Encomenda buscarPorId(UUID id) {
        return encomendaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Encomenda não encontrada para o ID informado."));
    }

    private Integer obterProximoCodigoDiario(LocalDate data) {
        LocalDateTime inicioDoDia = data.atStartOfDay();
        LocalDateTime inicioProximoDia = data.plusDays(1).atStartOfDay();
        return encomendaRepository.findMaxCodigoDiarioByDataCriacaoBetween(inicioDoDia, inicioProximoDia)
                .map(codigoAtual -> codigoAtual + 1)
                .orElse(1);
    }

    private Long obterProximoIdentificadorGeral() {
        return encomendaRepository.findMaxIdentificadorGeral()
                .map(identificadorAtual -> identificadorAtual + 1)
                .orElse(1L);
    }

    private String definirCor(Integer codigoDiario) {
        if (codigoDiario <= 20) {
            return "VERDE";
        }
        if (codigoDiario <= 40) {
            return "AMARELO";
        }
        return "VERMELHO";
    }

    private String normalizarTexto(String valor) {
        if (valor == null || valor.isBlank()) {
            return null;
        }
        return valor.trim();
    }

    private EncomendaResponse paraResponse(Encomenda encomenda, boolean incluirQrCode) {
        String qrCodeBase64 = incluirQrCode ? qrCodeService.gerarQrCodeBase64(encomenda.getId().toString()) : null;
        return new EncomendaResponse(
                encomenda.getId(),
                encomenda.getIdentificadorGeral(),
                encomenda.getApartamento(),
                encomenda.getNomeMorador(),
                encomenda.getDescricao(),
                encomenda.getCodigoDiario(),
                formatarCodigo(encomenda.getCodigoDiario()),
                encomenda.getCor(),
                encomenda.getStatus(),
                encomenda.getDataCriacao(),
                encomenda.getDataRetirada(),
                qrCodeBase64,
                "/encomendas/" + encomenda.getId() + "/qrcode"
        );
    }

    private String formatarCodigo(Integer codigoDiario) {
        return "#" + String.format("%03d", codigoDiario);
    }
}
