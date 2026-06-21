import json

with open("geojs-23-mun.json", "r", encoding="utf-8") as f:
    geojson = json.load(f)

fortaleza = {
    "type": "FeatureCollection",
    "features": [
        feat
        for feat in geojson["features"]
        if feat["properties"]["id"] == "2304400"
    ]
}

with open("fortaleza.geojson", "w", encoding="utf-8") as f:
    json.dump(fortaleza, f, ensure_ascii=False)

print("Municípios encontrados:", len(fortaleza["features"]))