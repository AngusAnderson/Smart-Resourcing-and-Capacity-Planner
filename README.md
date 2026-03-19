# SH09 Project

## Description
**Managers administration calendar app** for Comwrap Reply and their managers to create, manage, and oversee the projects their employees are currently asigned to.  
The app provides an intuitive user interface for managing employees time effectively, tracking their availability and project progress.  
The app is built upon a Django backend and a React frontend, offering a modern, responsive web experience for easy scheduling.

Key features of the app include:
- Manager-focused calendar user interface
- The ability to select either daily, weekly, or monthly calendar views
- Add employees to and fro projects
- Role-based access (e.g. manager exclusively managers have access to the software)
- Authentication and protected views

---

## Getting Started

Follow the steps below to run the application locally.

### Prerequisites
- Python (for Django backend)
- Node.js and npm (for React frontend)
- Git (for cloning the repository)
- A supported database (e.g. SQLite by default)

---

## Installation

### Clone the repository
```
git clone https://stgit.dcs.gla.ac.uk/team-project-h/2025/sh09/sh09-main.git
cd sh09-main
```

***

## Django Backend

### Navigate to backend folder
```
cd backend
```

### Create virtual environment { This is optional, but is recomended }
```
python -m venv venv
```

### Activate virtual environment

#### MacOS/Linux
```
source venv/bin/activate
```

#### Windows
```
venv\Scripts\activate
```

### Install backend dependencies
```
pip install -r requirements.txt
```

### Apply database migrations
```
python manage.py migrate
```

### Start backend server
```
python manage.py runserver
```
### To create an admin account
```
python manage.py createsuperuser
```
Then enter the email and password

#### The backend server will be found at:
http://localhost:8000

### Admin page will be found at:
http://127.0.0.1:8000/admin/comwrap/

***

## React Frontend

Open a new terminal window/tab

### Navigate to frontend folder
```
cd frontend
```

### Install frontend dependencies
```
npm install
```

### Start frontend server
```
npm run dev
```

#### The frontend will be found at:
http://localhost:5173

***
***

## Usage

# Once both servers are running
Open the frontend server @ http://localhost:5173 to launch the website
