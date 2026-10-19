package com.ipolisting.backend.service;

import com.ipolisting.backend.model.Ipo;
import com.ipolisting.backend.model.User;
import com.ipolisting.backend.model.Watchlist;
import com.ipolisting.backend.repository.IpoRepository;
import com.ipolisting.backend.repository.UserRepository;
import com.ipolisting.backend.repository.WatchlistRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class WatchlistService {

    private final WatchlistRepository watchlistRepository;
    private final UserRepository userRepository;
    private final IpoRepository ipoRepository;

    public WatchlistService(WatchlistRepository watchlistRepository,
                            UserRepository userRepository,
                            IpoRepository ipoRepository) {
        this.watchlistRepository = watchlistRepository;
        this.userRepository = userRepository;
        this.ipoRepository = ipoRepository;
    }

    public List<Watchlist> getWatchlist(String email) {
        User user = findUser(email);
        return watchlistRepository.findByUserId(user.getId());
    }

    public Watchlist addToWatchlist(String email, Long ipoId) {
        User user = findUser(email);
        Ipo ipo = ipoRepository.findById(ipoId)
                .orElseThrow(() -> new RuntimeException("IPO not found with id: " + ipoId));

        if (watchlistRepository.existsByUserIdAndIpoId(user.getId(), ipoId))
            throw new RuntimeException("IPO already in watchlist");

        Watchlist watchlist = new Watchlist();
        watchlist.setUser(user);
        watchlist.setIpo(ipo);
        return watchlistRepository.save(watchlist);
    }

    @Transactional
    public void removeFromWatchlist(String email, Long ipoId) {
        User user = findUser(email);
        watchlistRepository.deleteByUserIdAndIpoId(user.getId(), ipoId);
    }

    public boolean isWatchlisted(String email, Long ipoId) {
        User user = findUser(email);
        return watchlistRepository.existsByUserIdAndIpoId(user.getId(), ipoId);
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
    }
}
