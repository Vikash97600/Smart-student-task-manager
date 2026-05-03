import User from '../models/User.js';
import Task from '../models/Task.js';
import PDFDocument from 'pdfkit';

// Helper: Get start of today
const getToday = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

// Helper: Get start of tomorrow
const getTomorrow = () => {
  const today = getToday();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow;
};

// Helper: Get start of week ago
const getWeekAgo = () => {
  const today = getToday();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  return weekAgo;
};

// Generate progress report PDF
export const generateReport = async (req, res, next) => {
  let doc;
  try {
    const userId = req.user._id;
    const today = getToday();
    const tomorrow = getTomorrow();
    const weekAgo = getWeekAgo();

    // Fetch user
    const user = await User.findById(userId).select('-password');
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Fetch stats
    const tasksCompletedToday = await Task.countDocuments({
      createdBy: userId,
      status: 'Completed',
      isDeleted: false,
      updatedAt: { $gte: today },
    });

    const pendingTasks = await Task.countDocuments({
      createdBy: userId,
      status: 'Pending',
      isDeleted: false,
    });

    const upcomingDeadlines = await Task.countDocuments({
      createdBy: userId,
      status: 'Pending',
      isDeleted: false,
      dueDate: { $gte: today, $lt: tomorrow },
    });

    const totalWeeklyTasks = await Task.countDocuments({
      createdBy: userId,
      isDeleted: false,
      createdAt: { $gte: weekAgo },
    });

    const completedWeeklyTasks = await Task.countDocuments({
      createdBy: userId,
      status: 'Completed',
      isDeleted: false,
      createdAt: { $gte: weekAgo },
    });

    const weeklyProgress = totalWeeklyTasks > 0
      ? Math.round((completedWeeklyTasks / totalWeeklyTasks) * 100)
      : 0;

    // Fetch upcoming tasks for detail
    const upcomingTasks = await Task.find({
      createdBy: userId,
      status: 'Pending',
      isDeleted: false,
      dueDate: { $gte: today, $lt: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000) },
    })
      .sort({ dueDate: 1 })
      .limit(10)
      .select('title subject dueDate priority');

    // Fetch recent completed tasks
    const recentCompleted = await Task.find({
      createdBy: userId,
      status: 'Completed',
      isDeleted: false,
      updatedAt: { $gte: weekAgo },
    })
      .sort({ updatedAt: -1 })
      .limit(5)
      .select('title subject updatedAt');

    // Generate PDF
    doc = new PDFDocument({ margin: 50, size: 'A4' });

    // Set response headers for download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="progress-report-${Date.now()}.pdf"`);

    // Pipe PDF to response
    doc.pipe(res);

    // Helper: Define colors
    const primaryColor = '#2563eb';
    const secondaryColor = '#1e40af';
    const textColor = '#1f2937';
    const lightGray = '#f3f4f6';
    const borderColor = '#e5e7eb';

    // === HEADER ===
    doc
      .rect(0, 0, doc.page.width, 120)
      .fill(primaryColor);

    doc
      .fontSize(24)
      .fillColor('white')
      .text('Progress Report', 50, 50);

    doc
      .fontSize(12)
      .fillColor('rgba(255,255,255,0.9)')
      .text(`Generated on ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, 50, 85);

    doc
      .rect(400, 30, 150, 60)
      .fill('white')
      .strokeColor('white')
      .stroke();

    doc
      .fontSize(10)
      .fillColor(primaryColor)
      .text('Student', 410, 38)
      .fontSize(14)
      .fillColor(textColor)
      .text(user.name || 'N/A', 410, 52);

    // === MAIN CONTENT ===
    let yPos = 150;

    const addSection = (title, y) => {
      doc
        .fontSize(16)
        .fillColor(secondaryColor)
        .text(title, 50, y);
      return y + 30;
    };

    const addStatCard = (label, value, unit, x, y, width = 160) => {
      doc
        .rect(x, y, width, 70)
        .fill(lightGray)
        .stroke(borderColor);
      doc.lineWidth(1);
      doc.stroke();

      doc
        .fontSize(10)
        .fillColor('#6b7280')
        .text(label, x + 10, y + 10);

      doc
        .fontSize(24)
        .fillColor(primaryColor)
        .text(value.toString(), x + 10, y + 25);

      if (unit) {
        doc
          .fontSize(10)
          .fillColor('#6b7280')
          .text(unit, x + 10, y + 50);
      }
    };

    // === KEY STATS ===
    yPos = addSection('Key Statistics', yPos);

    addStatCard('Completed Today', tasksCompletedToday, 'tasks', 50, yPos);
    addStatCard('Pending Tasks', pendingTasks, 'tasks', 230, yPos);
    addStatCard('Upcoming Deadlines', upcomingDeadlines, 'tasks', 410, yPos);

    yPos += 90;

    // Weekly progress bar
    doc
      .fontSize(12)
      .fillColor(textColor)
      .text('Weekly Progress:', 50, yPos);

    doc
      .rect(50, yPos + 15, 500, 25)
      .fill(lightGray)
      .stroke(borderColor);
    doc.lineWidth(1);
    doc.stroke();

    const barWidth = Math.max(0, Math.min(500, (weeklyProgress / 100) * 500));
    doc
      .rect(50, yPos + 15, barWidth, 25)
      .fill(primaryColor);

    doc
      .fontSize(14)
      .fillColor('white')
      .text(`${weeklyProgress}%`, 50 + 500 / 2 - 15, yPos + 18);

    yPos += 55;

    // === UPCOMING DEADLINES ===
    yPos = addSection('Upcoming Deadlines (Next 7 Days)', yPos);

    if (upcomingTasks.length > 0) {
      upcomingTasks.forEach((task, i) => {
        const taskY = yPos + i * 25;
        if (taskY > 700) {
          doc.addPage();
          yPos = 50;
        }

        doc
          .fontSize(10)
          .fillColor(textColor)
          .text(`• ${task.title}`, 60, taskY)
          .fontSize(8)
          .fillColor('#6b7280')
          .text(`${task.subject} | ${new Date(task.dueDate).toLocaleDateString()} | ${task.priority}`, 60, taskY + 12);
      });
      yPos += upcomingTasks.length * 25 + 10;
    } else {
      doc
        .fontSize(10)
        .fillColor('#6b7280')
        .text('No upcoming deadlines', 60, yPos);
      yPos += 20;
    }

    // === RECENT COMPLETED ===
    yPos = addSection('Recently Completed', yPos);

    if (recentCompleted.length > 0) {
      recentCompleted.forEach((task, i) => {
        const taskY = yPos + i * 25;
        if (taskY > 700) {
          doc.addPage();
          yPos = 50;
        }

        doc
          .fontSize(10)
          .fillColor(textColor)
          .text(`✓ ${task.title}`, 60, taskY)
          .fontSize(8)
          .fillColor('#6b7280')
          .text(`${task.subject} | Completed: ${new Date(task.updatedAt).toLocaleDateString()}`, 60, taskY + 12);
      });
      yPos += recentCompleted.length * 25 + 10;
    } else {
      doc
        .fontSize(10)
        .fillColor('#6b7280')
        .text('No completed tasks this week', 60, yPos);
      yPos += 20;
    }

    // === FOOTER ===
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc
        .fontSize(8)
        .fillColor('#9ca3af')
        .text(`Page ${i + 1}`, 50, doc.page.height - 30)
        .text('Smart Student Tasks - Progress Report', doc.page.width / 2 - 70, doc.page.height - 30)
        .text(new Date().toLocaleDateString(), doc.page.width - 100, doc.page.height - 30);
    }

    // Finalize PDF - ONLY ONCE, at the very end
    doc.end();

  } catch (error) {
    // If doc exists and we haven't ended properly, destroy it
    if (doc && !doc.destroyed) {
      doc.destroy();
    }
    next(error);
  }
};

// Generate shareable report (HTML version)
export const generateShareableReport = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const today = getToday();
    const tomorrow = getTomorrow();
    const weekAgo = getWeekAgo();

    // Fetch user
    const user = await User.findById(userId).select('-password');
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Fetch stats
    const tasksCompletedToday = await Task.countDocuments({
      createdBy: userId,
      status: 'Completed',
      isDeleted: false,
      updatedAt: { $gte: today },
    });

    const pendingTasks = await Task.countDocuments({
      createdBy: userId,
      status: 'Pending',
      isDeleted: false,
    });

    const upcomingDeadlines = await Task.countDocuments({
      createdBy: userId,
      status: 'Pending',
      isDeleted: false,
      dueDate: { $gte: today, $lt: tomorrow },
    });

    const totalWeeklyTasks = await Task.countDocuments({
      createdBy: userId,
      isDeleted: false,
      createdAt: { $gte: weekAgo },
    });

    const completedWeeklyTasks = await Task.countDocuments({
      createdBy: userId,
      status: 'Completed',
      isDeleted: false,
      createdAt: { $gte: weekAgo },
    });

    const weeklyProgress = totalWeeklyTasks > 0
      ? Math.round((completedWeeklyTasks / totalWeeklyTasks) * 100)
      : 0;

    // Generate HTML report
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Progress Report - ${user.name}</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px; text-align: center; }
          .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
          .stat-card { background: #f3f4f6; padding: 15px; border-radius: 8px; text-align: center; }
          .stat-value { font-size: 24px; font-weight: bold; color: #2563eb; }
          .progress-bar { background: #e5e7eb; height: 25px; border-radius: 12px; margin: 10px 0; overflow: hidden; }
          .progress-fill { background: #2563eb; height: 100%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; }
          .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📊 Progress Report</h1>
          <p>${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <h2>${user.name}</h2>
        </div>
        
        <h3>📈 Key Statistics</h3>
        <div class="stats">
          <div class="stat-card">
            <div class="stat-value">${tasksCompletedToday}</div>
            <div>Completed Today</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${pendingTasks}</div>
            <div>Pending Tasks</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${upcomingDeadlines}</div>
            <div>Upcoming Deadlines</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${weeklyProgress}%</div>
            <div>Weekly Progress</div>
          </div>
        </div>

        <h3>📊 Weekly Progress</h3>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${weeklyProgress}%">${weeklyProgress}%</div>
        </div>

        <div class="footer">
          <p>Generated by Smart Student Tasks</p>
          <p>${new Date().toLocaleString()}</p>
        </div>
      </body>
      </html>
    `;

    res.status(200).send(html);

  } catch (error) {
    next(error);
  }
};
