package dev.matias.signalhire.modules.company.domain.repository;

import dev.matias.signalhire.modules.company.domain.model.Company;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CompanyRepository extends MongoRepository<Company, ObjectId> {

    @Query("{ 'members.user._id': ?0 }")
    List<Company> findAllByMemberUserId(ObjectId userId);

    boolean existsByNameIgnoreCase(String name);

    boolean existsByLegalNameIgnoreCase(String legalName);
}
