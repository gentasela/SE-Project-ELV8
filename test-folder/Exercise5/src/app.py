from flask import Flask
app = Flask(__name__)
@app.route('/')
def home():
 return "Hello, Cloud!"
if __name__ == "__main__":
  app.run(host='0.0.0.0', port=8080)
  @app.route('/about') 
  def about(): 
    return "This is a sample Flask application!"
  @app.route('/greet/<name>') 
  def greet(name): 
    return f"Hello, {name}!"
  @app.route('/html') 
  def html(): 
    return ''' 
    <html> <head><title>Sample Flask App</title></head> 
    <body style="background-color: powderblue;"> 
    <h1>Welcome to Flask!</h1> 
    <p>This is a simple web app.</p> 
    </body> 
    </html> 
    ''' 
