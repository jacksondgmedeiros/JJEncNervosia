# Controle de Encomendas

MVP em Java 17 + Spring Boot para controle de encomendas em portarias de condomínios.

## Requisitos
- Java 17+
- Maven 3.9+

## Como rodar
```bash
mvn spring-boot:run
```

A aplicação sobe em `http://localhost:8080`.

## Recursos
- Tela única para cadastro rápido e listagem.
- Geração automática de UUID, código diário e cor visual.
- QR Code em Base64 no cadastro e endpoint PNG dedicado.
- Banco H2 em memória.
- H2 Console em `http://localhost:8080/h2-console`.

## Endpoints
- `POST /encomendas`
- `GET /encomendas`
- `GET /encomendas/pendentes`
- `PUT /encomendas/{id}/retirar`
- `GET /encomendas/apartamento/{numero}`
- `GET /encomendas/{id}/qrcode`
