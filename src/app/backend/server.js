require('dotenv').config();

const mongoose = require('mongoose');
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const app = express();

const cors = require('cors');
app.use(cors());

app.use(express.json());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

const ingredientRoutes = require('./routes/ingredient.routes');
const authRoutes = require('./routes/auth.routes');
const profileRoutes = require('./routes/profile.routes');
const subscriptionRoutes = require('./routes/subscription.routes');
const preferencesRoutes = require('./routes/preferences.routes');
const mealPlanRoutes = require('./routes/mealPlan.routes');
const mealRoutes = require('./routes/meal.routes');

app.use('/api/ingredients', ingredientRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/preferences', preferencesRoutes);
app.use('/api/meal-plan', mealPlanRoutes);
app.use('/api/meal', mealRoutes);

mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 9999;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});