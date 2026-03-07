# ✈️ TravelGo — Unified Travel Booking Platform

A full-stack cloud-native travel booking system built with **React + Flask + AWS**.  
Search and book buses, trains, flights, and hotels from a single interface.

---

## 🏗️ Architecture Overview

```
                         ┌─────────────────────────────┐
                         │         NGINX (EC2)         │
                         │  React Build + Reverse Proxy│
                         └────────────┬────────────────┘
                                      │
                     ┌────────────────▼────────────────┐
                     │      Flask API (Gunicorn)        │
                     │  /api/auth  /api/search  /api/book│
                     └──┬─────────────────┬────────────┘
                        │                 │
              ┌─────────▼──────┐  ┌───────▼──────────┐
              │   DynamoDB     │  │    AWS SNS        │
              │  4 Tables      │  │  Notifications    │
              └────────────────┘  └──────────────────┘
```

---

## 📁 Project Structure

```
TravelGo/
├── backend/
│   ├── app.py                    # Flask app factory
│   ├── config.py                 # Environment config
│   ├── requirements.txt
│   ├── setup_tables.py           # DynamoDB setup + seeding
│   ├── .env.example
│   ├── routes/
│   │   ├── auth_routes.py        # POST /register, POST /login, GET /me
│   │   ├── search_routes.py      # GET /search/transport, GET /search/hotels
│   │   └── booking_routes.py     # POST /book, GET /bookings, DELETE /cancel-booking
│   ├── services/
│   │   ├── dynamodb_service.py   # All DynamoDB operations
│   │   └── sns_service.py        # SNS notification publisher
│   └── models/
│       └── auth.py               # JWT helpers + token_required decorator
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── main.jsx
        ├── App.jsx                # React Router setup
        ├── index.css              # Design system / global styles
        ├── services/
        │   ├── api.js             # Axios instance + all API calls
        │   └── AuthContext.jsx    # Global auth state (Context + hooks)
        ├── components/
        │   ├── Navbar.jsx
        │   ├── Footer.jsx
        │   ├── TransportCard.jsx
        │   ├── HotelCard.jsx
        │   └── SeatPicker.jsx     # Interactive bus seat selector
        └── pages/
            ├── Home.jsx           # Landing page with search widget
            ├── Login.jsx
            ├── Register.jsx
            ├── Search.jsx         # Transport + hotel search with filters
            ├── TransportDetail.jsx
            ├── HotelDetail.jsx
            ├── Booking.jsx        # Confirm & pay page → success state
            └── MyBookings.jsx     # View + cancel bookings
```

---

## 🗄️ DynamoDB Schema

### TravelGo_Users
| Attribute    | Type   | Key  |
|-------------|--------|------|
| UserID       | String | PK   |
| Name         | String |      |
| Email        | String |      |
| PasswordHash | String |      |
| CreatedAt    | String |      |

### TravelGo_TransportListings
| Attribute      | Type   | Key  |
|---------------|--------|------|
| TransportID    | String | PK   |
| TransportType  | String |      | ← Bus \| Train \| Flight
| Route          | String |      |
| Date           | String |      |
| Price          | String |      |
| SeatsAvailable | Number |      |
| DepartureTime  | String |      |
| ArrivalTime    | String |      |
| Operator       | String |      |

### TravelGo_Hotels
| Attribute      | Type   | Key  |
|---------------|--------|------|
| HotelID        | String | PK   |
| Name           | String |      |
| Category       | String |      | ← Luxury \| Budget \| Family
| Location       | String |      |
| Price          | String |      |
| RoomsAvailable | Number |      |
| Rating         | String |      |
| Amenities      | String |      |

### TravelGo_Bookings
| Attribute   | Type   | Key  |
|------------|--------|------|
| BookingID   | String | PK   |
| UserID      | String |      |
| ItemType    | String |      | ← Transport \| Hotel
| ItemID      | String |      |
| Seats       | Number |      |
| BookingDate | String |      |
| Status      | String |      | ← Confirmed \| Cancelled
| ...extras   | various|      | ← Route, HotelName, CheckIn, etc.

---

## 🔌 REST API Reference

### Auth (`/api/auth`)
| Method | Endpoint    | Auth | Description        |
|--------|------------|------|--------------------|
| POST   | /register  | No   | Register new user  |
| POST   | /login     | No   | Login, get JWT     |
| GET    | /me        | JWT  | Get current user   |

### Search (`/api`)
| Method | Endpoint                       | Auth | Description             |
|--------|-------------------------------|------|-------------------------|
| GET    | /search/transport              | No   | List/filter transport   |
| GET    | /search/transport/:id          | No   | Single transport item   |
| GET    | /search/hotels                 | No   | List/filter hotels      |
| GET    | /search/hotels/:id             | No   | Single hotel            |

**Transport query params:** `type`, `route`, `date`, `max_price`  
**Hotel query params:** `location`, `category`, `max_price`

### Bookings (`/api`)
| Method | Endpoint                    | Auth | Description          |
|--------|----------------------------|------|----------------------|
| POST   | /book                      | JWT  | Create booking       |
| GET    | /bookings                  | JWT  | List user bookings   |
| GET    | /bookings/:id              | JWT  | Get single booking   |
| DELETE | /cancel-booking/:id        | JWT  | Cancel booking       |

---

## ⚙️ Local Development Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- AWS account with IAM credentials

### 1. Clone the repo
```bash
git clone https://github.com/youruser/travelgo.git
cd TravelGo
```

### 2. Backend setup
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env with your AWS credentials and settings

# Create DynamoDB tables and seed demo data
python setup_tables.py

# Start dev server
python app.py
```

### 3. Frontend setup
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

---

## ☁️ AWS Setup

### DynamoDB
1. Open AWS Console → DynamoDB
2. Tables are created automatically by `setup_tables.py`
3. All tables use PAY_PER_REQUEST billing (no capacity planning needed)

### SNS Notifications
1. Go to AWS Console → SNS → Topics
2. Create two Standard topics:
   - `TravelGo-BookingConfirmed`
   - `TravelGo-BookingCancelled`
3. For each topic, create a subscription (Email, SMS, SQS, Lambda, etc.)
4. Copy the ARNs into your `.env` file

### IAM Permissions
Your IAM user/role needs:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:UpdateItem",
        "dynamodb:DeleteItem", "dynamodb:Scan", "dynamodb:Query",
        "dynamodb:CreateTable", "dynamodb:ListTables", "dynamodb:DescribeTable"
      ],
      "Resource": "arn:aws:dynamodb:*:*:table/TravelGo_*"
    },
    {
      "Effect": "Allow",
      "Action": ["sns:Publish"],
      "Resource": "arn:aws:sns:*:*:TravelGo-*"
    }
  ]
}
```

---

## 🚀 EC2 Deployment

### 1. Launch EC2 instance
- AMI: Ubuntu 22.04 LTS
- Instance type: t2.micro (free tier) or t3.small
- Security group: Allow inbound 22 (SSH), 80 (HTTP), 443 (HTTPS)

### 2. SSH and install dependencies
```bash
ssh -i your-key.pem ubuntu@YOUR_EC2_IP

sudo apt update && sudo apt upgrade -y
sudo apt install -y python3 python3-pip python3-venv nginx nodejs npm git
```

### 3. Deploy backend
```bash
cd /home/ubuntu
git clone https://github.com/youruser/travelgo.git
cd travelgo/backend

python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
nano .env   # Fill in your AWS credentials
```

### 4. Build React frontend
```bash
cd /home/ubuntu/travelgo/frontend
npm install
VITE_API_URL=http://YOUR_EC2_IP/api npm run build
```

### 5. Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/travelgo
```

Paste this config:
```nginx
server {
    listen 80;
    server_name YOUR_EC2_PUBLIC_IP;

    # Serve React build
    root /home/ubuntu/travelgo/frontend/dist;
    index index.html;

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API to Flask/Gunicorn
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/travelgo /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx
```

### 6. Run Flask with Gunicorn
```bash
cd /home/ubuntu/travelgo/backend
source venv/bin/activate
gunicorn --bind 0.0.0.0:5000 --workers 3 app:app
```

### 7. Systemd service (keep it running)
```bash
sudo nano /etc/systemd/system/travelgo.service
```

```ini
[Unit]
Description=TravelGo Flask API
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/travelgo/backend
Environment="PATH=/home/ubuntu/travelgo/backend/venv/bin"
ExecStart=/home/ubuntu/travelgo/backend/venv/bin/gunicorn --bind 0.0.0.0:5000 --workers 3 app:app
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable travelgo
sudo systemctl start travelgo
sudo systemctl status travelgo
```

---

## 📊 CloudWatch Monitoring

Enable basic EC2 monitoring in the AWS Console, then create alarms for:
- **CPU utilization** > 80%
- **StatusCheckFailed** = 1
- **DiskSpaceUtilization** > 85%

For application-level logging, add this to your Gunicorn command:
```bash
gunicorn --bind 0.0.0.0:5000 --workers 3 \
         --access-logfile /var/log/travelgo/access.log \
         --error-logfile /var/log/travelgo/error.log \
         app:app
```

---

## 🔐 Environment Variables Reference

| Variable                 | Description                              | Example                          |
|--------------------------|------------------------------------------|----------------------------------|
| `SECRET_KEY`             | Flask/JWT secret                         | `random-string-here`             |
| `DEBUG`                  | Enable debug mode                        | `False`                          |
| `JWT_EXPIRY_HOURS`       | Token lifetime                           | `24`                             |
| `AWS_REGION`             | AWS region                               | `us-east-1`                      |
| `AWS_ACCESS_KEY_ID`      | IAM access key                           | `AKIA...`                        |
| `AWS_SECRET_ACCESS_KEY`  | IAM secret key                           | `xxxx`                           |
| `USERS_TABLE`            | DynamoDB users table                     | `TravelGo_Users`                 |
| `TRANSPORT_TABLE`        | DynamoDB transport table                 | `TravelGo_TransportListings`     |
| `HOTELS_TABLE`           | DynamoDB hotels table                    | `TravelGo_Hotels`                |
| `BOOKINGS_TABLE`         | DynamoDB bookings table                  | `TravelGo_Bookings`              |
| `SNS_BOOKING_TOPIC_ARN`  | SNS topic for confirmations              | `arn:aws:sns:us-east-1:...`      |
| `SNS_CANCEL_TOPIC_ARN`   | SNS topic for cancellations              | `arn:aws:sns:us-east-1:...`      |
| `CORS_ORIGINS`           | Comma-separated allowed origins          | `http://localhost:5173`          |
| `VITE_API_URL`           | Frontend API base URL (build-time)       | `/api` or `http://EC2-IP/api`    |

---

## 🧰 Tech Stack Summary

| Layer        | Technology          | Purpose                            |
|-------------|--------------------|------------------------------------|
| Frontend     | React 18 + Vite    | UI, routing, state management      |
| Styling      | Custom CSS         | Design system with CSS variables   |
| HTTP client  | Axios              | API requests with JWT interceptor  |
| Backend      | Python Flask 3     | REST API                           |
| Auth         | bcrypt + PyJWT     | Password hashing + JWT tokens      |
| Database     | AWS DynamoDB       | NoSQL document store               |
| Notifications| AWS SNS            | Booking/cancel push notifications  |
| Server       | Gunicorn + Nginx   | Production WSGI + reverse proxy    |
| Deployment   | AWS EC2 (Ubuntu)   | Cloud virtual machine              |
| Monitoring   | AWS CloudWatch     | Metrics, logs, alarms              |

---

## 📝 License

MIT — built for learning, portfolio, and internship demonstrations.
