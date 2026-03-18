package com.condominio.encomendas.repository;

import com.condominio.encomendas.model.Encomenda;
import com.condominio.encomendas.model.StatusEncomenda;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface EncomendaRepository extends JpaRepository<Encomenda, UUID> {

    List<Encomenda> findAllByStatusOrderByDataCriacaoDesc(StatusEncomenda status);

    List<Encomenda> findAllByApartamentoOrderByDataCriacaoDesc(String apartamento);

    List<Encomenda> findAllByOrderByDataCriacaoDesc();

    @Query("""
            select max(e.codigoDiario)
            from Encomenda e
            where e.dataCriacao >= :inicioDoDia and e.dataCriacao < :inicioProximoDia
            """)
    Optional<Integer> findMaxCodigoDiarioByDataCriacaoBetween(
            @Param("inicioDoDia") LocalDateTime inicioDoDia,
            @Param("inicioProximoDia") LocalDateTime inicioProximoDia
    );
}
