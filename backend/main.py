from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path
import pandas as pd, numpy as np, joblib

app=FastAPI(title="SmartTransit AI API")
app.add_middleware(CORSMiddleware,allow_origins=["*"],allow_credentials=True,allow_methods=["*"],allow_headers=["*"])
BASE=Path(__file__).parent
df=pd.read_csv(BASE/"data"/"transport_data.csv")
ROUTES={"500A":("Majestic","JP Nagar"),"500D":("Majestic","Electronic City"),"201R":("Shivajinagar","Banashankari"),"401K":("Yeshwanthpur","Kengeri"),"500C":("Hebbal","Silk Board"),"335E":("Shivajinagar","Whitefield"),"500S":("JP Nagar","Silk Institute")}
try:
    eta_model=joblib.load(BASE/"models"/"eta_min_model.pkl")
    delay_model=joblib.load(BASE/"models"/"estimated_delay_min_model.pkl")
except Exception:
    eta_model=delay_model=None
TRAFFIC={"Low":0,"Medium":1,"High":2,"Very High":3}; WEATHER={"Clear":0,"Cloudy":1,"Rain":2,"Heavy Rain":3}

def predict(row,traffic="Medium",weather="Clear"):
    X=pd.DataFrame([{"hour":int(row.hour),"passengers":int(row.passengers),"capacity":int(row.capacity),"traffic_level":traffic,"distance_km":float(row.distance_km),"weather":weather,"previous_delay_min":float(row.previous_delay_min),"current_speed_kmph":float(row.current_speed_kmph)}])
    if eta_model is not None and delay_model is not None:
        eta=float(eta_model.predict(X)[0]); delay=float(delay_model.predict(X)[0])
    else:
        delay=max(0,.75*float(row.previous_delay_min)+4*TRAFFIC.get(traffic,1)+2*WEATHER.get(weather,0))
        eta=float(row.distance_km)/max(float(row.current_speed_kmph),10)*60+delay
    crowd=np.clip(float(row.passengers)/max(float(row.capacity),1)*100+(8 if int(row.hour) in [7,8,9,17,18,19] else 0)+3*TRAFFIC.get(traffic,1),5,120)
    return round(max(1,eta),1),round(float(crowd),1),round(max(0,delay),1)

@app.get("/api/health")
def health(): return {"status":"ok","records":len(df),"ml_models_loaded":eta_model is not None}

@app.get("/api/locations")
def locations(): return sorted(set(x for pair in ROUTES.values() for x in pair))

@app.get("/api/routes")
def routes():
    out=[]
    for rid,(origin,destination) in ROUTES.items():
        g=df[df.route_id==rid]
        if g.empty: continue
        row=g.iloc[-1]; eta,crowd,delay=predict(row,str(row.traffic_level),str(row.weather))
        out.append({"route_id":rid,"origin":origin,"destination":destination,"eta_min":eta,"crowd_pct":crowd,"delay_min":delay})
    return out

class Recommendation(BaseModel):
    origin:str; destination:str; hour:int=8; traffic_level:str="Medium"; weather:str="Clear"

@app.post("/api/recommend")
def recommend(req:Recommendation):
    matches=[(rid,pair) for rid,pair in ROUTES.items() if pair==(req.origin,req.destination)]
    if not matches: return {"found":False,"message":"No direct demo route found for this From → To pair."}
    results=[]
    for rid,(origin,destination) in matches:
        g=df[df.route_id==rid]
        row=g.iloc[(g.hour-int(req.hour)).abs().argsort().iloc[0]]
        eta,crowd,delay=predict(row,req.traffic_level,req.weather)
        results.append({"route_id":rid,"origin":origin,"destination":destination,"eta_min":eta,"crowd_pct":crowd,"delay_min":delay,"score":round(eta+.25*crowd+1.5*delay,2)})
    best=min(results,key=lambda x:x["score"])
    best["recommendation"]="Best Route" if best["crowd_pct"]<65 and best["delay_min"]<8 else "Recommended"
    best["reason"]="Lower predicted crowd and lower expected delay." if best["recommendation"]=="Best Route" else "Best overall balance of ETA, crowd and delay."
    best["found"]=True
    return best

@app.get("/api/analytics")
def analytics():
    return {"total_buses":245,"active_buses":218,"delayed_buses":17,"high_crowd_routes":12,
            "top_routes":[{"route":"500A","demand":95},{"route":"500D","demand":82},{"route":"201R","demand":63},{"route":"401K","demand":41}],
            "ai_alerts":["500A is predicted to exceed 90% capacity during peak hours.","500D has recurring delays under high traffic.","500S connects JP Nagar to Silk Institute in the demo network."]}