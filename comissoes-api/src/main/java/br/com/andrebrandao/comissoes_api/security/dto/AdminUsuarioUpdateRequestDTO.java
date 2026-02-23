package br.com.andrebrandao.comissoes_api.security.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AdminUsuarioUpdateRequestDTO {

    @NotBlank(message = "O nome do admin não pode ser vazio.")
    @Size(min = 3, max = 100, message = "O nome deve ter entre 3 e 100 caracteres.")
    private String nome;

    @NotBlank(message = "O email do admin não pode ser vazio.")
    @Email(message = "Formato de email inválido.")
    @Size(max = 100, message = "O email não pode exceder 100 caracteres.")
    private String email;

    // --- NOVO CAMPO PARA DESATIVAR ---
    // Pode ser nulo (se nulo, não altera o status)
    private Boolean ativo; 
}