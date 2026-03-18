package com.condominio.encomendas.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.MultiFormatWriter;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class QrCodeService {

    public byte[] gerarQrCodePng(String conteudo) {
        try {
            BitMatrix bitMatrix = new MultiFormatWriter().encode(
                    conteudo,
                    BarcodeFormat.QR_CODE,
                    240,
                    240,
                    Map.of(EncodeHintType.MARGIN, 1)
            );

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);
            return outputStream.toByteArray();
        } catch (WriterException | IOException exception) {
            throw new IllegalStateException("Não foi possível gerar o QR Code.", exception);
        }
    }

    public String gerarQrCodeBase64(String conteudo) {
        return Base64.getEncoder().encodeToString(gerarQrCodePng(conteudo));
    }
}
