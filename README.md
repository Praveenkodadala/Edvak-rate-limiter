# Edvak Rate Limiter

A scalable rate-limiting solution implemented in a Node.js application that controls the number of requests a user or IP address can make within a specified time frame.

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Praveenkodadala/Edvak-rate-limiter.git
   cd Edvak-rate-limiter


2 **Install the dependencies:**

   npm install


## Usage

   npm run dev

   Note: Node.js clusters for better load distribution.


##  Load Testing

Open another terminal and run:

npx loadtest http://localhost:3000 -n 1000 -c 10


## Configuration

Check the .env file for:
RATE_LIMIT: Maximum requests allowed per IP
WINDOW_TIME: Time window in milliseconds


## Status Codes

Monitor both terminals for response codes:
200 OK for successful requests
429 Too Many Requests when limits are exceeded for user or IP 

![Status Codes Screenshot](images/statusCodes.png)


** The server remains stable under heavy load, ensuring no crashes even with thousands of requests.**
  