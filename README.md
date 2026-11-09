# SmartTransit AI — From/To Edition
Choose **From → To → Travel Hour → Find Best Route**.
The demo includes **JP Nagar → Silk Institute (Route 500S)**.

## Backend
```powershell
cd backend
python -m pip install -r requirements.txt
python train_model.py
python -m uvicorn main:app --reload --port 8000
```

## Frontend (second terminal)
```powershell
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173`.

Dataset: 6,800 synthetic records. It is demo data, not live BMTC operational data.

## Refreshed UI
The frontend uses a dark smart-mobility dashboard with From → To planning, AI recommendation output, route cards, and authority analytics.
