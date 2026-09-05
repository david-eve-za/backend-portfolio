package gon.cue.frontendservice.config;

import jakarta.servlet.DispatcherType;
import jakarta.servlet.Filter;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.EnumSet;

@Configuration
public class TomcatConfig {

    // No servlet filter registration needed - using WebFilter (ApiProxyWebFilter) for reactive stack
    // This configuration class can be removed or kept for future servlet filter needs
}