package com.aura.retinal.ai;

import com.aura.retinal.config.AiProperties;

import java.util.UUID;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

@Component
public class AiClient {
    private final WebClient webClient;

    public AiClient(WebClient.Builder builder, AiProperties props) {
        this.webClient = builder.baseUrl(props.getBaseUrl()).build();
    }

    public AiPredictResponse predict(UUID analysisId, byte[] imageBytes, String filename, String contentType) {
        MultipartBodyBuilder mb = new MultipartBodyBuilder();
        mb.part("file", new ByteArrayResource(imageBytes) {
            @Override public String getFilename() { return filename; }
        }).contentType(MediaType.parseMediaType(contentType));

        mb.part("analysis_id", analysisId.toString());

        return webClient.post()
                .uri("/api/predict")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData(mb.build()))
                .retrieve()
                .bodyToMono(AiPredictResponse.class)
                .block();
    }
}
