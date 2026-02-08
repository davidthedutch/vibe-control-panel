# Health Checks - Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Start the Server

```bash
cd apps/web
npm install  # if you haven't already
npm run dev
```

Wait for server to start on http://localhost:3000

### Step 2: Open Health Checks

Navigate to: **http://localhost:3000/health**

You should see:
- Health Checks page header
- "Run Checks" button (top right)
- Empty state message

### Step 3: Run Your First Check

1. Click the **"Run Checks"** button
2. Wait 2-5 seconds (you'll see a spinner)
3. View your results:
   - Overall health score (large circle)
   - Individual check results (grid below)
   - History chart (showing trends)

## 📊 What You'll See

### Overall Score

Large circular indicator showing 0-100:
- 🟢 **80-100** = Healthy (green)
- 🟡 **50-79** = Needs Attention (amber)
- 🔴 **0-49** = Critical Issues (red)

### Check Results

8 health checks will appear in cards:

1. **Token Consistency** - Finds hardcoded colors/sizes
2. **Manifest Sync** - Validates SITE_MANIFEST.json
3. **Broken Imports** - Detects missing import files
4. **Broken Links** - Checks internal route links
5. **Broken Images** - Validates image references
6. **Console Errors** - Runtime error detection*
7. **Accessibility** - Missing alt text, aria-labels
8. **Performance** - Core Web Vitals metrics*

*Requires additional setup (see HEALTH_CHECKS_README.md)

### Each Card Shows

- ✅ **Status badge** - Pass/Warn/Fail
- 📊 **Score** - 0-100 points
- 📝 **Summary** - Quick description
- 🔍 **Details** - Click to expand for specifics

## 🔔 Using Notifications

### View Notifications

1. Click the **bell icon** (🔔) in header
2. Badge shows unread count
3. See all alerts for:
   - Failed checks
   - Warnings
   - Score drops

### Configure Alerts

1. Click the **settings icon** (⚙️)
2. Toggle notification options:
   - Enable/disable notifications
   - Choose what to be notified about
   - Set score drop threshold
3. Click **"Save"**

## 📈 History Tracking

After running checks multiple times:
- Chart shows score trends over 30 days
- Each point represents a check run
- Hover to see exact scores
- Watch your score improve over time!

## 🧪 Test the System

Run the test script to verify everything works:

```bash
cd apps/web
node test-health-checks.js
```

Expected output:
```
🧪 Testing Health Checks API

1️⃣  Running health checks...
✅ Health checks completed successfully
   Overall Score: 85
   Checks: 8
   ✅ Token Consistentie: 100 (pass)
   ✅ Manifest Sync: 100 (pass)
   ...

2️⃣  Fetching history...
✅ History fetched successfully
   Entries: 1

3️⃣  Fetching notifications...
✅ Notifications fetched successfully
   Total: 0
   Unread: 0

✨ All tests completed!
```

## 🔧 Common Issues

### "Cannot connect to server"

**Problem**: Test script can't reach the server

**Solution**: Make sure dev server is running:
```bash
cd apps/web
npm run dev
```

### "Health check failed"

**Problem**: API route error

**Solution**: Check the terminal running `npm run dev` for error details

### No history showing

**Problem**: First time running

**Solution**: History builds up over multiple runs. Run checks a few times to see the chart populate.

### Checks taking too long

**Problem**: Large codebase

**Solution**: Normal for first run. Checks scan all files in `src/`. Subsequent runs are cached by Node.js.

## 📚 Learn More

- **Full Documentation**: See `HEALTH_CHECKS_README.md`
- **Implementation Details**: See `HEALTH_CHECKS_IMPLEMENTATION.md`
- **API Reference**: Check API routes in `/api/health/`
- **Add Custom Checks**: See "Extending the System" in README

## 💡 Pro Tips

1. **Run after changes**: Click "Run Checks" after making code changes to see impact on health score

2. **Focus on fails first**: Red cards are critical - expand them to see exactly what needs fixing

3. **Track improvements**: Watch your score increase as you fix issues

4. **Set up auto-run**: Add to CI/CD to catch issues before they reach production

5. **Configure notifications**: Set thresholds that work for your team

6. **Review history**: Use the chart to see if technical debt is increasing or decreasing

## 🎯 Next Steps

1. ✅ Run your first health check
2. ✅ Fix any critical issues (red cards)
3. ✅ Address warnings (amber cards)
4. ✅ Configure notification preferences
5. ✅ Add to CI/CD pipeline
6. ✅ Monitor trends weekly

## 🤝 Need Help?

Check these resources:
- `HEALTH_CHECKS_README.md` - Detailed documentation
- `HEALTH_CHECKS_IMPLEMENTATION.md` - Technical details
- Check source code in `src/lib/health/checks/` for specific checks
- Run test script to verify API endpoints

---

**Ready?** Start the server and navigate to `/health` to begin! 🚀
