import pandas as pd

df = pd.read_csv("validation.csv", parse_dates=["date_time"], sep=",", nrows=10000)
df["hora"] = df["date_time"].dt.hour

resumo = df.groupby(["busline_id", "hora"]).size().reset_index(name="validacoes")

resumo.to_csv("validacao_agrupada.csv", index=False)