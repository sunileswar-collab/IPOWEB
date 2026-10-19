package com.ipolisting.backend.controller;

import com.ipolisting.backend.dto.IpoDTO;
import com.ipolisting.backend.service.IpoService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ipos")
public class IpoController {

    private final IpoService ipoService;

    public IpoController(IpoService ipoService) {
        this.ipoService = ipoService;
    }

    @GetMapping
    public ResponseEntity<List<IpoDTO.Response>> getAll(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(ipoService.getAll(status, search));
    }

    @GetMapping("/{id}")
    public ResponseEntity<IpoDTO.Response> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ipoService.getById(id));
    }

    @PostMapping
    public ResponseEntity<IpoDTO.Response> create(@Valid @RequestBody IpoDTO.Request request) {
        return ResponseEntity.ok(ipoService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<IpoDTO.Response> update(@PathVariable Long id, @Valid @RequestBody IpoDTO.Request request) {
        return ResponseEntity.ok(ipoService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        ipoService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getStats() {
        return ResponseEntity.ok(ipoService.getStatusStats());
    }
}
