package com.condominio.encomendas.dto;

import com.condominio.encomendas.model.StatusEncomenda;
import java.time.LocalDateTime;
import java.util.UUID;

public record EncomendaResponse(
        UUID id,
        String apartamento,
        String nomeMorador,
        String descricao,
        Integer codigoDiario,
        String codigoFormatado,
        String cor,
        StatusEncomenda status,
        LocalDateTime dataCriacao,
        LocalDateTime dataRetirada,
        String qrCodeBase64,
        String qrCodeImageUrl
) {
}
