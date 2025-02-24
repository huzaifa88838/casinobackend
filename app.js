import express, { urlencoded } from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import axios from 'axios'
// import withdraw from "../models/withdraw.js"
const app = express()


app.use(cookieParser())


const corsOptions = {
  // origin: ["https://nonalexch.com", "https://www.nonalexch.com"], // Multiple allowed origins
  origin:["http://localhost:5173"],
  methods: ['GET', 'POST', 'PUT','DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,  
};

app.use(cors(corsOptions));

  
  // app.use(cors(corsOptions));
  
app.use(express.json({limit:"16kb"}))

app.use(express.urlencoded({
    extended:true,
    limit:"16kb"

}))
app.use(express.static("public"))


app.get('/', (req, res) => {
    res.send('API is running!');
});
const sessionToken = "6HAbTQkNKKtU9ljH5fxbZrbmeGjBJ4UnV1R0Zny4Nsk=";
const applicationKey = '8sCvSYcz';
// Define a route to proxy Betfair API requests
app.get('/api/betfair', async (req, res) => {
  try {
    const response = await axios.get('https://api.betfair.com/exchange/betting/rest/v1.0/listEventTypes/ ', {
      headers: {
        'X-Application': applicationKey, // Ensure your Application Key is correct
        'X-Authentication': sessionToken, // Ensure your Session Token is valid
        'Content-Type': 'application/json',
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching data from Betfair:', error.message);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response headers:', error.response.headers);
    }
    res.status(500).json({ error: 'Failed to fetch data from Betfair', message: error.message });
  }
});


import userroutes from './routes/user.routes.js'
app.use("/api/auth",userroutes)
export {app}






