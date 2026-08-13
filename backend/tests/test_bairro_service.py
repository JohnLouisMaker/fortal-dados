"""Testes para o serviço de bairros — entidades geográficas vs. expressões sociais."""

import sys
from pathlib import Path

# Adiciona o diretório backend ao path para importar os módulos do projeto
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.services.bairro_service import (
    EXPRESSOES_SOCIAIS,
    _is_expressao_social,
    buscar_bairro,
)


def test_is_expressao_social_saudacoes():
    """Saudações devem ser reconhecidas como expressões sociais."""
    assert _is_expressao_social("Bom dia")
    assert _is_expressao_social("Boa tarde")
    assert _is_expressao_social("Boa noite")
    assert _is_expressao_social("Olá")
    assert _is_expressao_social("oi")
    assert _is_expressao_social("BOM DIA")
    assert _is_expressao_social("boa tarde!")
    assert _is_expressao_social("Bom dia!!!")


def test_is_expressao_social_agradecimentos():
    """Agradecimentos devem ser reconhecidos como expressões sociais."""
    assert _is_expressao_social("Obrigado")
    assert _is_expressao_social("obrigada")
    assert _is_expressao_social("Valeu")
    assert _is_expressao_social("muito obrigado")


def test_is_expressao_social_despedidas():
    """Despedidas devem ser reconhecidas como expressões sociais."""
    assert _is_expressao_social("Até logo")
    assert _is_expressao_social("Tchau")
    assert _is_expressao_social("Até mais")
    assert _is_expressao_social("adeus")


def test_is_expressao_social_conversacao():
    """Expressões comuns de conversação devem ser reconhecidas."""
    assert _is_expressao_social("Tudo bem")
    assert _is_expressao_social("ok")
    assert _is_expressao_social("Sim")
    assert _is_expressao_social("Não")
    assert _is_expressao_social("Entendi")


def test_is_expressao_social_falso_para_textos_geograficos():
    """Textos com conteúdo geográfico NÃO devem ser reconhecidos como expressão social."""
    assert not _is_expressao_social("Centro")
    assert not _is_expressao_social("Aldeota")
    assert not _is_expressao_social("Boa Vista/Castelão")
    assert not _is_expressao_social("Bom Jardim")
    assert not _is_expressao_social("Como estão os ônibus no Centro?")
    assert not _is_expressao_social("Bom dia, como está o trânsito?")


# --- Testes de integração: buscar_bairro ---


def test_buscar_bairro_saudacao_bom_dia_retorna_none():
    """'Bom dia' NÃO deve retornar nenhum bairro."""
    assert buscar_bairro("Bom dia") is None
    assert buscar_bairro("bom dia") is None
    assert buscar_bairro("Bom dia!") is None


def test_buscar_bairro_saudacao_boa_tarde_retorna_none():
    """'Boa tarde' NÃO deve retornar nenhum bairro."""
    assert buscar_bairro("Boa tarde") is None
    assert buscar_bairro("boa tarde!") is None


def test_buscar_bairro_saudacao_boa_noite_retorna_none():
    """'Boa noite' NÃO deve retornar nenhum bairro."""
    assert buscar_bairro("Boa noite") is None
    assert buscar_bairro("boa noite") is None


def test_buscar_bairro_ola_retorna_none():
    """'Olá' NÃO deve retornar nenhum bairro."""
    assert buscar_bairro("Olá") is None
    assert buscar_bairro("olá") is None


def test_buscar_bairro_obrigado_retorna_none():
    """'Obrigado' NÃO deve retornar nenhum bairro."""
    assert buscar_bairro("Obrigado") is None
    assert buscar_bairro("obrigada") is None


def test_buscar_bairro_ate_logo_retorna_none():
    """'Até logo' NÃO deve retornar nenhum bairro."""
    assert buscar_bairro("Até logo") is None
    assert buscar_bairro("até logo") is None


def test_buscar_bairro_referencia_geografica_explicita_continua_funcionando():
    """Mensagens com referência geográfica explícita ainda devem detectar o bairro."""
    resultado = buscar_bairro("Centro")
    assert resultado is not None, "'Centro' deveria detectar o bairro Centro"
    assert resultado.lower() == "centro"


def test_buscar_bairro_aldeota_em_frase():
    """'Aldeota' em uma frase deve ser detectado corretamente."""
    resultado = buscar_bairro("Quero saber sobre a Aldeota")
    assert resultado is not None
    assert "aldeota" in resultado.lower()


def test_buscar_bairro_benfica_em_frase():
    """'Benfica' em uma frase deve ser detectado corretamente."""
    resultado = buscar_bairro("informações sobre o Benfica")
    assert resultado is not None
    assert "benfica" in resultado.lower()


def test_buscar_bairro_aldeota_direto():
    """'Aldeota' sozinho deve ser detectado."""
    resultado = buscar_bairro("Aldeota")
    assert resultado is not None
    assert resultado.lower() == "aldeota"


def test_buscar_bairro_mensagem_vazia_retorna_none():
    """Mensagem vazia deve retornar None."""
    assert buscar_bairro("") is None
    assert buscar_bairro("   ") is None


# --- Teste de completude do conjunto ---


def test_todas_as_expressoes_do_enunciado_estao_no_conjunto():
    """Todas as expressões mencionadas no enunciado do bug devem estar cobertas."""
    for expr in ["bom dia", "boa tarde", "boa noite", "olá", "obrigado", "até logo"]:
        assert expr in EXPRESSOES_SOCIAIS, f"{expr!r} deveria estar em EXPRESSOES_SOCIAIS"


if __name__ == "__main__":
    # Executa todos os testes inline para validação rápida
    import inspect
    erros = 0
    for nome, fn in sorted(globals().items()):
        if nome.startswith("test_"):
            try:
                fn()
                print(f"  ✓ {nome}")
            except AssertionError as e:
                erros += 1
                print(f"  ✗ {nome}: {e}")
    print(f"\n{erros} falha(s) de {sum(1 for k in globals() if k.startswith('test_'))} teste(s)")
    sys.exit(erros)