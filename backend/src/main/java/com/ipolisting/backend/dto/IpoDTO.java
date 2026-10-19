package com.ipolisting.backend.dto;

import com.ipolisting.backend.model.Ipo;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

public class IpoDTO {

    @Data
    public static class Request {
        @NotBlank
        private String companyName;
        private String logoUrl;
        private String priceBand;
        @NotNull
        private LocalDate openDate;
        @NotNull
        private LocalDate closeDate;
        private String issueSize;
        private String issueType;
        private LocalDate listingDate;
        private Ipo.Status status;
        private Double ipoPrice;
        private Double listingPrice;
        private Double currentMarketPrice;
        private String rhpPdfUrl;
        private String drhpPdfUrl;
    }

    @Data
    public static class Response {
        private Long id;
        private String companyName;
        private String logoUrl;
        private String priceBand;
        private LocalDate openDate;
        private LocalDate closeDate;
        private String issueSize;
        private String issueType;
        private LocalDate listingDate;
        private String status;
        private Double ipoPrice;
        private Double listingPrice;
        private Double currentMarketPrice;
        private Double listingGain;
        private Double currentReturn;
        private String rhpPdfUrl;
        private String drhpPdfUrl;
        private String riskScore;

        public static Response from(Ipo ipo) {
            Response r = new Response();
            r.id = ipo.getId();
            r.companyName = ipo.getCompanyName();
            r.logoUrl = ipo.getLogoUrl();
            r.priceBand = ipo.getPriceBand();
            r.openDate = ipo.getOpenDate();
            r.closeDate = ipo.getCloseDate();
            r.issueSize = ipo.getIssueSize();
            r.issueType = ipo.getIssueType();
            r.listingDate = ipo.getListingDate();
            r.status = ipo.getStatus().name();
            r.ipoPrice = ipo.getIpoPrice();
            r.listingPrice = ipo.getListingPrice();
            r.currentMarketPrice = ipo.getCurrentMarketPrice();
            r.listingGain = ipo.getListingGain();
            r.currentReturn = ipo.getCurrentReturn();
            r.rhpPdfUrl = ipo.getRhpPdfUrl();
            r.drhpPdfUrl = ipo.getDrhpPdfUrl();
            r.riskScore = ipo.getRiskScore() != null ? ipo.getRiskScore().name() : null;
            return r;
        }
    }
}
