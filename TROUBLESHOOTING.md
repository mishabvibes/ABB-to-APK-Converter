# Troubleshooting Guide

## Java Detection Issues

### Problem: "Java is not installed or not found in PATH"

Even though Java is installed and `java -version` works in your terminal, Next.js might not find it.

### Solutions:

#### Solution 1: Restart Your Development Server
The Node.js process needs to pick up your environment variables:
```bash
# Stop the server (Ctrl+C)
# Then restart it
npm run dev
```

#### Solution 2: Set JAVA_HOME Environment Variable
1. **Find your Java installation path:**
   ```bash
   where java
   # Or on Windows, check: C:\Program Files\Java\
   ```

2. **Set JAVA_HOME:**
   - **Windows:**
     - Open System Properties → Environment Variables
     - Add new System Variable:
       - Name: `JAVA_HOME`
       - Value: `C:\Program Files\Java\jdk-17` (or your Java path)
     - Restart your terminal/IDE
   
   - **macOS/Linux:**
     ```bash
     export JAVA_HOME=/usr/lib/jvm/java-17-openjdk
     export PATH=$JAVA_HOME/bin:$PATH
     ```

3. **Restart the development server**

#### Solution 3: Verify Java is in System PATH
1. **Windows:**
   - Open System Properties → Environment Variables
   - Under "System variables", find "Path"
   - Ensure Java bin directory is listed (e.g., `C:\Program Files\Java\jdk-17\bin`)
   - If not, add it and restart

2. **Verify:**
   ```bash
   java -version
   where java  # Windows
   which java  # macOS/Linux
   ```

#### Solution 4: Run Next.js with Explicit Java Path
If Java is installed but not in PATH, you can modify the code to use the full path.

#### Solution 5: Check Next.js Process Environment
The issue might be that Next.js is running with a different environment. Try:

1. **Close all terminals/IDEs**
2. **Open a new terminal as Administrator** (Windows) or with proper permissions
3. **Navigate to project directory**
4. **Run:** `npm run dev`

### Debugging Java Detection

The improved Java detection now tries multiple methods:
1. Direct `java` command
2. JAVA_HOME environment variable
3. Windows `where` command
4. Common installation paths
5. Dynamic search in Java directories

Check the server console logs for:
```
Java found: [path]
```
or
```
Java check failed: [error]
```

### Still Not Working?

If Java still isn't detected:

1. **Check server logs** for detailed error messages
2. **Verify Java installation:**
   ```bash
   java -version
   javac -version  # If JDK is installed
   ```

3. **Check if Java works from the project directory:**
   ```bash
   cd E:\Code\Web\Abb-to-apk
   java -version
   ```

4. **Try running bundletool manually:**
   ```bash
   java -jar tools/bundletool.jar version
   ```

## Other Common Issues

### Issue: "Bundletool download fails"
- **Solution:** Check internet connection
- **Alternative:** Manually download bundletool and place it in `tools/bundletool.jar`

### Issue: "Conversion timeout"
- **Solution:** Large files take time. Current timeout is 10 minutes.
- **Check:** Server logs for progress

### Issue: "APK extraction fails"
- **Solution:** Check server logs for detailed error
- **Verify:** AAB file is not corrupted
- **Check:** Sufficient disk space

### Issue: "File too large"
- **Solution:** Current limit is 200MB. For larger files, increase the limit in `app/api/convert/route.ts`

## Getting Help

If you're still experiencing issues:
1. Check the server console for error messages
2. Verify all prerequisites are installed
3. Check file permissions
4. Ensure sufficient disk space
5. Review the error messages in the browser

