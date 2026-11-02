package dev.matias.signalhire.modules.company.domain.model;

import lombok.*;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Document(collection = "companies")
public class Company {

    @Id
    @EqualsAndHashCode.Include
    @Builder.Default
    private ObjectId id = ObjectId.get();

    private String name;
}
