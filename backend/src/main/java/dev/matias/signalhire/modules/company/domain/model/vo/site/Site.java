package dev.matias.signalhire.modules.company.domain.model.vo.site;

import java.net.URL;

public record Site(
    SiteType type,
    String url
) {
}
