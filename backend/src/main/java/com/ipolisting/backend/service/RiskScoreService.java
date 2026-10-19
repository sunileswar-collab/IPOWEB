package com.ipolisting.backend.service;

import com.ipolisting.backend.model.Ipo;
import org.springframework.stereotype.Service;

@Service
public class RiskScoreService {

    /**
     * Calculates IPO risk score based on:
     * - Price band width (wider = higher risk)
     * - Issue size (smaller = higher risk)
     * - Days open (fewer days = higher pressure)
     */
    public Ipo.RiskScore calculate(Ipo ipo) {
        int score = 0;

        // Factor 1: Price band width
        score += getPriceBandScore(ipo.getPriceBand());

        // Factor 2: Issue size
        score += getIssueSizeScore(ipo.getIssueSize());

        // Factor 3: Subscription window
        if (ipo.getOpenDate() != null && ipo.getCloseDate() != null) {
            long days = java.time.temporal.ChronoUnit.DAYS.between(ipo.getOpenDate(), ipo.getCloseDate());
            if (days <= 1) score += 2;
            else if (days <= 3) score += 1;
        }

        if (score >= 5) return Ipo.RiskScore.HIGH;
        if (score >= 3) return Ipo.RiskScore.MEDIUM;
        return Ipo.RiskScore.LOW;
    }

    private int getPriceBandScore(String priceBand) {
        if (priceBand == null) return 1;
        try {
            String[] parts = priceBand.replace("₹", "").replace(" ", "").split("-");
            if (parts.length == 2) {
                double low = Double.parseDouble(parts[0]);
                double high = Double.parseDouble(parts[1]);
                double widthPercent = ((high - low) / low) * 100;
                if (widthPercent > 10) return 3;
                if (widthPercent > 5) return 2;
                return 1;
            }
        } catch (Exception ignored) {}
        return 1;
    }

    private int getIssueSizeScore(String issueSize) {
        if (issueSize == null) return 1;
        try {
            double size = Double.parseDouble(issueSize.replaceAll("[^0-9.]", ""));
            if (size < 100) return 2;
            if (size < 500) return 1;
            return 0;
        } catch (Exception ignored) {}
        return 1;
    }
}
