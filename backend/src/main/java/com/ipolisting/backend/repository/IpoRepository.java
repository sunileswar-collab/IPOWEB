package com.ipolisting.backend.repository;

import com.ipolisting.backend.model.Ipo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface IpoRepository extends JpaRepository<Ipo, Long> {
    List<Ipo> findByStatus(Ipo.Status status);

    @Query("SELECT i FROM Ipo i WHERE LOWER(i.companyName) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Ipo> searchByCompanyName(@Param("query") String query);

    @Query("SELECT i.status, COUNT(i) FROM Ipo i GROUP BY i.status")
    List<Object[]> countByStatus();

    @Query("SELECT i.riskScore, COUNT(i) FROM Ipo i WHERE i.riskScore IS NOT NULL GROUP BY i.riskScore")
    List<Object[]> countByRiskScore();

    @Query("SELECT i FROM Ipo i WHERE i.status = 'LISTED' AND i.listingPrice IS NOT NULL AND i.ipoPrice IS NOT NULL ORDER BY (i.listingPrice - i.ipoPrice) DESC LIMIT 5")
    List<Ipo> findTopPerformersByListingGain();
}
