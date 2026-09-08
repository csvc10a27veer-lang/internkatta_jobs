// frontend/src/utils/authMigration.js

/**
 * Migration utility to handle transition from shared auth to separate user/admin auth
 * This should be called once when the app loads to migrate existing auth data
 */

export const migrateAuthData = () => {
  try {
    // Check if old auth data exists
    const oldAuthData = localStorage.getItem('auth');
    
    if (oldAuthData) {
      const parsedData = JSON.parse(oldAuthData);
      
      // If it's user data, migrate to userAuth
      if (parsedData.user && parsedData.user.role === 'user') {
        localStorage.setItem('userAuth', oldAuthData);
        console.log('Migrated user auth data');
      }
      
      // If it's admin data, migrate to adminAuth
      if (parsedData.user && parsedData.user.role === 'admin') {
        // Convert user structure to admin structure
        const adminData = {
          admin: {
            _id: parsedData.user._id,
            fullName: parsedData.user.fullName,
            email: parsedData.user.email,
            role: parsedData.user.role,
          },
          token: parsedData.token,
        };
        localStorage.setItem('adminAuth', JSON.stringify(adminData));
        console.log('Migrated admin auth data');
      }
      
      // Remove old auth data
      localStorage.removeItem('auth');
      console.log('Removed old auth data');
    }
  } catch (error) {
    console.error('Error during auth migration:', error);
    // Clear corrupted data
    localStorage.removeItem('auth');
  }
};

/**
 * Clear all auth data (useful for debugging or resetting)
 */
export const clearAllAuthData = () => {
  localStorage.removeItem('auth');
  localStorage.removeItem('userAuth');
  localStorage.removeItem('adminAuth');
  console.log('Cleared all auth data');
};

/**
 * Check if migration is needed
 */
export const needsMigration = () => {
  return localStorage.getItem('auth') !== null;
};
