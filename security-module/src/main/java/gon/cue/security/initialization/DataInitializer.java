package gon.cue.security.initialization;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final DefaultDataLoader defaultDataLoader;

    @Override
    public void run(String... args) {
        defaultDataLoader.loadDefaultData();
    }
}