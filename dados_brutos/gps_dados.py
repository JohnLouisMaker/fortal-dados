import pandas as pd

error_total = 0
total_linhas = 0


for df in pd.read_csv("gps.csv", parse_dates=["date_time"], sep=",", chunksize=10000):
    error_number = (df["direction"] == -2205).sum()
    error_total += error_number



for df in pd.read_csv("gps.csv", parse_dates=["date_time"], sep=",", chunksize=10000):
    total_linhas += len(df)


print(f"Numero de linhas sem erros: {total_linhas - error_total}")
print(f"Linha total: {total_linhas}")
print(f"Erros de linhas:{error_total}")
