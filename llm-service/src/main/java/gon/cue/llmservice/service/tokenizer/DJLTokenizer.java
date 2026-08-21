package gon.cue.llmservice.service.tokenizer;

import ai.djl.huggingface.tokenizers.Encoding;
import ai.djl.huggingface.tokenizers.HuggingFaceTokenizer;
import ai.djl.modality.nlp.preprocess.Tokenizer;
import ai.djl.sentencepiece.SpTokenizer;

import java.io.IOException;
import java.nio.file.Path;
import java.util.List;

public class DJLTokenizer {

    private final Tokenizer tokenizer;
    private final TokenizerType type;
    private final HuggingFaceTokenizer hfTokenizer;
    private final SpTokenizer spTokenizer;

    private DJLTokenizer(Tokenizer tokenizer, TokenizerType type) {
        this.tokenizer = tokenizer;
        this.type = type;
        this.hfTokenizer = (type == TokenizerType.HUGGINGFACE || type == TokenizerType.BPE)
            ? (HuggingFaceTokenizer) tokenizer : null;
        this.spTokenizer = (type == TokenizerType.SENTENCEPIECE)
            ? (SpTokenizer) tokenizer : null;
    }

    public static DJLTokenizer create(TokenizerType type, String modelId, Path cacheDir) {
        Tokenizer tokenizer = switch (type) {
            case HUGGINGFACE -> {
                // HuggingFace tokenizer from model hub
                yield HuggingFaceTokenizer.newInstance(modelId);
            }
            case SENTENCEPIECE -> {
                // SentencePiece tokenizer from local model file
                try {
                    yield new SpTokenizer(cacheDir.resolve(modelId + ".model"));
                } catch (IOException e) {
                    throw new IllegalStateException("Failed to load SentencePiece tokenizer", e);
                }
            }
            case BPE -> {
                // BPE tokenization via HuggingFace tokenizer
                yield HuggingFaceTokenizer.newInstance(modelId);
            }
        };
        return new DJLTokenizer(tokenizer, type);
    }

    public int countTokens(String text) {
        if (hfTokenizer != null) {
            Encoding encoding = hfTokenizer.encode(text);
            return encoding.getIds().length;
        } else if (spTokenizer != null) {
            List<String> tokens = spTokenizer.tokenize(text);
            return tokens.size();
        }
        List<String> tokens = tokenizer.tokenize(text);
        return tokens.size();
    }

    public Encoding encode(String text) {
        if (hfTokenizer != null) {
            return hfTokenizer.encode(text);
        }
        throw new UnsupportedOperationException("Encoding only supported for HuggingFace tokenizers");
    }

    public List<String> tokenize(String text) {
        return tokenizer.tokenize(text);
    }

    public String decode(int[] ids) {
        if (hfTokenizer != null) {
            long[] longIds = new long[ids.length];
            for (int i = 0; i < ids.length; i++) {
                longIds[i] = ids[i];
            }
            return hfTokenizer.decode(longIds);
        }
        throw new UnsupportedOperationException("Decode only supported for HuggingFace tokenizers");
    }

    public TokenizerType getType() {
        return type;
    }
}