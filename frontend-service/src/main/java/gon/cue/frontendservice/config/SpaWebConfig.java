package gon.cue.frontendservice.config;

import java.io.IOException;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

@Configuration
public class SpaWebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Handle static assets (fonts, images, etc.) - serve directly, no fallback
        registry.addResourceHandler("/media/**")
                .addResourceLocations("classpath:/static/media/")
                .resourceChain(true);

        // Handle other static assets (css, js, etc.)
        registry.addResourceHandler("/*.js", "/*.css", "/*.ico", "/*.png", "/*.jpg", "/*.svg", "/*.woff", "/*.woff2")
                .addResourceLocations("classpath:/static/")
                .resourceChain(true);

        // SPA fallback for all other routes - exclude API and media
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(String resourcePath, Resource location) throws IOException {
                        Resource requested = location.createRelative(resourcePath);
                        if (requested.exists() && requested.isReadable()) {
                            return requested;
                        }
                        // Only fallback to index.html for non-API, non-media routes
                        if (!resourcePath.startsWith("api/") && !resourcePath.startsWith("media/")) {
                            return new ClassPathResource("/static/index.html");
                        }
                        return null;
                    }
                });
    }
}