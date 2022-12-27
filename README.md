# itudict-backend

Build Docker image with:
	docker build -t itudict-backend:0.2 . 

Run Docker image with:
	docker run --env-file ../credentials.env -p 8080:4000 itudict-backend:0.2

Backend development repository for ITU Dictionary project by Group 2 - BLG411E Fall 22

