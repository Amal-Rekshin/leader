package com.bilateral.ledger.repository;

import com.bilateral.ledger.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByUserIdOrderByDateAsc(Long userId);
}
