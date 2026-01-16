#!/bin/bash
# Setup git hooks for version management

if [ ! -d ".git" ]; then
    echo "⚠️  Not a git repository. Initialize git first with: git init"
    exit 1
fi

# Create hooks directory if it doesn't exist
mkdir -p .git/hooks

# Create pre-commit hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/sh
# Pre-commit hook to ensure version is injected before commit

# Run the version injection script
node scripts/inject-version.js

# Add the updated file to the commit
git add public/test-page.html

exit 0
EOF

# Make it executable
chmod +x .git/hooks/pre-commit

echo "✓ Git pre-commit hook installed"
echo "  The version will now be automatically updated from package.json before each commit"

