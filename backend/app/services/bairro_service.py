import re

from rapidfuzz import fuzz, process

# Expressões de conversação cotidiana que NÃO devem ser interpretadas como entidades geográficas
EXPRESSOES_SOCIAIS = {
    # Saudações
    "bom dia", "boa tarde", "boa noite", "olá", "oi", "oie", "ooi",
    # Agradecimentos
    "obrigado", "obrigada", "valeu", "brigado", "brigada", "muito obrigado", "muito obrigada",
    # Despedidas
    "até logo", "tchau", "adeus", "até mais", "falou", "flw",
    # Afirmações/negações simples
    "sim", "não", "nao", "ok", "okay", "blz", "beleza",
    # Conversação
    "tudo bem", "tudo bom", "como vai", "que isso", "nada",
    "entendi", "entendo", "certo", "perfeito", "maravilha", "legal",
}


def _is_expressao_social(texto: str) -> bool:
    """Retorna True se o texto for apenas uma expressão social (saudação, agradecimento, etc.)."""
    texto = texto.lower().strip()
    # Remove pontuação para comparar
    texto_limpo = re.sub(r"[^\w\s]", "", texto).strip()
    return texto_limpo in EXPRESSOES_SOCIAIS


BAIRROS_OFICIAIS = [
    "Aerolândia",
    "Aeroporto",
    "Aldeota",
    "Alto da Balança",
    "Amadeu Furtado",
    "Ancuri",
    "Antônio Bezerra",
    "Aracapé",
    "Autran Nunes",
    "Barra do Ceará",
    "Barroso",
    "Bela Vista",
    "Benfica",
    "Boa Vista/Castelão",
    "Bom Futuro",
    "Bom Jardim",
    "Bonsucesso",
    "Cais do Porto",
    "Cajazeiras",
    "Cambeba",
    "Canindezinho",
    "Carlito Pamplona",
    "Centro",
    "Cidade 2000",
    "Cidade dos Funcionários",
    "Coaçu",
    "Cocó",
    "Conjunto Ceará I",
    "Conjunto Ceará II",
    "Conjunto Esperança",
    "Conjunto Palmeiras",
    "Couto Fernandes",
    "Cristo Redentor",
    "Curió",
    "Damas",
    "De Lourdes",
    "Demócrito Rocha",
    "Dias Macêdo",
    "Dionísio Torres",
    "Dom Lustosa",
    "Edson Queiroz",
    "Ellery",
    "Engenheiro Luciano Cavalcante",
    "Farias Brito",
    "Floresta",
    "Fátima",
    "Genibaú",
    "Granja Lisboa",
    "Granja Portugal",
    "Guajeru",
    "Guararapes",
    "Henrique Jorge",
    "Itaoca",
    "Itaperi",
    "Jacarecanga",
    "Jangurussu",
    "Jardim América",
    "Jardim Cearense",
    "Jardim Guanabara",
    "Jardim Iracema",
    "Jardim das Oliveiras",
    "Joaquim Távora",
    "José Bonifácio",
    "José de Alencar",
    "João XXIII",
    "Jóquei Clube",
    "Lagoa Redonda",
    "Manoel Sátiro",
    "Manuel Dias Branco",
    "Maraponga",
    "Meireles",
    "Messejana",
    "Mondubim",
    "Monte Castelo",
    "Montese",
    "Moura Brasil",
    "Mucuripe",
    "Novo Mondubim",
    "Olavo Oliveira",
    "Padre Andrade",
    "Panamericano",
    "Papicu",
    "Parangaba",
    "Parque Araxá",
    "Parque Dois Irmãos",
    "Parque Iracema",
    "Parque Manibura",
    "Parque Presidente Vargas",
    "Parque Santa Maria",
    "Parque Santa Rosa",
    "Parque São José",
    "Parquelândia",
    "Parreão",
    "Passaré",
    "Paupina",
    "Pedras",
    "Pici",
    "Pirambu",
    "Planalto Ayrton Senna",
    "Praia de Iracema",
    "Praia do Futuro I",
    "Praia do Futuro II",
    "Prefeito José Walter",
    "Presidente Kennedy",
    "Quintino Cunha",
    "Rachel de Queiroz",
    "Rodolfo Teófilo",
    "Sabiaguaba",
    "Salinas",
    "Sapiranga / Coité",
    "Serrinha",
    "Siqueira",
    "São Bento",
    "São Gerardo",
    "São João do Tauape",
    "Varjota",
    "Vicente Pinzón",
    "Vila Peri",
    "Vila União",
    "Vila Velha",
    "Álvaro Weyne",
]


def buscar_bairro(request: str) -> str | None:
    if not request:
        return None

    # Se a mensagem for apenas uma expressão social (saudação, agradecimento, etc.),
    # não deve ser interpretada como entidade geográfica
    if _is_expressao_social(request):
        return None

    result = process.extractOne(request, BAIRROS_OFICIAIS, scorer=fuzz.WRatio)

    if result:
        bairro, score, index = result

        if score >= 80:
            return bairro
        return None
