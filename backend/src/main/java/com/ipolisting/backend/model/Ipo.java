package com.ipolisting.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "ipos")
@Data
public class Ipo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_name", nullable = false)
    private String companyName;

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(name = "price_band")
    private String priceBand;

    @Column(name = "open_date", nullable = false)
    private LocalDate openDate;

    @Column(name = "close_date", nullable = false)
    private LocalDate closeDate;

    @Column(name = "issue_size")
    private String issueSize;

    @Column(name = "issue_type")
    private String issueType;

    @Column(name = "listing_date")
    private LocalDate listingDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.UPCOMING;

    @Column(name = "ipo_price")
    private Double ipoPrice;

    @Column(name = "listing_price")
    private Double listingPrice;

    @Column(name = "current_market_price")
    private Double currentMarketPrice;

    @Column(name = "rhp_pdf_url")
    private String rhpPdfUrl;

    @Column(name = "drhp_pdf_url")
    private String drhpPdfUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "risk_score")
    private RiskScore riskScore;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Double getListingGain() {
        if (ipoPrice != null && listingPrice != null && ipoPrice > 0)
            return Math.round(((listingPrice - ipoPrice) / ipoPrice) * 100 * 100.0) / 100.0;
        return null;
    }

    public Double getCurrentReturn() {
        if (ipoPrice != null && currentMarketPrice != null && ipoPrice > 0)
            return Math.round(((currentMarketPrice - ipoPrice) / ipoPrice) * 100 * 100.0) / 100.0;
        return null;
    }

    public enum Status {
        UPCOMING, ONGOING, LISTED
    }

    public enum RiskScore {
        LOW, MEDIUM, HIGH
    }
}
