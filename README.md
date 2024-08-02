# NYSE demo stock trading app

This is a basic Stock app

## Installation

Assuming you have python 3 and pip already installed, and are using linux or mac, follow these steps from terminal:

1. Clone the Repositry: 
    `git clone https://github.com/albsinger/nyse.git`
    `cd nyse`
1. Create a virtual environment: `python3 -m venv venv`
2. Activate the environment: `source venv/bin/activate`
3. Install dependencies: `pip install -r requirements.txt` 

## Usage

To use this project, run the following commands from terminal:

1. Navigate to the project directory: `cd backend`
2. run `python3 app.py`
3. open `127.0.0.1:5000` in your browser or `localhost:<port> as specified by your terminal

Note that the api key is hard coded and not in an env variable

## Testing

1. press `ctrl c` in the terminal to exit the app
2. run `pytest`