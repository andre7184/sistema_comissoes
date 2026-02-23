package br.com.andrebrandao.comissoes_api.security.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.andrebrandao.comissoes_api.security.dto.AlterarSenhaRequestDTO;
import br.com.andrebrandao.comissoes_api.security.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/usuarios") // Novo padrão de URL
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    /**
     * Endpoint para o usuário logado alterar sua própria senha.
     * Mapeado para: PUT /api/usuarios/me/senha
     */
    @PutMapping("/me/senha")
    @PreAuthorize("isAuthenticated()") // Permite acesso a qualquer usuário logado
    public ResponseEntity<Void> alterarMinhaSenha(@Valid @RequestBody AlterarSenhaRequestDTO dto) {
        usuarioService.alterarSenhaUsuarioLogado(dto);
        return ResponseEntity.noContent().build(); // Retorna 204 (Sucesso sem conteúdo)
    }
}