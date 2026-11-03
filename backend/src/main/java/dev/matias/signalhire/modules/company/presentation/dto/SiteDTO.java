package dev.matias.signalhire.modules.company.presentation.dto;

import dev.matias.signalhire.modules.company.domain.model.vo.site.Site;
import dev.matias.signalhire.modules.company.domain.model.vo.site.SiteType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

@Builder
public record SiteDTO(
        @NotNull(message = "O tipo do site é obrigatório.")
        SiteType type,
        @NotBlank(message = "A URL do site é obrigatória.")
        String url
) {
    public static SiteDTO from(Site site) {
        if (site == null) return null;
        return new SiteDTO(site.type(), site.url());
    }

    public Site toDomain() {
        return new Site(this.type, this.url);
    }
}
