package com.ipolisting.backend.service;

import com.ipolisting.backend.dto.UserDTO;
import com.ipolisting.backend.model.User;
import com.ipolisting.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;

    public AdminService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserDTO::from)
                .collect(Collectors.toList());
    }

    public UserDTO changeRole(Long userId, String role) {
        User user = findById(userId);
        user.setRole(User.Role.valueOf(role.toUpperCase()));
        return UserDTO.from(userRepository.save(user));
    }

    public UserDTO toggleUserStatus(Long userId) {
        User user = findById(userId);
        user.setEnabled(!user.isEnabled());
        return UserDTO.from(userRepository.save(user));
    }

    public void deleteUser(Long userId) {
        userRepository.deleteById(userId);
    }

    public Map<String, Object> getDashboardStats(IpoService ipoService) {
        long totalUsers = userRepository.count();
        Map<String, Long> ipoStats = ipoService.getStatusStats();
        return Map.of("totalUsers", totalUsers, "ipoStats", ipoStats);
    }

    private User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }
}
