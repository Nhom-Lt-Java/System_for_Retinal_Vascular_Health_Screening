package com.aura.retinal.service;

import com.aura.retinal.entity.AiSetting;
import com.aura.retinal.entity.User;
import com.aura.retinal.repository.AiSettingRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
public class AiSettingService {

    public static final String KEY_MODEL_VERSION = "model_version";
    public static final String KEY_THRESHOLDS = "thresholds";

    private final AiSettingRepository repo;
    private final ObjectMapper om = new ObjectMapper();

    public AiSettingService(AiSettingRepository repo) {
        this.repo = repo;
    }

    public String getModelVersionOrDefault(String def) {
        return repo.findBySettingKey(KEY_MODEL_VERSION)
                .map(AiSetting::getValueJson)
                .map(JsonNode::asText)
                .filter(s -> s != null && !s.isBlank())
                .orElse(def);
    }

    public JsonNode getThresholdsOrEmpty() {
        return repo.findBySettingKey(KEY_THRESHOLDS)
                .map(AiSetting::getValueJson)
                .orElse(om.createObjectNode());
    }

    public Map<String, JsonNode> getAll() {
        Map<String, JsonNode> out = new HashMap<>();
        for (AiSetting s : repo.findAll()) {
            out.put(s.getSettingKey(), s.getValueJson());
        }
        return out;
    }

    @Transactional
    public AiSetting upsert(String key, JsonNode value, User updatedBy) {
        AiSetting s = repo.findBySettingKey(key).orElseGet(AiSetting::new);
        s.setSettingKey(key);
        s.setValueJson(value == null ? om.createObjectNode() : value);
        s.setUpdatedBy(updatedBy);
        return repo.save(s);
    }
}
