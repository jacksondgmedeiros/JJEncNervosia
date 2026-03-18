package com.condominio.encomendas.dto;

import jakarta.validation.constraints.NotBlank;

public class CriarEncomendaRequest {

    @NotBlank(message = "O número do apartamento é obrigatório.")
    private String apartamento;

    private String nomeMorador;

    private String descricao;

    public String getApartamento() {
        return apartamento;
    }

    public void setApartamento(String apartamento) {
        this.apartamento = apartamento;
    }

    public String getNomeMorador() {
        return nomeMorador;
    }

    public void setNomeMorador(String nomeMorador) {
        this.nomeMorador = nomeMorador;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }
}
