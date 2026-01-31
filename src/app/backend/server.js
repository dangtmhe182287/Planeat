require('dotenv').config();

const mongoose = require('mongoose');
const express = require('express');
const app = express();


app.use(express.json());

const authRoutes = require('./routes/auth.routes');
const profileRoutes = require('./routes/profile.routes');
const subscriptionRoutes = require('./routes/subscription.routes');
const preferencesRoutes = require('./routes/preferences.routes');
const mealPlanRoutes = require('./routes/mealPlan.routes');
const ingredientRoutes = require('./routes/ingredient.routes');

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/preferences', preferencesRoutes);
app.use('/api/meal-plan', mealPlanRoutes);
app.use('/api/ingredients', ingredientRoutes);


mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 9999;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});