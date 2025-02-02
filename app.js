import express, { urlencoded } from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
// import withdraw from "../models/withdraw.js"
const app = express()


app.use(cookieParser())



const corsOptions = {
    origin: process.env.FRONTEND_URL, // Your frontend's URL
    methods: ['GET', 'POST', 'PUT'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,  // Allow credentials (cookies, tokens)
  };
  
  app.use(cors(corsOptions));
  

  
  app.use(cors(corsOptions));
  
app.use(express.json({limit:"16kb"}))

app.use(express.urlencoded({
    extended:true,
    limit:"16kb"

}))
app.use(express.static("public"))


app.get('/', (req, res) => {
    res.send('API is running!');
});

let timer = 60; // Timer starts at 60 seconds
let baseTime = Date.now(); // Base time for incremental orders
let orders = []; // Orders array
const getRandomAdSequence = () => {
    const adTypes = ["Single", "Double"];
    const isBig = Math.random() > 0.5;
    const mainAd = isBig ? "Big" : "Small";
    const randomAdType = adTypes[Math.floor(Math.random() * adTypes.length)];
    return [`${mainAd}`, `${randomAdType}`, `${mainAd} ${randomAdType}`];
  };
  
  // Function to create a random order
  const createRandomOrder = (id) => {
    const orderTime = new Date(baseTime).toLocaleTimeString();
    baseTime += 60 * 1000; // Increment base time by 1 minute
    return {
      id,
      orderNumber: Math.floor(Math.random() * 10000000000000),
      amount: Math.floor(Math.random() * (91000 - 92000 + 1)) + 92000,
      adTypes: getRandomAdSequence(),
      time: orderTime,
    };
  };
  
  // Initialize orders (first-time setup)
  const initializeOrders = () => {
    for (let i = 1; i <= 3; i++) {
      orders.push(createRandomOrder(i));
    }
  };
  initializeOrders(); // Initialize orders when the server starts
  
  // Timer logic (runs every second)
  setInterval(() => {
    if (timer === 0) {
      const newOrder = createRandomOrder(orders.length + 1);
      orders.unshift(newOrder); // Add new order at the start
      timer = 60; // Reset timer
    } else {
      timer -= 1; // Decrement timer
    }
  }, 1000);
  
  // API Route: Get current timer and orders
  app.get("/api/status", (req, res) => {
    res.json({
      timer,
      orders,
    });
  });
  let startTime = Math.floor(Date.now() / 1000);

  app.get("/timer", (req, res) => {
    const currentTime = Math.floor(Date.now() / 1000);
    const elapsedTime = currentTime - startTime;
    let remainingTime = 60 - elapsedTime;
  
    if (remainingTime <= 0) {
      startTime = Math.floor(Date.now() / 1000); // Timer reset karega
      remainingTime = 60;
    }
  
    res.json({ remainingTime });
  });
  
  app.post("/reset-timer", (req, res) => {
    startTime = Math.floor(Date.now() / 1000);
    res.json({ message: "Timer reset", startTime });
  });
  
import userroutes from './routes/user.routes.js'
app.use("/api/auth",userroutes)
export {app}
