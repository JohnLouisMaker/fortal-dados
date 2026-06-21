import pandas as pd

# df_header = pd.read_csv("gps.csv", sep=",", parse_dates=["date_time"], nrows=1)
# df_header.iloc[0:0].to_csv("gps_correct.csv", mode="w", index=False)
# df_header.iloc[0:0].to_csv("gps_erros.csv", mode="w", index=False)


# for df in pd.read_csv("gps.csv", parse_dates=["date_time"], sep=",", chunksize=10000):
#     linhas_corretas = df[df["direction"] >= 0]
#     linhas_erradas = df[df["direction"] < 0]

#     linhas_corretas.to_csv("gps_correct.csv", mode="a", index=False, header=False)
#     linhas_erradas.to_csv("gps_erros.csv", mode="a", index=False, header=False)

acumulado_mapa_calor = {}
acumulado_onibus = {}

for df in pd.read_csv(
    "gps_correct.csv", parse_dates=["date_time"], sep=",", chunksize=10000
):
    onibus_lentos = df[df["speed"] < 10].copy()
    onibus_lentos["lat_arredondada"] = onibus_lentos["lat"].round(4)
    onibus_lentos["lng_arredondada"] = onibus_lentos["lng"].round(4)

    contagem_coordenadas_bloco = onibus_lentos.value_counts(
        ["lat_arredondada", "lng_arredondada"]
    )

    for (latitude, longitude), quantidade in contagem_coordenadas_bloco.items():
        par_coordenadas = (latitude, longitude)

        acumulado_mapa_calor[par_coordenadas] = (
            acumulado_mapa_calor.get(par_coordenadas, 0) + quantidade
        )

    bloco_agrupado_por_onibus = df.groupby("bus_id")

    soma_velocidades_bloco = bloco_agrupado_por_onibus["speed"].sum()
    total_registros_bloco = bloco_agrupado_por_onibus["speed"].count()

    onibus_parados_bloco = df[df["speed"] < 5].groupby("bus_id")["speed"].count()

    for bus_id in total_registros_bloco.index:
        soma_velocidade_atual = soma_velocidades_bloco[bus_id]
        total_linhas_atual = total_registros_bloco[bus_id]
        total_parado_atual = onibus_parados_bloco.get(bus_id, 0)

        if bus_id in acumulado_onibus:
            acumulado_onibus[bus_id][0] += soma_velocidade_atual
            acumulado_onibus[bus_id][1] += total_linhas_atual
            acumulado_onibus[bus_id][2] += total_parado_atual
        else:
            acumulado_onibus[bus_id] = [
                soma_velocidade_atual,
                total_linhas_atual,
                total_parado_atual,
            ]

print("Loop concluído! Gerando os arquivos finais...")

exportar_heatmap = [
    {"lat": latitude, "lng": longitude, "quantidade_lentidao": quantidade}
    for (latitude, longitude), quantidade in acumulado_mapa_calor.items()
]
df_final_heatmap = pd.DataFrame(exportar_heatmap)
df_final_heatmap.to_csv("resultado_heatmap.csv", index=False)

exportar_resumo_onibus = []

for bus_id, dados_acumulados in acumulado_onibus.items():
    soma_total_velocidade = dados_acumulados[0]
    total_geral_linhas = dados_acumulados[1]
    total_geral_parado = dados_acumulados[2]

    velocidade_media = soma_total_velocidade / total_geral_linhas
    porcentagem_tempo_parado = (total_geral_parado / total_geral_linhas) * 100

    exportar_resumo_onibus.append(
        {
            "bus_id": bus_id,
            "velocidade_media": round(velocidade_media, 2),
            "porcentagem_parado": round(porcentagem_tempo_parado, 2),
        }
    )

df_final_onibus = pd.DataFrame(exportar_resumo_onibus)
df_final_onibus.to_csv("resultado_onibus.csv", index=False)
