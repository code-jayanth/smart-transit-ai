import pandas as pd,joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from pathlib import Path
base=Path(__file__).parent
df=pd.read_csv(base/"data"/"transport_data.csv")
features=["hour","passengers","capacity","traffic_level","distance_km","weather","previous_delay_min","current_speed_kmph"]
prep=ColumnTransformer([("cat",OneHotEncoder(handle_unknown="ignore"),["traffic_level","weather"])],remainder="passthrough")
for target in ["eta_min","estimated_delay_min"]:
    Xtr,Xte,ytr,yte=train_test_split(df[features],df[target],test_size=.2,random_state=42)
    pipe=Pipeline([("prep",prep),("model",RandomForestRegressor(n_estimators=100,random_state=42,n_jobs=-1))])
    pipe.fit(Xtr,ytr); joblib.dump(pipe,base/"models"/f"{target}_model.pkl")
print(f"Models trained using {len(df)} records.")