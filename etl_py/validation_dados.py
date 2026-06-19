import pandas as pd

ja_lido = True

for df in pd.read_csv(
    "validation.csv", parse_dates=["date_time"], sep=",", chunksize=10000
):
    df["hora"] = df["date_time"].dt.hour
    resumo = df.groupby(["busline_id", "hora"]).size().reset_index(name="validacoes")

    if ja_lido:
        resumo.to_csv("validacao_agrupada.csv", mode="w", index=False)
        ja_lido = False
    else:
        resumo.to_csv("validacao_agrupada.csv", mode="a", header=False, index=False)

resumo_correto_lido = pd.read_csv("validacao_agrupada.csv")

resumo_correto = (
    resumo_correto_lido.groupby(["busline_id", "hora"])["validacoes"]
    .sum()
    .reset_index()
)
resumo_correto.to_csv("validacao_agrupada.csv", index=False)
