# Combined MERN + Python Setup

This folder now contains the integrated project:

- `frontend` - React app with auth + all `Project-exibhition` pages as routes
- `backend` - Express API for auth, ML proxy, and chat API
- `python-service` - Flask diabetes prediction service

## Frontend routes

- `/login`
- `/signup`
- `/forgot-password`
- `/verify-otp`
- `/reset-password`
- `/app/overview`
- `/app/log`
- `/app/risk`
- `/app/chat`

## Backend routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/google`
- `POST /api/auth/send-otp`
- `POST /api/auth/verify-otp`
- `POST /api/auth/reset-password`
- `POST /api/ml/predict` (forwards to Python service)
- `POST /api/chat/ask`

## Run all parts

1. Start Python API
   - `cd login/python-service`
   - `pip install -r requirements.txt`
   - `python app.py`

2. Start Node backend
   - `cd login/backend`
   - `npm install`
   - `npm run dev`

3. Start React frontend
   - `cd login/frontend`
   - `npm install`
   - `npm start`

## Dataset note

To fully decouple from the legacy folder, copy `Project-exibhition/diabetes.csv` into `login/python-service/diabetes.csv`.
