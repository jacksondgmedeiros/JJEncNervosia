package com.condominio.encomendas.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "encomendas")
public class Encomenda {

    @Id
    private UUID id;

    @Column(nullable = false)
    private String apartamento;

    private String nomeMorador;

    private String descricao;

    @Column(nullable = false)
    private Integer codigoDiario;

    @Column(nullable = false, unique = true)
    private Long identificadorGeral;

    @Column(nullable = false)
    private String cor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusEncomenda status;

    @Column(nullable = false)
    private LocalDateTime dataCriacao;

    private LocalDateTime dataRetirada;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

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

    public Integer getCodigoDiario() {
        return codigoDiario;
    }

    public void setCodigoDiario(Integer codigoDiario) {
        this.codigoDiario = codigoDiario;
    }

    public Long getIdentificadorGeral() {
        return identificadorGeral;
    }

    public void setIdentificadorGeral(Long identificadorGeral) {
        this.identificadorGeral = identificadorGeral;
    }

    public String getCor() {
        return cor;
    }

    public void setCor(String cor) {
        this.cor = cor;
    }

    public StatusEncomenda getStatus() {
        return status;
    }

    public void setStatus(StatusEncomenda status) {
        this.status = status;
    }

    public LocalDateTime getDataCriacao() {
        return dataCriacao;
    }

    public void setDataCriacao(LocalDateTime dataCriacao) {
        this.dataCriacao = dataCriacao;
    }

    public LocalDateTime getDataRetirada() {
        return dataRetirada;
    }

    public void setDataRetirada(LocalDateTime dataRetirada) {
        this.dataRetirada = dataRetirada;
    }
}
