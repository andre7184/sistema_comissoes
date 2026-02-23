package br.com.andrebrandao.comissoes_api.produtos.comissoes.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import br.com.andrebrandao.comissoes_api.produtos.comissoes.model.Vendedor;
import br.com.andrebrandao.comissoes_api.produtos.comissoes.repository.projection.HistoricoRendimentoProjection;
import br.com.andrebrandao.comissoes_api.produtos.comissoes.repository.projection.VendedorComVendasProjection; // NOVO IMPORT

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface VendedorRepository extends JpaRepository<Vendedor, Long> {

    List<Vendedor> findByEmpresaId(Long empresaId);
    Optional<Vendedor> findByEmpresaIdAndId(Long empresaId, Long id);

/**
     * Contagem para busca individual/atualização.
     * AGORA FILTRA POR STATUS = 'CONFIRMADA'.
     */
    @Query("SELECT COUNT(v) FROM Venda v WHERE v.vendedor.id = :vendedorId AND v.status = 'CONFIRMADA'") // <-- CORREÇÃO
    Long contarVendasPorVendedorId(Long vendedorId);

    /**
     * Soma para busca individual/atualização.
     * AGORA FILTRA POR STATUS = 'CONFIRMADA'.
     */
    @Query("SELECT SUM(v.valorVenda) FROM Venda v WHERE v.vendedor.id = :vendedorId AND v.status = 'CONFIRMADA'") // <-- CORREÇÃO
    BigDecimal somarVendasPorVendedorId(Long vendedorId);

    /**
     * Consulta OTIMIZADA para listagem (resolve N+1).
     * AGORA FILTRA POR STATUS = 'CONFIRMADA' na cláusula JOIN.
     * NOTA: É necessário adicionar a condição de STATUS na cláusula ON da JOIN.
     */
    @Query("SELECT NEW br.com.andrebrandao.comissoes_api.produtos.comissoes.repository.projection.VendedorComVendasProjection(" +
            "v, " +
            "COUNT(vn.id), " +
            "SUM(vn.valorVenda)" +
            ") " +
            "FROM Vendedor v " +
            "LEFT JOIN v.usuario u " +
            // CORREÇÃO: Adicionamos a condição de status na JOIN
            "LEFT JOIN Venda vn ON vn.vendedor = v AND vn.status = 'CONFIRMADA' " +
            "WHERE v.empresa.id = :empresaId " +
            "GROUP BY v.id, v.percentualComissao, u.id, u.nome, u.email")
    List<VendedorComVendasProjection> findAllWithVendasCount(Long empresaId);

    // VendedorRepository.java (Apenas a Query findHistoricoRendimentosMensais)
    /**
     * SQL Nativo para Histórico Mensal do Vendedor.
     * AGORA FILTRA POR STATUS = 'CONFIRMADA'.
     */
    @Query(value = "SELECT " +
           "    TO_CHAR(v.data_venda, 'YYYY-MM') AS mesAno, " +
           "    COALESCE(SUM(v.valor_venda), 0) AS valorVendido, " +
           "    COALESCE(SUM(v.valor_comissao_calculado), 0) AS valorComissao " +
           "FROM " +
           "    venda v " +
           "WHERE " +
           "    v.vendedor_id = :vendedorId AND " +
           "    v.status = 'CONFIRMADA' " + // <-- CORREÇÃO
           "GROUP BY " +
           "    TO_CHAR(v.data_venda, 'YYYY-MM') " +
           "ORDER BY " +
           "    mesAno DESC",
           nativeQuery = true)
    List<HistoricoRendimentoProjection> findHistoricoRendimentosMensais(Long vendedorId);

    /**
     * 2. NOVO MÉTODO:
     * Busca um Vendedor específico pelo ID do seu User (usuário) associado.
     * Usado pelo Portal do Vendedor para encontrar "quem" é o vendedor logado.
     * Query Mágica: "SELECT * FROM vendedor WHERE user_id = ?"
     *
     * @param usuarioId O ID do User logado.
     * @return um Optional contendo o Vendedor associado àquele User.
     */
    Optional<Vendedor> findByUsuarioId(Long usuarioId);
}