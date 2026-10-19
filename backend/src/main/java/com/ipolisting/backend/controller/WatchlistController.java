package com.ipolisting.backend.controller;

import com.ipolisting.backend.model.Watchlist;
import com.ipolisting.backend.service.WatchlistService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/watchlist")
public class WatchlistController {

    private final WatchlistService watchlistService;

    public WatchlistController(WatchlistService watchlistService) {
        this.watchlistService = watchlistService;
    }

    @GetMapping
    public ResponseEntity<List<Watchlist>> getWatchlist(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(watchlistService.getWatchlist(userDetails.getUsername()));
    }

    @PostMapping("/{ipoId}")
    public ResponseEntity<Watchlist> addToWatchlist(
            @PathVariable Long ipoId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(watchlistService.addToWatchlist(userDetails.getUsername(), ipoId));
    }

    @DeleteMapping("/{ipoId}")
    public ResponseEntity<Void> removeFromWatchlist(
            @PathVariable Long ipoId,
            @AuthenticationPrincipal UserDetails userDetails) {
        watchlistService.removeFromWatchlist(userDetails.getUsername(), ipoId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{ipoId}/check")
    public ResponseEntity<Map<String, Boolean>> checkWatchlist(
            @PathVariable Long ipoId,
            @AuthenticationPrincipal UserDetails userDetails) {
        boolean watchlisted = watchlistService.isWatchlisted(userDetails.getUsername(), ipoId);
        return ResponseEntity.ok(Map.of("watchlisted", watchlisted));
    }
}
