# Java Development Kit (JDK) Setup Guide

## Problem
The Android build is failing with the error:
```
The operation couldn't be completed. Unable to locate a Java Runtime.
Please visit http://www.java.com for information on installing Java.
```

## Root Cause
Android development requires a Java Development Kit (JDK) to be installed on the system. The current system doesn't have Java installed or it's not properly configured.

## Solution

### Option 1: Install OpenJDK (Recommended)
OpenJDK is the recommended Java distribution for Android development.

#### Using Homebrew (Easiest):
```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install OpenJDK 17 (recommended for Android development)
brew install openjdk@17

# Create symlink for system Java
sudo ln -sfn /opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-17.jdk
```

#### Manual Download:
1. Visit [OpenJDK Downloads](https://jdk.java.net/17/)
2. Download the macOS/AArch64 version (for Apple Silicon) or macOS/x64 (for Intel)
3. Extract and install the JDK

### Option 2: Install Oracle JDK
1. Visit [Oracle Java Downloads](https://www.oracle.com/java/technologies/downloads/)
2. Download Java 17 or 11 for macOS
3. Run the installer

## Environment Configuration

After installing Java, configure your environment:

### 1. Set JAVA_HOME
Add to your shell profile (`~/.zshrc` or `~/.bash_profile`):

```bash
# For OpenJDK 17 via Homebrew
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home

# For Oracle JDK (adjust version as needed)
# export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-17.jdk/Contents/Home

# Add Java to PATH
export PATH=$JAVA_HOME/bin:$PATH
```

### 2. Reload Shell Configuration
```bash
source ~/.zshrc
# or
source ~/.bash_profile
```

### 3. Verify Installation
```bash
java -version
javac -version
echo $JAVA_HOME
```

Expected output:
```
java -version
openjdk version "17.0.x" 2023-xx-xx
OpenJDK Runtime Environment (build 17.0.x+x)
OpenJDK 64-Bit Server VM (build 17.0.x+x, mixed mode, sharing)
```

## Android Development Setup

### Complete Environment Variables
Add these to your shell profile for full Android development setup:

```bash
# Java
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home

# Android SDK
export ANDROID_HOME=/Users/shakthi./Library/Android/sdk
export ANDROID_SDK_ROOT=$ANDROID_HOME

# PATH
export PATH=$JAVA_HOME/bin:$PATH
export PATH=$ANDROID_HOME/platform-tools:$PATH
export PATH=$ANDROID_HOME/tools:$PATH
export PATH=$ANDROID_HOME/tools/bin:$PATH
```

## Testing the Setup

After installing Java, test the Android build:

```bash
# Navigate to project
cd /Users/shakthi./Downloads/Playgram

# Build the project
npm run build
npm run mobile:sync

# Test Android build
cd android
./gradlew assembleDebug
```

## Troubleshooting

### Issue: "JAVA_HOME not set"
**Solution**: Ensure JAVA_HOME is properly set in your shell profile and reload it.

### Issue: "Wrong Java version"
**Solution**: Android requires Java 8, 11, or 17. Check your version:
```bash
java -version
```

### Issue: "Permission denied"
**Solution**: Ensure proper permissions:
```bash
sudo chmod +x ./gradlew
```

### Issue: "Gradle daemon issues"
**Solution**: Clean Gradle cache:
```bash
./gradlew clean
./gradlew --stop
```

## Recommended Java Versions for Android

| Android Gradle Plugin | Recommended Java Version |
|----------------------|-------------------------|
| 8.0+ | Java 17 |
| 7.0 - 7.4 | Java 11 or 17 |
| 4.2 - 6.x | Java 8 or 11 |

## Quick Setup Script

Create and run this script for automated setup:

```bash
#!/bin/bash
# save as setup-java.sh

echo "Installing OpenJDK 17..."
brew install openjdk@17

echo "Creating system symlink..."
sudo ln -sfn /opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-17.jdk

echo "Setting up environment variables..."
echo 'export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home' >> ~/.zshrc
echo 'export PATH=$JAVA_HOME/bin:$PATH' >> ~/.zshrc

echo "Reloading shell configuration..."
source ~/.zshrc

echo "Verifying installation..."
java -version

echo "Java setup complete!"
```

Run with:
```bash
chmod +x setup-java.sh
./setup-java.sh
```

## Next Steps

After Java is installed:
1. ✅ Verify Java installation with `java -version`
2. ✅ Test Android build with `./gradlew assembleDebug`
3. ✅ Run Capacitor sync: `npm run mobile:sync`
4. ✅ Build and test the app: `npm run android`

This will resolve the Java Runtime error and enable Android development for the Playgram project.