package com.bilateral.ledger.repository;

import com.bilateral.ledger.model.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    List<Invoice> findByUserIdOrderByDateAsc(Long userId);
}
