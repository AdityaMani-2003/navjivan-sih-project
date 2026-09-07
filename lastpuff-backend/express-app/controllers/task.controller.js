import Task from "../models/Task.js";
import User from "../models/User.js";
import Plan from "../models/Plan.js";
import Progress from "../models/Progress.js";

function getTodayUtc() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export const getTasksToday = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const today = getTodayUtc();

    let tasks = await Task.find({ userId, date: today }).sort({ createdAt: 1 }).lean();

    // If no tasks exist for today, generate them from the active plan or standard defaults
    if (!tasks || tasks.length === 0) {
      const user = await User.findById(userId);
      const isSmoker = user?.userType !== "non-smoker";

      const defaultTasks = isSmoker
        ? [
            {
              title: "Morning 4-7-8 Breathing (5 min)",
              description: "Calm the nervous system before your first morning trigger.",
              category: "mindfulness",
              duration: 5,
              xpReward: 25,
            },
            {
              title: "Drink 2 glasses of water",
              description: "Flush cellular toxins and reduce oral craving urges.",
              category: "nutrition",
              duration: 2,
              xpReward: 15,
            },
            {
              title: "Log your cravings in SOS room",
              description: "Track each craving episode to identify personal triggers.",
              category: "cessation",
              duration: 1,
              xpReward: 30,
            },
          ]
        : [
            {
              title: "15-minute Morning Mobility Stretch",
              description: "Awaken major muscle groups and mobilize joints.",
              category: "fitness",
              duration: 15,
              xpReward: 30,
            },
            {
              title: "Log 2.5 Litres of water today",
              description: "Hydrate optimal mitochondrial energy output.",
              category: "nutrition",
              duration: 2,
              xpReward: 20,
            },
            {
              title: "Achieve 5,000 Padyatra Steps",
              description: "Build steady daily cardiovascular volume.",
              category: "padyatra",
              duration: 30,
              xpReward: 35,
            },
          ];

      const inserted = await Task.insertMany(
        defaultTasks.map((t) => ({
          userId,
          date: today,
          title: t.title,
          description: t.description,
          category: t.category,
          duration: t.duration,
          xpReward: t.xpReward,
          status: "pending",
        }))
      );
      tasks = inserted.map((t) => t.toObject());
    }

    res.json({
      success: true,
      data: tasks,
    });
  } catch (err) {
    next(err);
  }
};

export const getTasksWeek = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const tasks = await Task.find({
      userId,
      date: { $gte: sevenDaysAgo },
    })
      .sort({ date: -1 })
      .lean();

    res.json({ success: true, data: tasks });
  } catch (err) {
    next(err);
  }
};

export const completeTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const task = await Task.findOne({ _id: id, userId });
    if (!task) {
      return res.status(404).json({ success: false, error: "Task not found" });
    }

    const wasAlreadyCompleted = task.status === "completed";
    task.status = "completed";
    task.completedAt = new Date();
    await task.save();

    let xpAwarded = 0;
    if (!wasAlreadyCompleted) {
      xpAwarded = task.xpReward || 20;

      // Increment User XP
      await User.findByIdAndUpdate(userId, {
        $inc: { xp: xpAwarded },
      });

      // Update today's Progress document
      const today = getTodayUtc();
      await Progress.findOneAndUpdate(
        { userId, date: today },
        {
          $inc: {
            tasksCompleted: 1,
            xpEarned: xpAwarded,
          },
        },
        { upsert: true }
      );
    }

    res.json({
      success: true,
      data: {
        task,
        xpAwarded,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const skipTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const task = await Task.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { $set: { status: "skipped" } },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ success: false, error: "Task not found" });
    }

    res.json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

export default {
  getTasksToday,
  getTasksWeek,
  completeTask,
  skipTask,
};
