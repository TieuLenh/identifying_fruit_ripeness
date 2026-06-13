from flask import Flask
from flask import request
from flask import jsonify
from flask import render_template

from PIL import Image

from predictor import predict_image

app = Flask(
    __name__,
    template_folder="template",
    static_folder="static"
)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/predict", methods=["POST"])
def predict():

    if "image" not in request.files:

        return jsonify({
            "error": "No image"
        }), 400

    file = request.files["image"]

    image = Image.open(
        file.stream
    ).convert("RGB")

    result = predict_image(image)
    print("Prediction result: ", result)
    return jsonify(result)


if __name__ == "__main__":

    app.run(
        debug=True,
        host="0.0.0.0",
        port=5000
    )