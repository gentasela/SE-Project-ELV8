const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5001;
const DATA_FILE = path.join(__dirname, 'data.json');

// Extremely robust CORS configuration allowing everything for Demo
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// 1. Connectivity Test Route
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is fully operational on port 5001' });
});

// Health Check Route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Ensure data file exists securely
try {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ progress: [], users: [] }));
  } else {
    // Migrate existing DB to have users if missing
    const data = JSON.parse(fs.readFileSync(DATA_FILE));
    if (!data.users) {
      data.users = [];
      fs.writeFileSync(DATA_FILE, JSON.stringify(data));
    }
  }
} catch (err) {
  console.error("Failed to initialize database file:", err);
}

// 2. Authentication API (Mock Base64 Gateway)
app.post('/api/auth/signup', (req, res) => {
  try {
    const { email, password } = req.body;
    const data = JSON.parse(fs.readFileSync(DATA_FILE));
    if (data.users.find(u => u.email === email)) {
      return res.status(400).json({ error: "Email already registered" });
    }
    const token = Buffer.from(email).toString('base64');
    data.users.push({ email, password, token });
    fs.writeFileSync(DATA_FILE, JSON.stringify(data));
    res.status(200).json({ message: 'Signed up successfully', token });
  } catch (err) {
    res.status(500).json({ error: "Signup process failed" });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    const data = JSON.parse(fs.readFileSync(DATA_FILE));
    const user = data.users.find(u => u.email === email && u.password === password);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    res.status(200).json({ message: 'Logged in successfully', token: user.token });
  } catch (err) {
    res.status(500).json({ error: "Login Failed" });
  }
});

const mockWorkouts = [
  { day: 'Monday', type: 'Full Body HIIT', duration: '30 min', exercises: ['Burpees x20', 'Squats x30', 'Pushups x15', 'Plank 60s'] },
  { day: 'Wednesday', type: 'Core & Cardio', duration: '25 min', exercises: ['Mountain Climbers x40', 'Crunches x30', 'Jumping Jacks x50'] },
  { day: 'Friday', type: 'Strength & Stretch', duration: '40 min', exercises: ['Lunges x30', 'Dumbbell Rows x20', 'Yoga Flow 15 min'] }
];

const mockMeals = [
  { meal: 'Breakfast', calories: 400, description: 'Oatmeal with berries and a scoop of protein powder' },
  { meal: 'Lunch', calories: 600, description: 'Grilled chicken breast, quinoa, and steamed broccoli' },
  { meal: 'Dinner', calories: 500, description: 'Baked salmon, sweet potato, and asparagus' }
];

// 3. Dynamic Plan Generator Engine (18 Variations)
app.post('/api/generate-plan', (req, res) => {
  try {
    const { discipline, experienceLevel, formData } = req.body;
    
    // TDEE mock logic
    let targetCalories = 2000;
    if (formData?.goal === 'lose weight') targetCalories -= 400;
    if (formData?.goal === 'gain muscle') targetCalories += 400;

    // 18-Path Combination Mapping
    const baseIntensity = experienceLevel === 'Beginner' ? 8 : experienceLevel === 'Intermediate' ? 12 : 20;

    const frameworks = {
      'Yoga': ['Sun Salutations', 'Warrior Sequences', 'Deep Stretching'],
      'Pilates': ['The Hundred', 'Roll-ups', 'Leg Circles'],
      'Bodyweight Training': ['Pushups', 'Squats', 'Pullups'],
      'Home Exercises (No Equipment)': ['Jumping Jacks', 'Burpees', 'Lunges'],
      'Beginner Strength Training': ['Dumbbell Press', 'Goblet Squats', 'Deadlifts'],
      'Fat-Loss Programs': ['HIIT Sprints', 'Kettlebell Swings', 'Mountain Climbers']
    };

    const exList = frameworks[discipline] || frameworks['Home Exercises (No Equipment)'];
    
    const workouts = [
      { day: 'Monday', type: `${experienceLevel} ${discipline} Protocol`, duration: `${baseIntensity * 2.5} min`, exercises: [`${exList[0]} x${baseIntensity}`, `${exList[1]} x${baseIntensity}`, 'Cooldown flow'] },
      { day: 'Wednesday', type: `Core & Stability Integration`, duration: `${baseIntensity * 2} min`, exercises: [`${exList[2]} x${baseIntensity}`, 'Plank Holds', 'Active Recovery'] },
      { day: 'Friday', type: `Peak ${discipline} Performance`, duration: `${baseIntensity * 3} min`, exercises: [`${exList[0]} x${baseIntensity + 5}`, `${exList[1]} x${baseIntensity + 5}`, `${exList[2]} x${baseIntensity + 5}`] }
    ];

    const macros = [
      { name: 'Protein', value: Math.round(targetCalories * 0.3) / 4 }, // 30%
      { name: 'Carbs', value: Math.round(targetCalories * 0.4) / 4 },   // 40%
      { name: 'Fats', value: Math.round(targetCalories * 0.3) / 9 }     // 30%
    ];

    res.status(200).json({
      message: 'Dynamic 18-Path Blueprint Generated',
      dailyCaloriesTarget: targetCalories,
      workouts,
      macros,
      meals: mockMeals
    });
  } catch (err) {
    console.error("Error generating plan:", err);
    res.status(500).json({ error: "Internal Server Error during Plan Generation" });
  }
});

// 3. Progress Tracking Routes
app.get('/api/progress', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE));
    res.status(200).json(data.progress);
  } catch (err) {
    console.error("Error reading progress:", err);
    res.status(500).json({ error: "Failed to read progress history" });
  }
});

app.post('/api/progress', (req, res) => {
  try {
    const { weight, date } = req.body;
    const data = JSON.parse(fs.readFileSync(DATA_FILE));
    
    data.progress.push({
      weight, 
      date: date || new Date().toLocaleDateString()
    });
    
    fs.writeFileSync(DATA_FILE, JSON.stringify(data));
    res.status(200).json({ message: 'Progress saved successfully!', progress: data.progress });
  } catch (err) {
    console.error("Error saving progress:", err);
    res.status(500).json({ error: "Failed to save progress entry" });
  }
});

// Robust Startup Error Handling
app.listen(5001, '0.0.0.0', () => {
  console.log('🚀 ELV8 Backend Live on port 5001');
});
