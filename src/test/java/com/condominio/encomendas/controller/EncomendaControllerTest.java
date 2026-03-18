package com.condominio.encomendas.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class EncomendaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void deveCriarListarERealizarRetirada() throws Exception {
        String body = """
                {
                  "apartamento": "1203",
                  "nomeMorador": "Maria",
                  "descricao": "Caixa pequena"
                }
                """;

        String response = mockMvc.perform(post("/encomendas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.codigoDiario").value(1))
                .andExpect(jsonPath("$.identificadorGeral").value(1))
                .andExpect(jsonPath("$.codigoFormatado").value("#001"))
                .andExpect(jsonPath("$.cor").value("VERDE"))
                .andExpect(jsonPath("$.status").value("PENDENTE"))
                .andExpect(jsonPath("$.qrCodeBase64").isNotEmpty())
                .andReturn()
                .getResponse()
                .getContentAsString();

        String id = response.replaceAll(".*\"id\":\"([^\"]+)\".*", "$1");

        mockMvc.perform(get("/encomendas"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].apartamento").value("1203"))
                .andExpect(jsonPath("$[0].identificadorGeral").value(1));

        mockMvc.perform(get("/encomendas/pendentes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].status").value("PENDENTE"));

        mockMvc.perform(put("/encomendas/{id}/retirar", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("RETIRADO"))
                .andExpect(jsonPath("$.dataRetirada").isNotEmpty());

        mockMvc.perform(get("/encomendas/apartamento/1203"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].apartamento").value("1203"));
    }

    @Test
    void deveValidarApartamentoObrigatorio() throws Exception {
        mockMvc.perform(post("/encomendas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"apartamento\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem").exists());
    }
}
