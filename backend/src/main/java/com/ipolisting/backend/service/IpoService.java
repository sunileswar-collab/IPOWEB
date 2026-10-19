package com.ipolisting.backend.service;

import com.ipolisting.backend.dto.IpoDTO;
import com.ipolisting.backend.model.Ipo;
import com.ipolisting.backend.repository.IpoRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class IpoService {

    private final IpoRepository ipoRepository;
    private final RiskScoreService riskScoreService;

    public IpoService(IpoRepository ipoRepository, RiskScoreService riskScoreService) {
        this.ipoRepository = ipoRepository;
        this.riskScoreService = riskScoreService;
    }

    public List<IpoDTO.Response> getAll(String status, String search) {
        List<Ipo> ipos;
        if (search != null && !search.isBlank()) {
            ipos = ipoRepository.searchByCompanyName(search);
        } else if (status != null && !status.isBlank()) {
            ipos = ipoRepository.findByStatus(Ipo.Status.valueOf(status.toUpperCase()));
        } else {
            ipos = ipoRepository.findAll();
        }
        return ipos.stream().map(IpoDTO.Response::from).collect(Collectors.toList());
    }

    public IpoDTO.Response getById(Long id) {
        return IpoDTO.Response.from(findById(id));
    }

    public IpoDTO.Response create(IpoDTO.Request request) {
        Ipo ipo = mapToEntity(new Ipo(), request);
        ipo.setRiskScore(riskScoreService.calculate(ipo));
        return IpoDTO.Response.from(ipoRepository.save(ipo));
    }

    public IpoDTO.Response update(Long id, IpoDTO.Request request) {
        Ipo ipo = mapToEntity(findById(id), request);
        ipo.setRiskScore(riskScoreService.calculate(ipo));
        return IpoDTO.Response.from(ipoRepository.save(ipo));
    }

    public void delete(Long id) {
        ipoRepository.deleteById(id);
    }

    public Map<String, Long> getStatusStats() {
        return ipoRepository.countByStatus().stream()
                .collect(Collectors.toMap(
                        row -> row[0].toString(),
                        row -> (Long) row[1]
                ));
    }

    private Ipo findById(Long id) {
        return ipoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("IPO not found with id: " + id));
    }

    private Ipo mapToEntity(Ipo ipo, IpoDTO.Request req) {
        ipo.setCompanyName(req.getCompanyName());
        ipo.setLogoUrl(req.getLogoUrl());
        ipo.setPriceBand(req.getPriceBand());
        ipo.setOpenDate(req.getOpenDate());
        ipo.setCloseDate(req.getCloseDate());
        ipo.setIssueSize(req.getIssueSize());
        ipo.setIssueType(req.getIssueType());
        ipo.setListingDate(req.getListingDate());
        if (req.getStatus() != null) ipo.setStatus(req.getStatus());
        ipo.setIpoPrice(req.getIpoPrice());
        ipo.setListingPrice(req.getListingPrice());
        ipo.setCurrentMarketPrice(req.getCurrentMarketPrice());
        ipo.setRhpPdfUrl(req.getRhpPdfUrl());
        ipo.setDrhpPdfUrl(req.getDrhpPdfUrl());
        return ipo;
    }
}
