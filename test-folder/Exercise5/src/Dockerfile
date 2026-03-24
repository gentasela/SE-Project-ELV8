# Use an official Python runtime as the base image 
FROM python:3.9-slim 
# Set the working directory inside the container 
WORKDIR /app 
# Copy the application code into the container 
COPY . /app
# Install Flask, the only dependency for this application 
RUN pip install flask 
# Expose the port the application will run on 
EXPOSE 8080 
# Command to run the application when the container starts 
CMD ["python", "app.py"] 
