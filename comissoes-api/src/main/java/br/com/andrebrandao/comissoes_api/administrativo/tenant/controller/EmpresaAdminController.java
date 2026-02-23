package br.com.andrebrandao.comissoes_api.administrativo.tenant.controller;

import java.util.List;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import br.com.andrebrandao.comissoes_api.administrativo.dto.AdminUsuarioRequestDTO; // Criação
import br.com.andrebrandao.comissoes_api.administrativo.dto.EmpresaDetalhesDTO;
import br.com.andrebrandao.comissoes_api.administrativo.model.Modulo;
import br.com.andrebrandao.comissoes_api.administrativo.service.EmpresaService;
import br.com.andrebrandao.comissoes_api.security.dto.AdminUsuarioUpdateRequestDTO; // Atualização
import br.com.andrebrandao.comissoes_api.security.dto.UsuarioResponseDTO;
import br.com.andrebrandao.comissoes_api.security.model.User;
import br.com.andrebrandao.comissoes_api.security.service.TenantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/empresa")
@RequiredArgsConstructor
public class EmpresaAdminController {

    private final TenantService tenantService;
    private final EmpresaService empresaService;

    // --- INFORMAÇÕES DA EMPRESA ---

    @GetMapping("/me")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public EmpresaDetalhesDTO buscarMinhaEmpresa() {
        return empresaService.buscarDetalhesEmpresaLogada();
    }

    @GetMapping("/meus-modulos")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public Set<Modulo> listarMeusModulosAtivos() {
        User adminLogado = tenantService.getUsuarioLogado();
        if (adminLogado != null && adminLogado.getEmpresa() != null) {
             // Recomendo mover essa lógica para o Service para evitar Lazy loading issues no controller
             return adminLogado.getEmpresa().getModulosAtivos();
        }
        return Set.of();
    }

    // --- GERENCIAMENTO DE ADMINS (USUÁRIOS) ---

    /**
     * 1. LISTAR (GET): Retorna todos os admins da empresa.
     */
    @GetMapping("/admins")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public List<UsuarioResponseDTO> listarAdminsDaMinhaEmpresa() {
        return empresaService.listarAdminsDaMinhaEmpresa();
    }

    /**
     * 2. BUSCAR UM (GET /{id}): Detalhes de um admin específico.
     */
    @GetMapping("/admins/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public UsuarioResponseDTO buscarAdminPorId(@PathVariable Long id) {
        return empresaService.buscarAdminDaMinhaEmpresa(id);
    }

    /**
     * 3. CADASTRAR (POST): Cria novo admin (com senha).
     */
    @PostMapping("/admins")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public UsuarioResponseDTO criarAdminParaMinhaEmpresa(@Valid @RequestBody AdminUsuarioRequestDTO dto) {
        User novoAdmin = empresaService.criarAdminParaMinhaEmpresa(dto);
        return UsuarioResponseDTO.fromEntity(novoAdmin);
    }

    /**
     * 4. ATUALIZAR/DESATIVAR (PUT): Altera nome, email e status (ativo/inativo).
     */
    @PutMapping("/admins/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public UsuarioResponseDTO atualizarAdminDaMinhaEmpresa(
            @PathVariable Long id, 
            @Valid @RequestBody AdminUsuarioUpdateRequestDTO dto) {
        
        User userAtualizado = empresaService.atualizarAdminDaMinhaEmpresa(id, dto);
        return UsuarioResponseDTO.fromEntity(userAtualizado);
    }
}