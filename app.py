import os
from flask import Flask, render_template, send_from_directory

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = Flask(
    __name__,
    template_folder=os.path.join(BASE_DIR, 'templates')
)

@app.route("/")
def index():
    return render_template("index.html")

# Serve arquivos estáticos (CSS/JS) diretamente da raiz
@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(BASE_DIR, path)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
p.run(debug=True, port=5000)
