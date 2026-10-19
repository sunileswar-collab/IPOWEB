package com.ipolisting.backend.repository;

import com.ipolisting.backend.model.Watchlist;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface WatchlistRepository extends JpaRepository<Watchlist, Long> {
    List<Watchlist> findByUserId(Long userId);
    Optional<Watchlist> findByUserIdAndIpoId(Long userId, Long ipoId);
    boolean existsByUserIdAndIpoId(Long userId, Long ipoId);
    void deleteByUserIdAndIpoId(Long userId, Long ipoId);
}
