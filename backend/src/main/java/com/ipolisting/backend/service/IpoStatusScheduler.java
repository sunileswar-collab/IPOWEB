package com.ipolisting.backend.service;

import com.ipolisting.backend.model.Ipo;
import com.ipolisting.backend.model.Watchlist;
import com.ipolisting.backend.repository.IpoRepository;
import com.ipolisting.backend.repository.WatchlistRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Component
public class IpoStatusScheduler {

    private final IpoRepository ipoRepository;
    private final WatchlistRepository watchlistRepository;
    private final NotificationService notificationService;

    public IpoStatusScheduler(IpoRepository ipoRepository,
                               WatchlistRepository watchlistRepository,
                               NotificationService notificationService) {
        this.ipoRepository = ipoRepository;
        this.watchlistRepository = watchlistRepository;
        this.notificationService = notificationService;
    }

    @Scheduled(fixedRate = 3600000) // every hour
    @Transactional
    public void updateIpoStatuses() {
        LocalDate today = LocalDate.now();

        List<Ipo> upcoming = ipoRepository.findByStatus(Ipo.Status.UPCOMING);
        for (Ipo ipo : upcoming) {
            if (!today.isBefore(ipo.getOpenDate())) {
                ipo.setStatus(Ipo.Status.ONGOING);
                ipoRepository.save(ipo);
                notifyWatchers(ipo, ipo.getCompanyName() + " IPO is now OPEN for subscription!");
            }
        }

        List<Ipo> ongoing = ipoRepository.findByStatus(Ipo.Status.ONGOING);
        for (Ipo ipo : ongoing) {
            if (today.isAfter(ipo.getCloseDate())) {
                ipo.setStatus(Ipo.Status.LISTED);
                ipoRepository.save(ipo);
                notifyWatchers(ipo, ipo.getCompanyName() + " IPO subscription closed. Listing date: "
                        + (ipo.getListingDate() != null ? ipo.getListingDate() : "TBD"));
            }
        }
    }

    private void notifyWatchers(Ipo ipo, String message) {
        List<Watchlist> watchers = watchlistRepository.findByIpoId(ipo.getId());
        for (Watchlist w : watchers) {
            notificationService.sendToUser(w.getUser(), ipo, message);
        }
    }
}
