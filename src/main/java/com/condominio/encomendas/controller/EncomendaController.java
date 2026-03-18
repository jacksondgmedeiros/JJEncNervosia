package com.condominio.encomendas.controller;

import com.condominio.encomendas.dto.CriarEncomendaRequest;
import com.condominio.encomendas.dto.EncomendaResponse;
import com.condominio.encomendas.service.EncomendaService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/encomendas")
public class EncomendaController {

    private final EncomendaService encomendaService;

    public EncomendaController(EncomendaService encomendaService) {
        this.encomendaService = encomendaService;
    }

    @PostMapping
    public ResponseEntity<EncomendaResponse> criar(@Valid @RequestBody CriarEncomendaRequest request) {
        return ResponseEntity.ok(encomendaService.criar(request));
    }

    @GetMapping
    public ResponseEntity<List<EncomendaResponse>> listarTodas() {
        return ResponseEntity.ok(encomendaService.listarTodas());
    }

    @GetMapping("/pendentes")
    public ResponseEntity<List<EncomendaResponse>> listarPendentes() {
        return ResponseEntity.ok(encomendaService.listarPendentes());
    }

    @GetMapping("/apartamento/{numero}")
    public ResponseEntity<List<EncomendaResponse>> listarPorApartamento(@PathVariable("numero") String numero) {
        return ResponseEntity.ok(encomendaService.listarPorApartamento(numero));
    }

    @PutMapping("/{id}/retirar")
    public ResponseEntity<EncomendaResponse> retirar(@PathVariable UUID id) {
        return ResponseEntity.ok(encomendaService.retirar(id));
    }

    @GetMapping(value = "/{id}/qrcode", produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<byte[]> obterQrCode(@PathVariable UUID id) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=qrcode-" + id + ".png")
                .contentType(MediaType.IMAGE_PNG)
                .body(encomendaService.gerarQrCodeImagem(id));
    }
}
