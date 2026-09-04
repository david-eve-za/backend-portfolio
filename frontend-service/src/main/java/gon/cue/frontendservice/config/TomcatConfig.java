package gon.cue.frontendservice.config;

import jakarta.servlet.DispatcherType;
import jakarta.servlet.Filter;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import gon.cue.frontendservice.config.ApiProxyFilter;

import java.util.EnumSet;

@Configuration
public class TomcatConfig {

    @Bean
    public FilterRegistrationBean<ApiProxyFilter> apiProxyFilterRegistration() {
        FilterRegistrationBean<ApiProxyFilter> registration = new FilterRegistrationBean<>();
        registration.setFilter(new ApiProxyFilter());
        registration.setUrlPatterns(java.util.List.of("/api/*"));
        registration.setDispatcherTypes(EnumSet.of(
                DispatcherType.REQUEST,
                DispatcherType.ASYNC,
                DispatcherType.ERROR
        ));
        registration.setOrder(1);
        return registration;
    }
}