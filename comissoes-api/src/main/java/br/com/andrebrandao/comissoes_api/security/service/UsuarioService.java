package br.com.andrebrandao.comissoes_api.security.service;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.andrebrandao.comissoes_api.security.dto.AlterarSenhaRequestDTO;
import br.com.andrebrandao.comissoes_api.security.model.User;
import br.com.andrebrandao.comissoes_api.security.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TenantService tenantService; // Usa o TenantService para pegar o usuário logado

    /**
     * Altera a senha do usuário atualmente logado.
     *
     * @param dto DTO com senha atual e nova senha.
     * @throws BadCredentialsException se a senha atual estiver incorreta.
     */
    @Transactional
    public void alterarSenhaUsuarioLogado(AlterarSenhaRequestDTO dto) {
        // 1. Busca o usuário logado de forma segura
        User usuarioLogado = tenantService.getUsuarioLogado();
        
        if (usuarioLogado == null) {
            throw new EntityNotFoundException("Usuário logado não encontrado.");
        }

        // 2. Verifica se a senha atual informada bate com a do banco
        if (!passwordEncoder.matches(dto.getSenhaAtual(), usuarioLogado.getPassword())) {
            throw new BadCredentialsException("A senha atual fornecida está incorreta.");
        }

        // 3. Criptografa a nova senha
        String novaSenhaCriptografada = passwordEncoder.encode(dto.getNovaSenha());

        // 4. Atualiza e salva
        usuarioLogado.setSenha(novaSenhaCriptografada);
        userRepository.save(usuarioLogado);
    }
}