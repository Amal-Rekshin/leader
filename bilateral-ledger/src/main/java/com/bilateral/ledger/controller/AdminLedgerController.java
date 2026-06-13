package com.bilateral.ledger.controller;

import com.bilateral.ledger.dto.DashboardStatsDTO;
import com.bilateral.ledger.dto.LedgerEntryDTO;
import com.bilateral.ledger.model.AppUser;
import com.bilateral.ledger.service.AdminLedgerService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminLedgerController {

    private final AdminLedgerService adminLedgerService;

    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody CreateUserRequest req) {
        try {
            AppUser user = adminLedgerService.createUser(req.getName(), req.getEmail(), req.getPassword(), req.getPhone(), req.getRole() != null ? req.getRole() : "USER");
            return ResponseEntity.ok(Map.of("success", true, "userId", user.getId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/users")
    public ResponseEntity<List<AppUser>> getAllUsers() {
        return ResponseEntity.ok(adminLedgerService.getAllUsers());
    }

    @PutMapping("/users/{userId}")
    public ResponseEntity<?> updateUser(@PathVariable Long userId, @RequestBody CreateUserRequest req) {
        try {
            AppUser user = adminLedgerService.updateUser(userId, req.getName(), req.getEmail(), req.getPhone());
            return ResponseEntity.ok(Map.of("success", true, "message", "User updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        try {
            adminLedgerService.deleteUser(userId);
            return ResponseEntity.ok(Map.of("success", true, "message", "User deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping("/invoices")
    public ResponseEntity<?> createInvoice(@RequestBody InvoiceRequest req) {
        try {
            adminLedgerService.createInvoice(req.getUserId(), req.getDescription(), req.getAmount());
            return ResponseEntity.ok(Map.of("success", true, "message", "Invoice created successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping("/payments")
    public ResponseEntity<?> recordPayment(@RequestBody PaymentRequest req) {
        try {
            adminLedgerService.recordPayment(req.getUserId(), req.getDescription(), req.getAmount());
            return ResponseEntity.ok(Map.of("success", true, "message", "Payment recorded successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/ledger/{userId}")
    public ResponseEntity<List<LedgerEntryDTO>> getUserLedger(@PathVariable Long userId) {
        return ResponseEntity.ok(adminLedgerService.getUserLedger(userId));
    }

    @GetMapping("/ledger/all")
    public ResponseEntity<List<LedgerEntryDTO>> getAllLedger() {
        return ResponseEntity.ok(adminLedgerService.getAllLedger());
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStatsDTO> getDashboardStats() {
        return ResponseEntity.ok(adminLedgerService.getDashboardStats());
    }
}

@Data
class CreateUserRequest {
    private String name;
    private String email;
    private String password;
    private String phone;
    private String role;
}

@Data
class InvoiceRequest {
    private Long userId;
    private String description;
    private BigDecimal amount;
}

@Data
class PaymentRequest {
    private Long userId;
    private String description;
    private BigDecimal amount;
}
