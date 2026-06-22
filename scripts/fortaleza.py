import geopandas as gpd
import pandas as pd
from shapely.geometry import Point
from shapely.validation import make_valid

bairros_gdf = gpd.read_file("fortaleza.geojson", on_invalid="ignore")
bairros_gdf['geometry'] = bairros_gdf['geometry'].apply(lambda geom: make_valid(geom) if geom is not None else None)
bairros_gdf = bairros_gdf.to_crs(epsg=4326)
bairros_gdf = bairros_gdf[bairros_gdf.is_valid & ~bairros_gdf.is_empty]


df_heatmap = pd.read_csv("resultado_heatmap.csv") 


geometry = [Point(xy) for xy in zip(df_heatmap['lng'], df_heatmap['lat'])]
onibus_gdf = gpd.GeoDataFrame(df_heatmap, geometry=geometry, crs="EPSG:4326")

resultado_gdf = gpd.sjoin(onibus_gdf, bairros_gdf, how="left", predicate="within")

resultado_gdf = resultado_gdf.rename(columns={"name": "bairro"})

df_bairros_consolidado = (
    resultado_gdf.groupby("bairro")["quantidade_lentidao"]
    .sum()
    .reset_index()
)

df_bairros_consolidado = df_bairros_consolidado.dropna(subset=["bairro"])
df_bairros_consolidado.to_csv("resultado_por_bairros.csv", index=False)

print("\nResultado:")
print(df_bairros_consolidado.head())