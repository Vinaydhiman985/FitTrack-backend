import Steps from '../models/steps.model.js';
import User from '../models/user.model.js';

const XP_PER_LEVEL = 5000;

export const logSteps = async (req, res) => {
  try {
    const { steps } = req.body;
    const userId = req.user._id;
    if (!steps || steps < 0) {
      return res.status(400).json({ error: 'Valid steps count is required' });
    }
    const today = new Date().toISOString().split('T')[0];
    const coins = Math.floor(steps / 100);
    const xp = Math.floor(steps / 50);
    const distance = parseFloat((steps * 0.000762).toFixed(2));
    const calories = parseFloat((steps * 0.04).toFixed(2));
    let stepsLog = await Steps.findOne({ userId, date: today });
    const previousSteps = stepsLog?.steps || 0;
    const previousCoins = stepsLog?.coins || 0;
    const previousXp = stepsLog?.xp || 0;
    const stepsDelta = Math.max(0, steps - previousSteps);
    const coinsDelta = Math.max(0, coins - previousCoins);
    const xpDelta = Math.max(0, xp - previousXp);

    if (stepsLog) {
      stepsLog.steps = steps;
      stepsLog.distance = distance;
      stepsLog.calories = calories;
      stepsLog.coins = coins;
      stepsLog.xp = xp;
      await stepsLog.save();
    } else {
      stepsLog = await Steps.create({ userId, steps, distance, calories, coins, xp, date: today });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.totalSteps += stepsDelta;
    user.coins += coinsDelta;
    user.xp += xpDelta;

    while (user.xp >= XP_PER_LEVEL) {
      user.xp -= XP_PER_LEVEL;
      user.level += 1;
    }

    await user.save();

    res.status(200).json({ message: 'Steps logged!', data: { steps, distance, calories, coins, xp, date: today } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getTodaySteps = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const stepsLog = await Steps.findOne({ userId: req.user._id, date: today });
    res.status(200).json({ data: stepsLog || { steps: 0, distance: 0, calories: 0, coins: 0, xp: 0, date: today } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getStepsHistory = async (req, res) => {
  try {
    const history = await Steps.find({ userId: req.user._id }).sort({ date: -1 }).limit(7);
    res.status(200).json({ data: history });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
