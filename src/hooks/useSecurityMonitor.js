import { useEffect, useState } from 'react';
import { auditLogger } from '../utils/auditLogger';

/**
 * Security monitoring hook
 * Monitors for suspicious activity and security violations
 */
export function useSecurityMonitor() {
  const [violations, setViolations] = useState([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    if (import.meta.env.VITE_ENVIRONMENT !== 'production') return;

    setIsMonitoring(true);

    // Monitor for rapid failed login attempts
    const loginAttempts = new Map();
    const MAX_ATTEMPTS = 5;
    const WINDOW_MS = 300000; // 5 minutes

    const checkLoginAttempts = (userId) => {
      const now = Date.now();
      const attempts = loginAttempts.get(userId) || [];
      
      // Remove old attempts
      const recentAttempts = attempts.filter(time => now - time < WINDOW_MS);
      
      if (recentAttempts.length >= MAX_ATTEMPTS) {
        const violation = {
          type: 'brute_force_attempt',
          userId,
          attempts: recentAttempts.length,
          timestamp: new Date().toISOString()
        };
        
        setViolations(prev => [...prev, violation]);
        auditLogger.logViolation('brute_force_attempt', violation);
        
        return true;
      }
      
      recentAttempts.push(now);
      loginAttempts.set(userId, recentAttempts);
      return false;
    };

    // Monitor for suspicious navigation patterns
    let navigationCount = 0;
    const navigationWindow = 10000; // 10 seconds
    let navigationTimer;

    const checkNavigationPattern = () => {
      navigationCount++;
      
      if (navigationCount > 20) {
        const violation = {
          type: 'suspicious_navigation',
          count: navigationCount,
          timestamp: new Date().toISOString()
        };
        
        setViolations(prev => [...prev, violation]);
        auditLogger.logViolation('suspicious_navigation', violation);
      }
      
      clearTimeout(navigationTimer);
      navigationTimer = setTimeout(() => {
        navigationCount = 0;
      }, navigationWindow);
    };

    // Monitor for DevTools
    const detectDevTools = () => {
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      
      if (widthThreshold || heightThreshold) {
        auditLogger.log({
          category: 'security_info',
          action: 'devtools_detected',
          severity: 'low'
        });
      }
    };

    // Set up listeners
    window.addEventListener('popstate', checkNavigationPattern);
    const devToolsInterval = setInterval(detectDevTools, 1000);

    // Cleanup
    return () => {
      setIsMonitoring(false);
      window.removeEventListener('popstate', checkNavigationPattern);
      clearInterval(devToolsInterval);
      clearTimeout(navigationTimer);
    };
  }, []);

  return {
    violations,
    isMonitoring,
    clearViolations: () => setViolations([])
  };
}
