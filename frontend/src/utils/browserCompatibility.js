// Browser compatibility utilities for Paystack integration

export const detectBrowserIssues = () => {
  const issues = [];
  const userAgent = navigator.userAgent.toLowerCase();
  
  // Check for Chrome fingerprinting protection
  if (userAgent.includes('chrome') && window.chrome && window.chrome.privacy) {
    issues.push({
      type: 'fingerprinting_protection',
      severity: 'high',
      message: 'Chrome fingerprinting protection may block payment processing',
      solution: 'Disable fingerprinting protection in Chrome flags or use incognito mode'
    });
  }
  
  // Check for ad blockers
  if (window.adblock || window.uBlock || window.AdBlock || window.adblockplus) {
    issues.push({
      type: 'ad_blocker',
      severity: 'medium',
      message: 'Ad blocker detected - may interfere with payment processing',
      solution: 'Temporarily disable ad blocker for this site'
    });
  }
  
  // Check for privacy extensions
  if (window.privacyBadger || window.ghostery || window.disconnect) {
    issues.push({
      type: 'privacy_extension',
      severity: 'medium',
      message: 'Privacy extension detected - may block payment scripts',
      solution: 'Temporarily disable privacy extensions or whitelist this site'
    });
  }
  
  // Check for Firefox Enhanced Tracking Protection
  if (userAgent.includes('firefox') && window.navigator.doNotTrack === '1') {
    issues.push({
      type: 'tracking_protection',
      severity: 'medium',
      message: 'Firefox Enhanced Tracking Protection may block payment processing',
      solution: 'Disable Enhanced Tracking Protection for this site'
    });
  }
  
  return issues;
};

export const getBrowserCompatibilityScore = () => {
  const issues = detectBrowserIssues();
  const highSeverityIssues = issues.filter(issue => issue.severity === 'high').length;
  const mediumSeverityIssues = issues.filter(issue => issue.severity === 'medium').length;
  
  // Calculate compatibility score (0-100)
  let score = 100;
  score -= highSeverityIssues * 30; // High severity issues reduce score significantly
  score -= mediumSeverityIssues * 15; // Medium severity issues reduce score moderately
  
  return Math.max(0, score);
};

export const getCompatibilityRecommendations = () => {
  const issues = detectBrowserIssues();
  const recommendations = [];
  
  if (issues.length === 0) {
    recommendations.push({
      type: 'success',
      message: 'Your browser is fully compatible with our payment system',
      action: 'none'
    });
    return recommendations;
  }
  
  // Generate recommendations based on detected issues
  issues.forEach(issue => {
    switch (issue.type) {
      case 'fingerprinting_protection':
        recommendations.push({
          type: 'warning',
          message: 'Chrome fingerprinting protection detected',
          action: 'disable_fingerprinting',
          steps: [
            'Go to chrome://flags/#enable-fingerprinting-protection-blocklist',
            'Set the flag to "Disabled"',
            'Restart Chrome and try again'
          ]
        });
        break;
        
      case 'ad_blocker':
        recommendations.push({
          type: 'info',
          message: 'Ad blocker detected',
          action: 'disable_adblock',
          steps: [
            'Click on your ad blocker extension icon',
            'Select "Disable on this site" or "Whitelist this site"',
            'Refresh the page and try again'
          ]
        });
        break;
        
      case 'privacy_extension':
        recommendations.push({
          type: 'info',
          message: 'Privacy extension detected',
          action: 'disable_privacy_extension',
          steps: [
            'Click on your privacy extension icon',
            'Add this site to whitelist or trusted sites',
            'Refresh the page and try again'
          ]
        });
        break;
        
      case 'tracking_protection':
        recommendations.push({
          type: 'info',
          message: 'Firefox Enhanced Tracking Protection detected',
          action: 'disable_tracking_protection',
          steps: [
            'Click the shield icon in the address bar',
            'Turn off Enhanced Tracking Protection for this site',
            'Refresh the page and try again'
          ]
        });
        break;
    }
  });
  
  // Add fallback recommendation
  recommendations.push({
    type: 'fallback',
    message: 'If issues persist, try these alternatives',
    action: 'alternative_methods',
    steps: [
      'Open an incognito/private browsing window',
      'Copy and paste this URL in the new window',
      'Try the payment process again',
      'If still having issues, try a different browser'
    ]
  });
  
  return recommendations;
};

export const isPaymentLikelyToWork = () => {
  const score = getBrowserCompatibilityScore();
  return score >= 70; // 70% compatibility threshold
};
