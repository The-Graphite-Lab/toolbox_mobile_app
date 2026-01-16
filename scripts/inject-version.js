#!/usr/bin/env node

/**
 * Script to inject version from package.json into test-page.html
 * This ensures the version stays in sync automatically
 */

const fs = require('fs');
const path = require('path');

// Read package.json to get version
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version;

if (!version) {
    console.error('❌ No version found in package.json');
    process.exit(1);
}

/**
 * Inject version into an HTML file
 */
function injectVersionIntoFile(filePath) {
    if (!fs.existsSync(filePath)) {
        console.warn(`⚠️  File not found: ${filePath}`);
        return false;
    }

    // Read the HTML file
    let htmlContent = fs.readFileSync(filePath, 'utf8');
    let updated = false;

    // Replace version in the badge (id="versionBadge") - more flexible regex
    const badgePattern = /(<span class="version-badge" id="versionBadge">)v[\d.]+(<\/span>)/;
    if (badgePattern.test(htmlContent)) {
        htmlContent = htmlContent.replace(badgePattern, `$1v${version}$2`);
        updated = true;
    } else {
        console.warn(`⚠️  Version badge pattern not found in ${filePath}`);
    }

    // Note: Dev info uses template literal ${version}, so it's automatically updated
    // when we update the JavaScript variable below. No need to update it separately.

    // Also replace in the JavaScript updateDevInfo function - more flexible
    const jsVersionPattern = /(const version = ')[\d.]+(';)/;
    if (jsVersionPattern.test(htmlContent)) {
        htmlContent = htmlContent.replace(jsVersionPattern, `$1${version}$2`);
        updated = true;
    } else {
        console.warn(`⚠️  JavaScript version variable pattern not found in ${filePath}`);
    }

    // Write back to file
    fs.writeFileSync(filePath, htmlContent, 'utf8');
    return updated;
}

// Update public/test-page.html
const publicTestPagePath = path.join(__dirname, '..', 'public', 'test-page.html');
const publicUpdated = injectVersionIntoFile(publicTestPagePath);

if (publicUpdated) {
    console.log(`✓ Version ${version} injected into public/test-page.html`);
} else {
    console.warn(`⚠️  Could not update public/test-page.html`);
}

// Also update out/test-page.html if it exists (after build)
const outTestPagePath = path.join(__dirname, '..', 'out', 'test-page.html');
if (fs.existsSync(outTestPagePath)) {
    const outUpdated = injectVersionIntoFile(outTestPagePath);
    if (outUpdated) {
        console.log(`✓ Version ${version} injected into out/test-page.html`);
    }
}

