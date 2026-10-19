package com.ipolisting.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    // Separate buckets for auth vs general endpoints
    private final ConcurrentHashMap<String, long[]> authWindows    = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, long[]> globalWindows  = new ConcurrentHashMap<>();

    private static final int  AUTH_LIMIT   = 20;
    private static final int  GLOBAL_LIMIT = 100;
    private static final long WINDOW_MS    = 60_000L; // 1 minute

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {

        String ip   = getClientIp(request);
        String path = request.getRequestURI();

        if (path.startsWith("/api/auth/")) {
            if (!isAllowed(ip, authWindows, AUTH_LIMIT)) {
                reject(response, "Too many login attempts. Please wait 1 minute.");
                return;
            }
        } else {
            if (!isAllowed(ip, globalWindows, GLOBAL_LIMIT)) {
                reject(response, "Rate limit exceeded. Please slow down.");
                return;
            }
        }

        chain.doFilter(request, response);
    }

    private boolean isAllowed(String ip, ConcurrentHashMap<String, long[]> windows, int limit) {
        long now = System.currentTimeMillis();
        windows.compute(ip, (key, bucket) -> {
            if (bucket == null) bucket = new long[]{now, 1};
            else if (now - bucket[0] > WINDOW_MS) { bucket[0] = now; bucket[1] = 1; }
            else bucket[1]++;
            return bucket;
        });
        return windows.get(ip)[1] <= limit;
    }

    private String getClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank())
            return forwarded.split(",")[0].trim();
        return request.getRemoteAddr();
    }

    private void reject(HttpServletResponse response, String message) throws IOException {
        response.setStatus(429);
        response.setContentType("application/json");
        response.getWriter().write("{\"error\": \"" + message + "\"}");
    }
}
